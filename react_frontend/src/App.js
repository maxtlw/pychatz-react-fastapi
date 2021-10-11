import NotFound from "./pages/NotFound";
import LogSign from "./pages/LogSign";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import useFetchStoredUsername from "./hooks/useFetchStoredUsername";
import { useState } from "react";
import Chat from "./pages/Chat";
import { createTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";

export default App;

const theme = createTheme();

function App() {
  const { data, isPending, error, token } = useFetchStoredUsername();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  function triggerRefresh() {
    setRefreshTrigger(!refreshTrigger);
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route exact path="/">
            <div className="App">
              {isPending && <p>Loading...</p>}
              {!isPending && data === null && (
                <LogSign refreshTrigger={triggerRefresh} />
              )}
              {!isPending && data !== null && !error && (
                <Chat
                  token={token}
                  username={data.current_user}
                  refreshTrigger={triggerRefresh}
                />
              )}
            </div>
          </Route>
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}
