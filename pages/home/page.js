"use client";
import styles from "./home.module.css";
import Header from "../header/header";
import Footer from "../footer/footer";
import Contents from "../content/contents";
import FirstPage from "../firstPage/page";

export default function HomeView() {
  return (
    <div>
      <div className={styles.first}>
        <Header />
        <FirstPage />
      </div>
      {/* <main className={`${styles.content}`}>
        <Contents />
      </main>
      <Footer /> */}
    </div>
  );
}
