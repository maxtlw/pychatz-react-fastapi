export default class LocalMessage {
  constructor(id, localId, text, sender, receiver, ts) {
    this.id = id;
    this.localId = localId; // Only sent messages have one, used for confirmation
    this.text = text;
    this.sender = sender;
    this.receiver = receiver;
    this.ts = ts;
  }

  static fromServer(databaseMessage) {
    // ERROR HANDLING
    return new LocalMessage(
      databaseMessage.id,
      null,
      databaseMessage.content,
      databaseMessage.sender.username,
      databaseMessage.receiver.username,
      databaseMessage.timestamp
    );
  }

  static fromSocket(socketMessage) {
    return new LocalMessage(
      socketMessage.id,
      null,
      socketMessage.text,
      socketMessage.sender,
      socketMessage.receiver,
      socketMessage.timestamp
    );
  }

  static toSend(localId, text, username) {
    return new LocalMessage(null, localId, text, username, null, null);
  }

  confirmFromServer(confirmation) {
    if (!confirmation.id || !confirmation.receiver || !confirmation.timestamp) {
      throw Error("Invalid confirmation from");
    }
    if (this.id !== null || this.receiver !== null || this.ts !== null) {
      // message handling
      throw Error("Trying to confirm a non-pending message");
    }
    this.id = confirmation.id;
    this.receiver = confirmation.receiver;
    this.ts = confirmation.timestamp;
  }

  isDelivered() {
    return true;
  }
}
