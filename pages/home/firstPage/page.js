// Header.js
"use client";
import React, { useState } from "react";
import styles from "./firstPage.module.css";

const FirstPage = () => {
  return (
    <div className={styles.titleGame}>
      <h1 className={styles.title}>NFT Geoguessr</h1>

      <div className={styles.line}></div>
      <p className={styles.subtitle}>
        Will you find the NFTs around the world?
      </p>
    </div>
  );
};

export default FirstPage;
