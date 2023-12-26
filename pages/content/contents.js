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
              devnet and <a href="https://www.inco.network/">Inco Network </a>
              future deployment on this.
            </p>
            <h2>Discover the world</h2>
            <p>
              It&#39;s a Web3 geoguessr; the goal is to find NFTs scattered
              around the globe. <br />
              It&#39;s up to you to discover the location of the NFTs. The smart
              contract utilizes Fully Homomorphic Encryption (FHE) to ensure
              data confidentiality while performing distance calculations.
            </p>
          </div>
          <div className={styles.lineBlock}></div>

          <div className={styles.blockTest}>
            <h1>Earn Geospace and SpaceCoin</h1>
            <p>
              Find the location (around 5km radius) and win a nft GeoSpace, and
              2 SpaceCoin tokens available for GeoSpace creation.
            </p>
          </div>
          <div className={styles.lineBlock}></div>

          <div className={styles.blockThree}>
            <h1>Put your GeoSpace back into play</h1>
            <p>
              Put your GeoSpace back into play with your own ZAMA tax for one
              round.
            </p>
          </div>

          <div className={styles.lineBlock}></div>

          <div className={styles.blockTest2}>
            <h1>Stake NFT GeoSpace</h1>
            <p>Staking NFTs allows you to unlock exciting benefits:</p>
            <ul>
              <li>
                <strong>
                  <u>Stake 1 NFT:</u>
                </strong>{" "}
                Earn SPC (SpaceCoin) tokens every 24 hours. <br />
              </li>
              <li>
                <strong>
                  <u>Stake 3 NFTs:</u>
                </strong>{" "}
                Unlock the right to create a Geospace NFT.
              </li>
            </ul>
          </div>
          <div className={styles.lineBlock}></div>

          <div className={styles.blockTwo}>
            <h1>Create NFT</h1>
            <p>
              If you have previously staked 3 Geospace NFTs, You can choose a
              valid GPS point with an available Google Street View for your
              creation. <br />
              This process includes your tax (Zama) for the first round. <br />
              To create a Geospace NFT, you will need to pay 1 SPC token. <br />
              The fees are then distributed to all creators of NFTs on Geospace.
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
