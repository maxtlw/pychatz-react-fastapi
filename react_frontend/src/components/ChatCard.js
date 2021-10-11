import { makeStyles } from "@material-ui/styles";
import { Card, Grid, ListItemText } from "@material-ui/core";
import DoneOutlinedIcon from "@mui/icons-material/DoneOutlined";
import DeleteButton from "./DeleteButton";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";

const useStyles = makeStyles({
  chatCard: {
    padding: "10px",
    maxWidth: "50%",
  },
  timeText: {
    fontSize: "0.8rem",
    marginRight: "5px",
  },
  footerTextContainer: { display: "flex", justifyContent: "flex-end" },
  mainTextContainer: {
    width: "95%",
    whiteSpace: "unset",
    wordBreak: "break-all",
  },
});

const getLocalTimeStringFromUnixTs = (unixTs) => {
  const dateAsLocal = new Date(unixTs * 1000);
  const dateAsUtc = new Date(
    dateAsLocal.getTime() - dateAsLocal.getTimezoneOffset() * 60 * 1000
  );
  return dateAsUtc
    .toLocaleDateString("en-GB", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
    .slice(12, 17);
};

const ChatCard = ({ message, username, ws }) => {
  const classes = useStyles();

  return (
    <Card className={classes.chatCard}>
      <Grid container>
        <Grid item xs={12}>
          <ListItemText
            align="right"
            primary={message.text}
            classes={{ primary: classes.mainTextContainer }}
          ></ListItemText>
        </Grid>
        <Grid item xs={12}>
          <Grid container className={classes.footerTextContainer}>
            {message.sender === username && (
              <Grid item>
                <DeleteButton message={message} ws={ws} />
              </Grid>
            )}
            <Grid item style={{ flexGrow: 1 }}>
              <ListItemText
                classes={{ secondary: classes.timeText }}
                align="right"
                secondary={getLocalTimeStringFromUnixTs(message.ts)}
              ></ListItemText>
            </Grid>
            <Grid item>
              {message.isDelivered() && <DoneOutlinedIcon />}
              {!message.isDelivered() && <HourglassEmptyOutlinedIcon />}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ChatCard;
