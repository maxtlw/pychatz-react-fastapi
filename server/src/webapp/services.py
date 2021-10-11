from datetime import datetime

from sqlalchemy import or_, and_, not_
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.orm import Session
from webapp.config import DB_CONFIG
from webapp.models import Message
from webapp.security import get_password_hash, verify_password

from . import models, schemas


class UserAlreadyExists(Exception):
    pass


class UserDoesNotExist(Exception):
    pass


class WrongPassword(Exception):
    pass


def insert_new_user(db: Session, user: schemas.UserCreate):
    if len(user.username) > DB_CONFIG.max_username_length:
        raise ValueError(f'Username is too long ({len(user.username)} characters - '
                         f'maximum is {DB_CONFIG.max_username_length}')

    hashed_password = get_password_hash(user.plain_password)
    user = models.User(username=user.username, hashed_password=hashed_password)

    try:
        db.add(user)
        db.commit()
        return True
    except IntegrityError:
        db.rollback()
        raise UserAlreadyExists(f'User {user.username} alredy exists in the database.')


def authenticate_user(db: Session, username: str, password: str):
    try:
        user = db.query(models.User).filter(models.User.username == username).one()
    except NoResultFound:
        raise UserDoesNotExist
    if not verify_password(password, user.hashed_password):
        raise WrongPassword
    return user


def query_users(db: Session, query: str, username: str):
    username = username.strip().lower()
    users_query = db.query(models.User).filter(models.User.username != username)
    if query != ' ':
        users_query = users_query.filter(models.User.username.ilike(f'%{query}%'))
    return users_query.all()


def query_messages(db: Session, other_username: str, username: str):
    username = username.strip().lower()
    other_username = other_username.strip().lower()
    all_messages = db.query(models.Message) \
        .filter(
        and_(
            or_(
                and_(models.Message.sender_username == username,
                     models.Message.receiver_username == other_username),
                and_(models.Message.sender_username == other_username, models.Message.receiver_username == username)
            ),
            not_(models.Message.deleted)
        )
    ) \
        .order_by(models.Message.timestamp) \
        .all()
    return all_messages


def user_exists(db: Session, username: str):
    try:
        _ = db.query(models.User).filter(models.User.username == username).one()
    except NoResultFound:
        raise ValueError(f'Username {username} does not exist.')


def insert_new_message(db: Session, message_content, current_user: str, receiver_username: str):
    message_to_save = Message(content=message_content,
                              timestamp=datetime.utcnow().timestamp(),
                              sender_username=current_user,
                              receiver_username=receiver_username)
    db.add(message_to_save)
    db.commit()
    return message_to_save


def mark_message_as_deleted(db: Session, id: int, current_user: str):
    try:
        message_to_delete = db.query(Message) \
            .filter(Message.id == id) \
            .filter(Message.sender_username == current_user) \
            .one()
        message_to_delete.deleted = True
        db.commit()
        return message_to_delete
    except NoResultFound:
        raise ValueError(f'Impossibile to delete the required message (id={id})')
