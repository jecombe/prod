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

        if (networkId === "0x2382") {
          window.alert("You're already connect on inco network devnet");
        } else {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x2382",
                chainName: "Inco Network",
                nativeCurrency: {
                  name: "INCO",
                  symbol: "INCO",
                  decimals: 18,
                },
                rpcUrls: ["https://evm-rpc.inco.network/"],
                blockExplorerUrls: ["https://explorer.inco.network/"],
              },
            ],
          });
        }
      } else window.alert("You don't have metamask, please install metamask");
    } catch (error) {
      console.error("Error connecting to Inco Devnet:", error);
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
            Connect to Inco Devnet
          </button>
        </div>
      ),
    },
    {
      title: "Get faucet Inco",
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
            Get <a href="https://faucetdev.inco.network/">here</a>
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
            <h1>Gaming Web3 with FHE</h1>
            <p>
              For now, the game is available and in development on the{" "}
              <a href="https://www.inco.network/">Inco network </a>
              devnet <br />
            </p>
            <h2>Discover the world</h2>
            <p>
              It&#39;s a Web3 geoguessr; the goal is to find NFTs GeoSpace
              scattered around the globe. <br />
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
              1 SpaceCoin tokens available for GeoSpace creation. The smart
              contract mints 1 SpaceCoin for the winner and 1 SpaceCoin during a
              guess request for the creators.
            </p>
          </div>
          <div className={styles.lineBlock}></div>

          <div className={styles.blockThree}>
            <h1>Put your GeoSpace back into play</h1>
            <p>
              Put your GeoSpace back into play with your own INCO tax for one
              round.
            </p>
          </div>

          <div className={styles.lineBlock}></div>

          <div className={styles.blockTest}>
            <h1>Mint GeoSpace</h1>
            <p>
              If you have previously put an GeoSpace back into the game, then
              you can create as many GeoSpace as you want for the game, as long
              as other players do not find your GeoSpace. <br />
              This process includes your guessing tax (INCO) for the first
              round. <br />
              To create a Geospace, you will need to pay 1 SPC token. <br />
              The fees are burn to reduce totalSupply.
            </p>
          </div>

          <div className={styles.blockThree}>
            <h1>Stake SpaceCoin and earn INCO guess fees</h1>
            <p>
              Stake SpaceCoin tokens to earn a share of the guessing fees in
              INCO. The more you stake compared to other players, the greater
              your rewards will be.
            </p>
          </div>
          <div className={styles.lineBlock}></div>
          <div className={styles.blockTwo}>
            <h1>AirDrop SpaceCoin</h1>
            <p>
              The airdrop contains 80% of the total SpaceCoin supply. It will
              end when the pool is empty*.
            </p>
            <h2>Win GeoSpace</h2>
            <p>Find as many GeoSpaces as possible to earn SpaceCoins.</p>
            <h2>Mint GeoSpace</h2>
            <p>
              The more GeoSpace you mint, the more SpaceCoins you will receive.
            </p>
          </div>
          <span className={styles.asterix}>
            * For more details, see the{" "}
            <a
              href="https://nftguessr.gitbook.io/white-paper/"
              target="_blank"
              rel="noopener noreferrer"
            >
              White Paper
            </a>{" "}
            in the Airdrop section.
          </span>
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
