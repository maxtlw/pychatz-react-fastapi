import { IconButton } from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

const DeleteButton = ({ message, ws }) => {
  const sendDeleteRequest = () => {
    ws.current.sendDeleteRequest(message.id);
    //console.log(`Delete request for message ${message.id} => ${message.text} `);
  };
  return (
    <IconButton size="small" onClick={sendDeleteRequest}>
      <DeleteOutlinedIcon />
    </IconButton>
  );
};

export default DeleteButton;
