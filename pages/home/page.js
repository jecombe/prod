"use client";
import Head from "next/head";
import styles from "./home.module.css";
import Header from "./header/header";
import Footer from "./footer/footer";
import Contents from "./content/contents";
import FirstPage from "./firstPage/page";

export default function HomeView() {
  return (
    <div className={styles.container}>
      <div className={styles.first}>
        <Head>
          <link rel="icon" href="/profil.jpeg" />{" "}
          {/* Chemin vers votre icône */}
          <title>NFTGuessr</title>
        </Head>

        <Header />
        <FirstPage />
      </div>
      <main className={`${styles.content}`}>
        {/* <ParallaxPage /> */}
        <Contents />
      </main>

      <Footer />
    </div>
  );
}
