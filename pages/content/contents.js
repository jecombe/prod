"use client";
import styles from "./content.module.css";
import Image from "next/image";
import React, { useState } from "react";

export default function Contents() {
  const [currentStep, setCurrentStep] = useState(0);

  const connectToZamaDevnet = async () => {
    try {
      if (window.ethereum) {
        const networkId = await window.ethereum.request({
          method: "eth_chainId",
        });

        if (networkId === "0x1f49") {
          window.alert("You're already connect on zama devnet");
        } else {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x1f49",
                chainName: "Zama Network",
                nativeCurrency: {
                  name: "ZAMA",
                  symbol: "ZAMA",
                  decimals: 18,
                },
                rpcUrls: ["https://devnet.zama.ai"],
                blockExplorerUrls: ["https://main.explorer.zama.ai"],
              },
            ],
          });
        }
      } else window.alert("You don't have metamask, please install metamask");
    } catch (error) {
      console.error("Error connecting to Zama Devnet:", error);
    }
  };
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
          <p>Or connect direclty if you have metamask.</p>
          <button className={styles.button} onClick={connectToZamaDevnet}>
            Connect to Zama Devnet
          </button>
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
            <Image
              src="/coins.png"
              alt="coin"
              height={100}
              width={100}
              loading="lazy"
            />
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
          <div className={styles.blockTwo}>
            <h1>First Gaming Web3 with FHE</h1>
            <p>
              For now, the game is available and in development on the{" "}
              <a href="https://www.zama.ai/">Zama </a>
              devnet <br />
              Later on, a migration will be carried out to the{" "}
              <a href="https://www.fhenix.io/">Fhenix</a> blockchain.
            </p>
          </div>
          <div className={styles.lineBlock}></div>

          <div className={styles.blockOne}>
            <div className={styles.discover}>
              <h1>Discover the world</h1>
              <p>
                Discover the world in your own pace and earn NFT Geospace in our
                single player mode.
                <br />
                It&#39;s A Web3 GeoGuessr. The smart contract records GPS points
                in an encrypted manner.
                <br /> To request location verification, it costs you 1 ZAMA.
                <br />
                If you are within a 5 km radius, you win the NFT GeoSpace
                associated with that location.
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
              Win an NFT and unlock the right to put it back into the game with
              your own tax.
            </p>
          </div>
          <div className={styles.lineBlock}></div>

          <div className={styles.blockThree}>
            <h1>Stake NFT GeoSpace</h1>
            <p>
              Once you have 3 NFTs, you can stake them to unlock the right to
              create a Geospace NFT with a valid GPS point (i.e., with an
              available Google Street View). This includes your tax.
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
