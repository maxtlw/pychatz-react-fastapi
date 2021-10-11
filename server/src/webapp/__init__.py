from typing import List

from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, ExpiredSignatureError
from sqlalchemy.orm import Session
from webapp.connection_manager import ConnectionManager
from webapp.db import DataAccessLayer
from webapp.schemas import UserCreate, User, Message
from webapp.security import create_access_token, decode_token
from webapp.services import authenticate_user, UserDoesNotExist, WrongPassword, insert_new_user, UserAlreadyExists, \
    query_users, query_messages

# TODO: handle tokens when user gets deleted

app = FastAPI()
app.add_middleware(CORSMiddleware,
                   allow_origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"],
                   )

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')

SQLALCHEMY_DATABASE_URL = 'sqlite:///database.db'
dal = DataAccessLayer(SQLALCHEMY_DATABASE_URL, echo=False)
dal.connect()

manager = ConnectionManager()


def _get_unauthorized_exception(detail: str = ''):
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = _get_unauthorized_exception(detail="Could not validate credentials")
    try:
        payload = decode_token(token)
        username: str = payload.get('sub')
        if username is None:
            raise credentials_exception
        # CHECK THAT IT EXISTS IN THE DATABASE TOO! (wasn't cancelled)
        return username
    except ExpiredSignatureError:
        raise _get_unauthorized_exception(detail='Signature expired')
    except JWTError:
        raise credentials_exception


async def get_current_user_sockets(token: str):
    try:
        payload = decode_token(token)
        username: str = payload.get('sub')
        return username
    except ExpiredSignatureError:
        return None
    except JWTError:
        return None


@app.post('/signin')
async def signup(user: UserCreate, db_session: Session = Depends(dal.generate_session)):
    try:
        insert_new_user(db_session, user)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Username too long"
        )
    except UserAlreadyExists:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Username already existent"
        )


@app.post('/token')
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),
                                 db_session: Session = Depends(dal.generate_session)):
    try:
        user = authenticate_user(db_session, form_data.username, form_data.password)
    except UserDoesNotExist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Username {form_data.username} not found.")
    except WrongPassword:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Wrong password.")
    access_token = create_access_token(
        data={'sub': user.username}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/user")
async def read_users_me(current_username: str = Depends(get_current_user)):
    return {"current_user": current_username}


@app.get("/users", response_model=List[User])
async def read_all_users(
    query: str = Query(''),
    current_username: str = Depends(get_current_user),
    db_session: Session = Depends(dal.generate_session)
):
    return query_users(db_session, query, current_username)


@app.get("/messages", response_model=List[Message])
async def read_user_messages(
    other: str = Query(...),
    current_username: str = Depends(get_current_user),
    db_session: Session = Depends(dal.generate_session)
):
    return query_messages(db_session, other, current_username)


@app.websocket("/ws/{token}")   # TODO: VALIDATION + Handle errors/exceptions
async def websocket_endpoint(websocket: WebSocket,
                             current_user: str = Depends(get_current_user_sockets),
                             db_session: Session = Depends(dal.generate_session)
                             ):
    try:
        await manager.connect(current_user, websocket)
        while True:
            data = await websocket.receive_json()
            await manager.handle(db_session, data, current_user)
    except WebSocketDisconnect:
        await manager.disconnect(current_user)
