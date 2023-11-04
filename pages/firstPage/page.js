// Header.js
"use client";
import React, { useState } from "react";
import styles from "./firstPage.module.css";

const FirstPage = () => {
  return (
    <div className={styles.titleGame}>
      <h1 className={styles.title}>NFT Guessr</h1>

      <div className={styles.line}></div>
      <p className={styles.subtitle}>
        Will you find the NFTs around the world?
      </p>
      <div className={styles.preli}>
        <p>First Fully Homomorphic Encryption game based on EVM </p>
      </div>
    </div>
  );
};

export default FirstPage;