import React, { useState } from "react";
import styles from "./header.module.css";

const Header = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const handleMouseEnter = () => {
    setDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    setDropdownVisible(false);
  };

  const scrollToHowToPlay = () => {
    const howToPlaySection = document.getElementById("howToPlay");
    if (howToPlaySection) {
      howToPlaySection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={styles.menu}>
      <div className={styles.logo}>
        <img src="./profil.jpeg" alt="NftGuessr" />
      </div>
      <div className={styles.menuItems}>
        <div className={styles.aboutDiv}>
          <a onClick={scrollToAbout} className={styles.howToPlayButton}>
            About
          </a>
        </div>
        <div className={styles.howToPlayDiv}>
          <a onClick={scrollToHowToPlay} className={styles.howToPlayButton}>
            How to Play
          </a>
        </div>
      </div>

      <button className={styles.playButton}>Play</button>
    </header>
  );
};

export default Header;
