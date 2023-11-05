import React, { useState } from "react";
import styles from "./header.module.css";
import Image from "next/image";
import Link from "next/link";

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
      {/* <div className={styles.logo}>
        <Image src="/profil.jpeg" alt="nftguessr" height={10} width={10} />
      </div> */}
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
      <Link href="/game/game">
        <button className={styles.playButton}>Play</button>
      </Link>
    </header>
  );
};

export default Header;
