from pydantic import BaseModel


class SocketResponse(BaseModel):
    type: str


class PrivateMessageSentAck(SocketResponse):
    type = 'ACK'
    id: int
    receiver: str
    timestamp: int


class PrivateMessageResponse(SocketResponse):
    type = 'MESSAGE'
    id: int
    text: str
    sender: str
    receiver: str
    timestamp: int


class DeleteMessageResponse(SocketResponse):
    type = 'MESSAGE_DELETED'
    id: int


class UserConnectedAck(SocketResponse):
    type = 'USER_CONNECTED'
    username: str


class UserDisconnectedAck(SocketResponse):
    type = 'USER_DISCONNECTED'
    username: str


class SocketRequest(BaseModel):
    type: str


class ChangePeerRequest(SocketRequest):
    type = 'CHANGE_PEER'
    new_peer: str


class PrivateMessageRequest(SocketRequest):
    type = 'MESSAGE'
    text: str


class DeleteMessageRequest(SocketRequest):
    type = 'DELETE_MESSAGE'
    id: int
