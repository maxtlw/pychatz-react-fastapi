import KeyboardAltOutlinedIcon from "@mui/icons-material/KeyboardAltOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import {
  makeStyles,
  TextField,
  InputAdornment,
  Button,
} from "@material-ui/core";
import { useState } from "react";

const useStyles = makeStyles({
  inputPanel: {
    display: "flex",
    padding: "10px",
    width: "99%",
    height: "40px",
  },
  inputText: {
    flexGrow: 1,
  },
});

const ChatForm = (props) => {
  const [textToSend, setTextToSend] = useState("");

  const classes = useStyles();

  const handleWriteText = (e) => {
    if (e.target.value.length <= 255) {
      setTextToSend(e.target.value);
    }
  };

  const handlePressKey = (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      e.preventDefault();
      handleSendTextMessage(e);
    }
  };

  const handleSendTextMessage = () => {
    if (textToSend.length === 0) {
      return;
    }
    props.handleSendText(textToSend);
    setTextToSend("");
  };

  return (
    <div className={classes.inputPanel}>
      <TextField
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <KeyboardAltOutlinedIcon />
            </InputAdornment>
          ),
        }}
        placeholder={`talk to ${props.talkingTo}`}
        value={textToSend}
        className={classes.inputText}
        onInput={handleWriteText}
        onKeyPress={handlePressKey}
        multiline
      />
      <Button startIcon={<SendOutlinedIcon />} onClick={props.handleSendText}>
        Send
      </Button>
    </div>
  );
};

export default ChatForm;
