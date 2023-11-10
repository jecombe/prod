// socket.js
import io from "socket.io-client";
import store from "./utils/store";

const socket = io("http://localhost:8000"); // Remplacez par l'URL de votre serveur Socket.io
console.log("eeeeeeeeeeeeeeeeeeeeee", socket);
socket.on("allToken", (message) => {
  // Dispatch une action Redux pour gérer le message
  console.log("QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQq", message);
  store.dispatch(receiveSocketMessage(message));
});

export default socket;
