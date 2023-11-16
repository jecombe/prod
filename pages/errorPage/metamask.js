// Footer.js
import Link from "next/link";
import React from "react";
import styles from "./errorMetamask.module.css";
const ErrorMetamask = ({ message }) => {
  return (
    <div>
      <header className={styles.menu}>
        <div className={styles.menuItems}>
          <div className={styles.howToPlayDiv}>
            <Link href="/">
              <a className={styles.howToPlayButton}>Back Home</a>
            </Link>
          </div>
        </div>
      </header>
      <h1>{message}</h1>
    </div>
  );
};

export default ErrorMetamask;
