import styles from "./content.module.css";
import Image from "next/image";
import { useState } from "react";

export default function Contents() {
  const [currentStep, setCurrentStep] = useState(0);

  const contentSteps = [
    {
      title: "Install Metamask",
      content: (
        <div>
          <div className={styles.centerImage}>
            <Image
              src="/logo_metamask.png"
              alt="metamask"
              height={200}
              width={200}
            />
          </div>
          <p>
            Follow <a href="https://metamask.io/">this</a>
          </p>
        </div>
      ),
    },
    {
      title: "Connect to Zama devnet",
      content: (
        <div>
          <p>
            Voici les étapes principales du
            <a href="https://support.metamask.io/hc/en-us/articles/360043227612-How-to-add-a-custom-network-RPC">
              {" "}
              guide officiel{" "}
            </a>
            fourni par Metamask
          </p>
          <br />
          <div className={styles.one}>
            <Image src="/metamask.gif" alt="my gif" height={500} width={300} />
          </div>
          <p>
            Depuis la page d'accueil de votre portefeuille, cliquez sur le
            sélecteur de réseau en haut à gauche, puis sur 'Ajouter un réseau'
          </p>
          <div className={styles.two}>
            <Image src="/metamask2.gif" alt="my gif" height={500} width={600} />
          </div>
          <br />
          <p>
            Add these informations to access to blockchain:
            <br />
          </p>
          <div className={styles.three}>
            <Image src="/zama.png" alt="my gif" height={300} width={600} />
          </div>
          <p>
            Choose Zama Devnet:
            <br />
          </p>{" "}
          <div className={styles.four}>
            <Image src="/network.webp" alt="my gif" height={500} width={400} />
          </div>
        </div>
      ),
    },
    {
      title: "Get faucet Zama",
      content: (
        <div>
          <div className={styles.centerImage}>
            <Image
              src="/logo_metamask.png"
              alt="metamask"
              height={100}
              width={100}
            />
          </div>
          <p>
            Follow <a href="https://metamask.io/">this</a>
          </p>
        </div>
      ),
    },
    // Ajoutez d'autres étapes ici
  ];

  const nextStep = () => {
    if (currentStep < contentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      <section
        id="about"
        className={`${styles.section} ${styles.presentation}`}
      >
        <div className={styles.blockAll}>
          <div className={styles.blockOne}>
            <div className={styles.discover}>
              <h2>Discover the world</h2>
              <p>
                Discover the world in your own pace and earn NFT Geospace in our
                single player mode.
              </p>
            </div>

            <div className={styles.box}>
              {/* Image de la terre et animation vont ici */}
            </div>
          </div>
          <div className={styles.lineBlock}></div>

          <div className={styles.blockTwo}>
            <h2>Earn NFT Geospace</h2>
            <p>
              Mettez vos compétences à l'épreuve contre vos amis et votre
              famille. Créez votre propre partie privée et jouez ensemble.
            </p>
          </div>
          <div className={styles.lineBlock}></div>

          <div className={styles.blockThree}>
            <h2>Compétition contre les autres</h2>
            <p>
              Testez vos compétences contre des joueurs du monde entier. Gagnez
              des badges et participez à des tournois et événements !
            </p>
          </div>
        </div>
      </section>

      <section
        id="howToPlay"
        className={`${styles.section} ${styles.reglesDuJeu}`}
      >
        <div className={styles.blockPlay}>
          <h1>How to play?</h1>

          <h2>{contentSteps[currentStep].title}</h2>
          {contentSteps[currentStep].content}
          <div className={styles.buttonsHowToPlay}>
            {currentStep > 0 && (
              <button className={styles.button} onClick={goBack}>
                Back Step
              </button>
            )}

            {currentStep < contentSteps.length - 1 && (
              <button className={styles.button} onClick={nextStep}>
                Next Step
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
