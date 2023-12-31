"use client";
import React from "react";
import styles from "./firstPage.module.css";
import Link from "next/link";

const FirstPage = () => {
  return (
    <div className={styles.titleGame}>
      <h1 className={styles.title}>NFT Guessr</h1>
      <p className={styles.subtitle}>
        Will you find the NFTs around the world?
      </p>
      <div className={styles.preli}>
        <p>First Fully Homomorphic Encryption game based on EVM </p>
      </div>
      <Link href="/game/game">
        <button className={styles.playButton}>Play</button>
      </Link>
    </div>
  );
};

export default FirstPage;
