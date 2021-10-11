import * as React from "react";
import { ListItem, Typography } from "@mui/material";
import { Avatar } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => {
  return {
    avatar: { marginLeft: theme.spacing(2) },
  };
});

const logoutFunction = () => {
  localStorage.removeItem("chatz_jwt_token");
};

export default function UserMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSelectLogout = () => {
    logoutFunction();
    props.refreshTrigger();
  };

  const classes = useStyles();

  return (
    <div>
      <ListItem
        button
        id="basic-button"
        aria-controls="basic-menu"
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <Typography>{props.username}</Typography>
        <Avatar
          className={classes.avatar}
          alt={"your cool avatar!"}
          src={`https://avatars.dicebear.com/api/bottts/${props.username}.svg`}
        />
      </ListItem>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem onClick={handleSelectLogout}>Logout</MenuItem>
      </Menu>
    </div>
  );
}
