from typing import Dict

from fastapi import WebSocket
from sqlalchemy.orm import Session
from webapp.services import insert_new_message, mark_message_as_deleted, user_exists
from webapp.socket_models import SocketRequest, ChangePeerRequest, PrivateMessageRequest, DeleteMessageRequest, \
    PrivateMessageResponse, PrivateMessageSentAck, DeleteMessageResponse, UserConnectedAck, UserDisconnectedAck


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.talking_to: Dict[str, str] = {}

    async def connect(self, current_user: str, websocket: WebSocket):
        await websocket.accept()

        # Inform other users of the connection and get informed
        user_connected_message = UserConnectedAck(username=current_user)
        for other_user, other_user_socket in self.active_connections.items():
            await other_user_socket.send_json(user_connected_message.dict())
            other_connected_message = UserConnectedAck(username=other_user)
            await websocket.send_json(other_connected_message.dict())

        self.active_connections[current_user] = websocket

    async def handle(self, db_session: Session, data, current_user):
        if current_user not in self.active_connections:
            raise Exception('The source user/websocket is not currently connected!')
        # Validate user
        socket_request = SocketRequest.parse_obj(data)
        if socket_request.type == 'CHANGE_PEER':
            change_peer_request = ChangePeerRequest.parse_obj(data)
            self.change_private_peer(change_peer_request, current_user, db_session)
        elif socket_request.type == 'MESSAGE':
            private_message_request = PrivateMessageRequest.parse_obj(data)
            await self.send_personal_message(private_message_request, current_user, db_session)
        elif socket_request.type == 'DELETE_MESSAGE':
            delete_message_request = DeleteMessageRequest.parse_obj(data)
            await self.delete_personal_message(delete_message_request, current_user, db_session)

    async def disconnect(self, current_user: str):
        await self.active_connections[current_user].close()
        self.active_connections.pop(current_user)
        # Inform other users
        for receiver_socket in self.active_connections.values():
            user_connected_message = UserDisconnectedAck(username=current_user)
            await receiver_socket.send_json(user_connected_message.dict())

    def change_private_peer(self, change_peer_request: ChangePeerRequest, current_user: str, db_session: Session):
        if change_peer_request.new_peer == current_user:
            raise ValueError('Tried to change peer with the user itself')
        user_exists(db_session, current_user)
        self.talking_to[current_user] = change_peer_request.new_peer

    async def send_personal_message(self,
                                    private_message_request: PrivateMessageRequest,
                                    current_user: str,
                                    db_session
                                    ):
        if current_user not in self.active_connections:
            raise Exception('The source user/websocket is not currently connected!')

        receiver_username = self.talking_to[current_user]

        try:
            message_to_save = insert_new_message(db_session,
                                                 private_message_request.text,
                                                 current_user,
                                                 receiver_username
                                                 )
        except Exception as e:
            print(e)
            return

        if receiver_username in self.active_connections:
            receiver_socket = self.active_connections[receiver_username]
            message = PrivateMessageResponse(
                id=message_to_save.id,
                text=message_to_save.content,
                sender=message_to_save.sender_username,
                receiver=message_to_save.receiver_username,
                timestamp=message_to_save.timestamp
            )
            await receiver_socket.send_json(message.dict())

        # Acknowledge the sender
        sender_socket = self.active_connections[current_user]
        ack_message = PrivateMessageSentAck(
            id=message_to_save.id,
            receiver=message_to_save.receiver_username,
            timestamp=message_to_save.timestamp
        )
        await sender_socket.send_json(ack_message.dict())

    async def delete_personal_message(self, delete_message_request: DeleteMessageRequest, current_user, db_session):
        if current_user not in self.active_connections:
            raise Exception('The source user/websocket is not currently connected!')

        id_to_delete = delete_message_request.id
        deleted_message = mark_message_as_deleted(db_session, id_to_delete, current_user)
        receiver_username = deleted_message.receiver_username

        # Inform peers
        deletion_ack_message = DeleteMessageResponse(id=id_to_delete)

        if current_user in self.active_connections:
            current_user_socket = self.active_connections[current_user]
            await current_user_socket.send_json(deletion_ack_message.dict())

        if receiver_username in self.active_connections:
            receiver_socket = self.active_connections[receiver_username]
            await receiver_socket.send_json(deletion_ack_message.dict())
