import UsersDrawer from "../components/UsersDrawer";
import PychatzBar from "../components/PychatzBar";

import { makeStyles } from "@material-ui/styles";
import { useState } from "react";

import ChatScreen from "../components/ChatScreen";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => {
  return {
    page: {
      background: "#f9f9f9",
      width: `calc(100% - ${drawerWidth}px)`,
    },
    root: {
      display: "flex",
    },
    toolBar: theme.mixins.toolbar,
  };
});

const Chat = (props) => {
  const classes = useStyles();
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const setUserOnline = (username) => {
    setOnlineUsers((onlineUsers) => [...onlineUsers, username]);
  };

  const setUserOffline = (username) => {
    setOnlineUsers((onlineUsers) =>
      onlineUsers.filter((user) => {
        return user !== username;
      })
    );
  };

  return (
    <div className={classes.root}>
      {/* App bar */}
      <PychatzBar
        drawerWidth={drawerWidth}
        username={props.username}
        refreshTrigger={props.refreshTrigger}
      />

      {/* left drawer */}
      <UsersDrawer
        drawerWidth={drawerWidth}
        token={props.token}
        selectedUser={selectedUser}
        onlineUsers={onlineUsers}
        selectedUserSetter={setSelectedUser}
      />

      <div className={classes.page}>
        <div className={classes.toolBar}></div>
        <ChatScreen
          talkingTo={selectedUser}
          token={props.token}
          username={props.username}
          setUserOnline={setUserOnline}
          setUserOffline={setUserOffline}
        />
      </div>
    </div>
  );
};

export default Chat;
