"use client";
import React, { useEffect } from "react";
import styles from "./firstPage.module.css";
import Link from "next/link";

const FirstPage = () => {
  useEffect(() => {
    // Afficher l'alerte lorsque le composant est monté
    alert(
      "NFTGuessr is in beta. The smart contract are subject to change as the game is in development."
    );
  }, []); // [] assure que cette fonction ne se déclenche qu'une seule fois, lorsque le composant est monté

  return (
    <div className={styles.titleGame}>
      <h1 className={styles.title}>NFT Guessr</h1>
      <p className={styles.subtitle}>
        Will you find the NFTs around the world?
      </p>
      {/* <div className={styles.preli}>
        <p>First Fully Homomorphic Encryption game based on EVM </p>
      </div> */}
      <Link href="/game/game">
        <button className={styles.playButton}>Play</button>
      </Link>
      <h2 className={`${styles.titleAir}`}>SpaceCoin AirDrop</h2>
      <p className={styles.subtitleAir}>
        Be a pioneer of NFTGuessr and earn SpaceCoins through your involvement
        in the games !
      </p>
      <Link href="/airdrop/airdrop">
        <button className={styles.airdropButton}>Airdrop</button>
      </Link>
    </div>
  );
};

export default FirstPage;
