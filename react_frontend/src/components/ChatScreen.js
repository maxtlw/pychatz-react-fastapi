import { Grid } from "@material-ui/core";
import ChatForm from "./ChatForm";
import { useState, useRef, useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import { ListItem, List } from "@mui/material";
import makeWS from "../modules/socketCommunicaton";
import useFetch from "../hooks/useFetch";
import ChatCard from "./ChatCard";
import LocalMessage from "../modules/message";

const useStyle = makeStyles((theme) => {
  return {
    messagesInbox: {
      width: "100%",
    },
    receivedMessage: {},
    sentMessage: {
      display: "flex",
      justifyContent: "flex-end",
      /* textAlign: "right" */
    },
    isWritingList: {
      display: "flex",
      justifyContent: "center",
    },
    messagesList: {
      overflow: "auto",
      height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - 40px - 45px)`,
    },
  };
});

function useFetchMessagesWithUser(otherUser, token) {
  return useFetch(`http://localhost:8000/messages?other=${otherUser}`, token);
}

const ChatScreen = ({
  talkingTo,
  token,
  username,
  setUserOnline,
  setUserOffline,
}) => {
  const {
    data: fetchedMessages,
    isPending: fetchIsPending,
    error: fetchError,
  } = useFetchMessagesWithUser(talkingTo, token);
  const [messagesList, setMessagesList] = useState([]);
  const ws = useRef(null);
  const pendingMessages = useRef([]);

  const classes = useStyle();

  // Incorporate the messages fetched from the database into the in-memory messages list.
  // Called automatically after fetching the messages from the database.
  useEffect(() => {
    if (fetchIsPending || fetchError || fetchedMessages === null) return;
    const fetchedMessagesLocal = fetchedMessages.map((message) => {
      return LocalMessage.fromServer(message);
    });
    setMessagesList(fetchedMessagesLocal);
  }, [fetchedMessages, fetchIsPending, fetchError]);

  // Manage connection/disconnection of the socket
  useEffect(() => {
    ws.current = makeWS(token);
    initSocket();
    return () => {
      ws.current.ws.close();
    };
  }, [token]);

  function initSocket() {
    ws.current.registerCallback("MESSAGE", handleReceivedMessage);
    ws.current.registerCallback("MESSAGE_DELETED", removeParsedMessageFromList);
    ws.current.registerCallback("ACK", confirmLastPending);
    ws.current.registerCallback("USER_CONNECTED", (parsedMessage) => {
      setUserOnline(parsedMessage.username);
    });
    ws.current.registerCallback("USER_DISCONNECTED", (parsedMessage) => {
      setUserOffline(parsedMessage.username);
    });
  }

  function handleReceivedMessage(parsedMessage) {
    const lm = LocalMessage.fromSocket(parsedMessage);
    pushMessageList(lm);
  }

  // Communicate change of peer
  useEffect(() => {
    ws.current.sendChangePeer(talkingTo);
  }, [talkingTo]);

  // Server confirmation
  function confirmLastPending(confirmation) {
    if (pendingMessages.current.length === 0) {
      throw Error("Trying to confirm a pending message, but there are none");
    }
    const messageToConfirm = pendingMessages.current.shift();

    messageToConfirm.confirmFromServer(confirmation);
    pushMessageList(messageToConfirm);
  }

  function removeParsedMessageFromList(parsedMessage) {
    const messageId = parsedMessage.id;
    setMessagesList((messagesList) =>
      messagesList.filter((message) => {
        return message.id !== messageId;
      })
    );
  }

  const pushMessageList = (localMessage) => {
    setMessagesList((messages) => [...messages, localMessage]);
  };

  const handleSendText = (textToSend) => {
    const messageToSend = LocalMessage.toSend(1, textToSend, username);
    ws.current.sendMessage(messageToSend);
    pendingMessages.current.push(messageToSend);
  };

  // TODO: Add "fetching messages..."
  return (
    talkingTo !== null &&
    fetchError === null &&
    !fetchIsPending && (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <ChatForm talkingTo={talkingTo} handleSendText={handleSendText} />

        <Grid container direction="column">
          <Grid item className={classes.messagesList}>
            <List>
              {messagesList.map((message, i) => (
                <ListItem
                  key={i}
                  style={
                    message.sender === username
                      ? { display: "flex", justifyContent: "flex-end" }
                      : {}
                  }
                >
                  <ChatCard message={message} username={username} ws={ws} />
                </ListItem>
              ))}
            </List>
          </Grid>
          {/* <Grid item className={classes.isWritingList}>
            <Typography>{talkingTo} is writing...</Typography>
          </Grid> */}
        </Grid>
      </div>
    )
  );
};

export default ChatScreen;
