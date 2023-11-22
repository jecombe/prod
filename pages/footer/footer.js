// Footer.js
import React from "react";
import styles from "./footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerLinks}>
          <a
            href="https://twitter.com/NftGuessr"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
          <a
            href="https://discord.gg/DJb73wHR"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>
        </div>
        <div className={styles.footerLinks}>
          <a
            href="https://t.me/NFTGuessr"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram
          </a>
          <a
            href="https://medium.com/@jeremcombe/nftguessr-6dcfde3621ac"
            target="_blank"
            rel="noopener noreferrer"
          >
            Medium
          </a>
        </div>
      </div>
      <div className={styles.footerText}>
        <a
          href="https://github.com/jecombe"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made by Jérémy Combe
        </a>
      </div>
    </footer>
  );
};

export default Footer;
