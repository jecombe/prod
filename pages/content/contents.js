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
          window.alert("You're already connect on Zama network devnet");
        } else {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              // {
              //   chainId: "0x2382",
              //   chainName: "Inco Network",
              //   nativeCurrency: {
              //     name: "INCO",
              //     symbol: "INCO",
              //     decimals: 18,
              //   },
              //   rpcUrls: ["https://evm-rpc.inco.network/"],
              //   blockExplorerUrls: ["https://explorer.inco.network/"],
              // },
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
            <h1>Guessing game</h1>
            <h2>Discover the world</h2>
            <p>
              It&#39;s a Web3 geoguessr <br />
              The goal is to find NFTs GeoSpace scattered around the globe.{" "}
              <br />
              It&#39;s up to you to discover the location of the NFTs. The smart
              contract utilizes Fully Homomorphic Encryption (FHE) to ensure
              data confidentiality while performing distance calculations.
            </p>
            <p>
              For now, the game is available and in development on the{" "}
              <a href="https://docs.zama.ai/fhevm/what-is-zamas-fhevm/readme">
                Zama{" "}
              </a>
              devnet <br />
            </p>
          </div>
          <div className={styles.lineBlock}></div>

          {/* <div className={styles.blockTest}>
             <h1>Guess GeoSpace</h1>
            <p>
              To make a guess request, you will be required to have a minimum of
              2 Zama. They will be distributed among all the staker of SpaceCoin
              and the NftGuessr team. <br />A winning tax may be added by the
              GeoSpace creator in play. If the player makes an incorrect guess,
              then the winning tax will be refunded. <br />
              Lors de la demande du guess, les createur vont se partager 1
              SpaceCoin.
            </p>
          </div>
          <div className={styles.lineBlock}></div> */}
          <div className={styles.blockThree}>
            <h1>Earn GeoSpace and SpaceCoin</h1>
            <p>
              If the player successfully finds the GeoSpace, they will receive 1
              SpaceCoin and the GeoSpace.
            </p>
          </div>
          <div className={styles.blockTest}>
            <h1>Become a GeoSpace creator</h1>
            <p>
              Become a creator for the game as soon as you put a GeoSpace back
              into play. <br />
              You will earn Zama from valid guesses by other players.
              Additionally, you will receive SpaceCoin among all other creators
              during a guess request. <br />
              The more you stake compared to other players, the greater your
              rewards will be.
            </p>
          </div>

          <div className={styles.lineBlock}></div>

          <div className={styles.blockThree}>
            <h1>Stake SpaceCoin and earn guess fees</h1>
            <p>
              Stake SpaceCoin tokens to earn a share of the guessing fees in
              Zama. The more you stake compared to other players, the greater
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
