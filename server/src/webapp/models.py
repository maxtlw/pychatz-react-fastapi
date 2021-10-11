from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from webapp.config import DB_CONFIG
from webapp.db import Base


class User(Base):   # type: ignore
    __tablename__ = 'user_account'

    username = Column(String(DB_CONFIG.max_username_length), primary_key=True)
    hashed_password = Column(String(256), nullable=False)

    def __repr__(self):
        return f'User(id={self.id}, username={self.username}, password={self.password})'


class Message(Base):    # type: ignore
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True)
    timestamp = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    sender_username = Column(Integer, ForeignKey('user_account.username'), nullable=False)
    receiver_username = Column(Integer, ForeignKey('user_account.username'), nullable=False)
    deleted = Column(Boolean, default=False, nullable=False)

    def __repr__(self):
        return f'Message({self.sender_id} => {self.receiver_id} @ {self.created_ts}, content={self.content})'

    sender = relationship('User', foreign_keys=[sender_username], backref='sent_messages', uselist=False)
    receiver = relationship('User', foreign_keys=[receiver_username], backref='received_messages', uselist=False)
