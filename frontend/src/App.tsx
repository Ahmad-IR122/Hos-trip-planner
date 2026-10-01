import { useEffect, useState } from "react";
import api from "./api/api";

function App() {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    api
      .get("/health/")
      .then((response) => {
        setMessage(response.data.message);
        console.log("Connection successful");
      })
      .catch((error) => {
        console.error(error);
        setMessage("Connection failed");
      });
  }, []);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
}

export default App;