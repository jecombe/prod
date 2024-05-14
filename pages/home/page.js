import { useEffect } from "react";
import styles from "./home.module.css";
import Header from "../header/header";
import Footer from "../footer/footer";
import Contents from "../content/contents";
import FirstPage from "../firstPage/page";

export default function HomeView() {
  useEffect(() => {
    // Afficher l'alerte lorsque le composant est monté
    alert(
      "NFTGuessr is in beta. The smart contract are subject to change as the game is in development."
    );
  }, []); // [] assure que cette fonction ne se déclenche qu'une seule fois, lorsque le composant est monté

  return (
    <div>
      <div className={styles.first}>
        <Header />
        <FirstPage />
      </div>
      <main className={`${styles.content}`}>
        <Contents />
      </main>
      <Footer />
    </div>
  );
}
