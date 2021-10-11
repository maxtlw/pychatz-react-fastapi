import { AppBar, makeStyles, Toolbar, Typography } from "@material-ui/core";
import UserMenu from "./UserMenu";

const PychatzBar = ({ drawerWidth, username, refreshTrigger }) => {
  const useStyles = makeStyles({
    appBar: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
    brand: {
      flexGrow: "1",
    },
  });

  const classes = useStyles();

  return (
    <AppBar className={classes.appBar}>
      <Toolbar>
        <Typography component="label" className={classes.brand}>
          pyChatZ!
        </Typography>
        <UserMenu username={username} refreshTrigger={refreshTrigger} />
      </Toolbar>
    </AppBar>
  );
};

export default PychatzBar;
