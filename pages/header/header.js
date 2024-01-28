import React from "react";
import styles from "./header.module.css";
import Link from "next/link";

const Header = () => {
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
        <a onClick={scrollToAbout} className={styles.howToPlayButton}>
          About
        </a>
        <a onClick={scrollToHowToPlay} className={styles.howToPlayButton}>
          How to Play
        </a>
        <Link href="/" className={styles.profilStat}>
          Game Stats
        </Link>
        <Link href="/profil/profil" className={styles.profilStat}>
          My profil
        </Link>
      </div>
      <Link href="/game/game">
        <button className={styles.playButton}>Play</button>
      </Link>
    </header>
  );
};

export default Header;
