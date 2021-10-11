import LoginBox from "../components/LoginBox";
import SigninBox from "../components/SigninBox";
import { Grid } from "@material-ui/core";

const LogSign = (props) => {
  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item>
        <LoginBox refreshTrigger={props.refreshTrigger} />
      </Grid>
      <Grid item>
        <SigninBox refreshTrigger={props.refreshTrigger} />
      </Grid>
    </Grid>
  );
};

export default LogSign;
