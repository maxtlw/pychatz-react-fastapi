import { useState, useEffect } from "react";

function useFetch(url, token) {
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortCont = new AbortController();

    fetch(url, {
      signal: abortCont.signal,
      headers: { Authorization: "Bearer ".concat(token) },
    })
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch the data from that resource.");
        }
        res.json().then((data) => {
          setData(data);
          setIsPending(false);
          setError(null);
        });
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("fetch aborted");
        } else {
          setData(null);
          setIsPending(false);
          setError(err.message);
        }
      });

    return () => abortCont.abort();
  }, [url, token]);

  return { data, isPending, error };
}

export default useFetch;
