import useFetch from "./useFetch";

function useFetchStoredUsername() {
  // Get stored token
  const storedToken = getStoredToken();

  // Retrieve username
  return {
    ...useFetch("http://localhost:8000/user", storedToken),
    token: storedToken,
  };
}

function getStoredToken() {
  const storedToken = JSON.parse(localStorage.getItem("chatz_jwt_token"));
  return storedToken;
}

export default useFetchStoredUsername;
