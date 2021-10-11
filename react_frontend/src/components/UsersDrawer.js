import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemText,
  ListItem,
  Drawer,
  InputAdornment,
  TextField,
  Badge,
} from "@material-ui/core";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import useFetch from "../hooks/useFetch";
import { makeStyles } from "@material-ui/core";
import { useState } from "react";

function useFetchOtherUsers(query, token) {
  return useFetch(`http://localhost:8000/users?query=${query}`, token);
}

const useStyles = (drawerWidth) => {
  return makeStyles((theme) => {
    return {
      searchInputField: {
        padding: "10px",
      },
      active: {
        background: "#d5d5d5",
      },
      onlineBadge: {
        backgroundColor: "#4caf50",
      },
      drawer: {
        width: `${drawerWidth}px`,
      },
      drawerPaper: {
        width: `${drawerWidth}px`,
      },
      avatar: { marginLeft: theme.spacing(2) },
    };
  });
};

const UsersDrawer = (props) => {
  const [searchText, setSearchText] = useState("");

  const {
    data: otherUsers,
    isPending,
    error,
  } = useFetchOtherUsers(searchText, props.token);

  const classes = useStyles(props.drawerWidth)();

  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      anchor="left"
      classes={{ paper: classes.drawerPaper }}
    >
      <TextField
        className={classes.searchInputField}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon />
            </InputAdornment>
          ),
        }}
        value={searchText}
        onInput={handleSearchTextChange}
      />
      {!isPending && !error && otherUsers && (
        <List>
          {otherUsers.map((item) => (
            <ListItem
              button
              key={item.username}
              onClick={() => {
                props.selectedUserSetter(item.username);
              }}
              className={
                item.username === props.selectedUser ? classes.active : null
              }
            >
              <ListItemAvatar>
                <Badge
                  variant="dot"
                  classes={
                    props.onlineUsers.includes(item.username)
                      ? { badge: classes.onlineBadge }
                      : {}
                  }
                >
                  <Avatar
                    alt="a cool bot avatar"
                    src={`https://avatars.dicebear.com/api/bottts/${item.username}.svg`}
                  />
                </Badge>
              </ListItemAvatar>
              <ListItemText primary={item.username} />
            </ListItem>
          ))}
        </List>
      )}
    </Drawer>
  );
};

export default UsersDrawer;
