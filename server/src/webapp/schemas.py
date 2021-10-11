from pydantic import BaseModel


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    plain_password: str


class User(UserBase):
    class Config:
        orm_mode = True


class MessageBase(BaseModel):
    id: int
    content: str
    sender: User
    receiver: User
    timestamp: int


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    pass

    class Config:
        orm_mode = True
