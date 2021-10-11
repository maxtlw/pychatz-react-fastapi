import { w3cwebsocket as W3CWebSocket } from "websocket";

class ChatSocket {
  constructor(address) {
    this.callbacks = {}; // Callbacks receive the (entire) parsed message
    this.ws = this.buildSocket(address);
  }

  buildSocket(address) {
    const socket = new W3CWebSocket(address);
    socket.onopen = () => {
      console.log("WebSocket Client Connected");
    };
    socket.onmessage = this.handleReceivedMessage.bind(this);
    socket.onclose = () => {
      console.log("WebSocket Client Disconnected");
    };
    return socket;
  }

  handleReceivedMessage(message) {
    if (this.callbacks == null) {
      throw Error("Callbacks list is not defined.");
    }

    const parsedMessage = JSON.parse(message.data);
    const callbackToCall = this.callbacks[parsedMessage.type];

    if (callbackToCall == null) {
      console.log(parsedMessage);
      return;
    }

    callbackToCall(parsedMessage);
  }

  registerCallback(message_type, callback) {
    this.callbacks = { ...this.callbacks, [message_type]: callback };
  }

  sendChangePeer(newPeer) {
    if (!this.ws || !this.ws.readyState) return;
    this.ws.send(
      JSON.stringify({
        type: "CHANGE_PEER",
        new_peer: newPeer,
      })
    );
  }

  sendMessage(messageToSend) {
    if (!this.ws || !this.ws.readyState) return;
    this.ws.send(
      JSON.stringify({
        type: "MESSAGE",
        text: messageToSend.text,
        sender: messageToSend.sender,
      })
    );
  }

  sendDeleteRequest(messageId) {
    if (!this.ws || !this.ws.readyState) return;
    this.ws.send(
      JSON.stringify({
        type: "DELETE_MESSAGE",
        id: messageId,
      })
    );
  }
}

export default function makeWS(token) {
  return new ChatSocket(`ws://127.0.0.1:8000/ws/${token}`);
}
