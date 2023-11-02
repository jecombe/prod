// Footer.js
import React from "react";
import styles from "./footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div>
        <a
          href="https://twitter.com/NftGuessr"
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginRight: "10px" }} // Ajoutez une marge droite à Discord
        >
          Twitter
        </a>
        <a
          href="https://discord.gg/DJb73wHR"
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginRight: "10px" }} // Ajoutez une marge droite à Discord
        >
          Discord
        </a>
        <a
          href="https://t.me/NFTGuessr"
          target="_blank"
          rel="noopener noreferrer"
        >
          Telegram
        </a>
      </div>
      <div className={styles.footerText}>@Jérémy Combe</div>
    </footer>
  );
};

export default Footer;
