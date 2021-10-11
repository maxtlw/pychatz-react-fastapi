import { useState } from "react";
import {
  Button,
  TextField,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
} from "@material-ui/core";

const SigninBox = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [repeatedPasswordError, setRepeatedPasswordError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUsernameError(false);
    setPasswordError(false);
    setRepeatedPasswordError(false);

    let preventRequest = false;
    if (username === "") {
      setUsernameError(true);
      preventRequest = true;
    }

    if (password === "") {
      setPasswordError(true);
      preventRequest = true;
    }

    if (repeatedPassword === "" || repeatedPassword !== password) {
      setRepeatedPasswordError(true);
      preventRequest = true;
    }

    if (isPending || preventRequest) {
      return;
    }

    const user = { username: username, plain_password: password };
    setIsPending(true);

    fetch("http://localhost:8000/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
      .then((response) => {
        if (!response.ok) {
          switch (response.status) {
            case 403:
              Error("User already exists or username is too long");
              break;
            default:
              Error("Unknown error while POSTing user for signin");
          }
        }
        setIsPending(false);
        setUsername("");
        setPassword("");
        setRepeatedPassword("");
      })
      .catch((err) => {
        console.log(err.value);
      });
  };

  return (
    <Card elevation={3}>
      <CardHeader title="Sign-in" />
      <CardContent>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container direction="column" columns={1} spacing={2}>
            <Grid item>
              <Avatar
                alt="your cool bot avatar"
                src={`https://avatars.dicebear.com/api/bottts/${username}.svg`}
              />
            </Grid>
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
              <TextField
                label="repeat password"
                type="password"
                value={repeatedPassword}
                onChange={(e) => setRepeatedPassword(e.target.value)}
                error={repeatedPasswordError}
                required
              />
            </Grid>
            <Grid item>
              {!isPending && (
                <Button variant="outlined" color="primary" type="submit">
                  Sign In
                </Button>
              )}
              {isPending && (
                <Button variant="outlined" color="primary" disabled>
                  Signing in..
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default SigninBox;
