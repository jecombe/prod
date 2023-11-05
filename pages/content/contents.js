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
            Here are the main steps from the
            <a href="https://support.metamask.io/hc/en-us/articles/360043227612-How-to-add-a-custom-network-RPC">
              {" "}
              official guide{" "}
            </a>
            provided by Metamask:
          </p>
          <br />
          <div className={styles.one}>
            <Image src="/metamask.gif" alt="my gif" height={500} width={300} />
          </div>
          <p>
            From the homepage of your wallet, click on the network selector in
            the top left, and then on Add network
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
            <Image src="/coins.png" alt="coin" height={100} width={100} />
          </div>
          <p>
            Get <a href="https://faucet.zama.ai/">here</a>
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
              <h1>Discover the world</h1>
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
            <h1>Earn NFT Geospace</h1>
            <p>
              Win as many NFTs as possible to build a collection and gain
              advantages in the future.
            </p>
          </div>
          <div className={styles.lineBlock}></div>

          <div className={styles.blockThree}>
            <h1>Compete against others</h1>
            <p>
              Test your ability against players all across the world. Earn NFT
              Geospace and compete against others in tournaments and events!
            </p>
          </div>
        </div>
      </section>
      <div className={styles.lineSection}></div>

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
