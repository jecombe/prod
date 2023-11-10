import React, { useEffect } from "react";
// import { Provider } from "react-redux";
// import store from "../utils/store";
import HomeView from "./home/page";
import io from "socket.io-client";

function Map() {
  // useEffect(() => {
  //   const socket = io("http://localhost:8000"); // Remplacez l'URL par celle de votre serveur Socket.io

  //   socket.on("connect", () => {
  //     console.log("Connecté au serveur Socket.io");
  //   });

  //   // Ajoutez d'autres écouteurs d'événements Socket.io ici

  //   return () => {
  //     // Déconnectez le socket lorsque le composant est démonté
  //     socket.disconnect();
  //   };
  // }, []); // La dépendance vide signifie que cela s'exécutera une fois après le montage du composant

  return (
    // <Provider store={store}>
    <HomeView />
    // </Provider>
  );
}

export default Map;
