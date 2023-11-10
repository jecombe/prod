// Footer.js
import Link from "next/link";
import React from "react";
import styles from "./errorMetamask.module.css";
const ErrorMetamask = () => {
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
      <h1>Please install metamask</h1>
    </div>
  );
};

export default ErrorMetamask;
