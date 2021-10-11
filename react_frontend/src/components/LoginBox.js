import { useState, useRef } from "react";
import {
  Button,
  TextField,
  Grid,
  Card,
  CardHeader,
  CardContent,
} from "@material-ui/core";

const LoginBox = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const form = useRef(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    setUsernameError(false);
    setPasswordError(false);

    let preventRequest = false;
    if (username === "") {
      setUsernameError(true);
      preventRequest = true;
    }

    if (password === "") {
      setPasswordError(true);
      preventRequest = true;
    }

    if (isPending || preventRequest) {
      return;
    }

    const formData = new FormData(form.current);
    setIsPending(true);

    fetch("http://localhost:8000/token", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          switch (response.status) {
            case 404:
              throw Error("User not found");
            case 403:
              throw Error("Wrong password");
            default:
              throw Error("Unknown error while POSTing user for login");
          }
        }

        setIsPending(false);
        return response.json();
      })
      .then((responseJson) => {
        const token = responseJson.access_token;
        localStorage.setItem("chatz_jwt_token", JSON.stringify(token));
        props.refreshTrigger();
      })
      .catch((err) => {
        console.log(err);
        setIsPending(false);
      });
  };

  return (
    <Card elevation={3}>
      <CardHeader title="Log-in" />
      <CardContent>
        <form noValidate autoComplete="off" ref={form} onSubmit={handleSubmit}>
          <Grid container direction="column" columns={1} spacing={2}>
            <Grid item>
              <TextField
                label="username"
                color="primary"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={usernameError}
                required
              />
            </Grid>
            <Grid item>
              <TextField
                label="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
                required
              />
            </Grid>
            <Grid item>
              {!isPending && (
                <Button variant="contained" color="primary" type="submit">
                  Log In
                </Button>
              )}
              {isPending && (
                <Button variant="contained" color="primary" disabled>
                  Logging in..
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginBox;
