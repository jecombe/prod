import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import initMetaMask from "../../utils/metamask";
import abi from "../../utils/abi/abi";
import abiAir from "../../utils/abi/abiAirdrop";
import abiGame from "../../utils/abi/game";

import styles from "./airdrop.module.css";
import ErrorMetamask from "../errorPage/metamask";
import Link from "next/link";
import axios from "axios";
import { getFhevmInstance } from "../../utils/fhevmInstance";
import Loading from "../loading/loading";
import { parseUnits } from "ethers/lib/utils";
import { css } from "@emotion/react";
import { PropagateLoader, CircleLoader } from "react-spinners";
import { useRef } from "react";
import { getTokenSignature } from "../../utils/fhevm";

const getMargeErrorTx = (gasEstimation) => {
  const gasLimit = gasEstimation.mul(120).div(100);
  const gasLimitNetwork = 10000000;
  console.log(
    `Gas estimation estimation ${gasEstimation} Gwei\nGas estimation with error marge: ${gasLimit}`
  );
  if (gasLimit > gasLimitNetwork || Number(gasEstimation) > gasLimitNetwork) {
    alert(
      "Attention, your gas limit exceeds the maximum of 10,000,000 gwei. The transaction may fail or become stuck."
    );
  }
  return gasLimit;
};

// Composant Profil
const AirDrop = () => {
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red; // Adjust the color as needed
  `;

  const overrideCircle = css`
    display: block;
    margin: 0 auto;
    border-color: red; // Ajustez la couleur selon vos besoins
  `;
  // États
  const [account, setAccount] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractGame, setContractGame] = useState(null);

  const [contractAirdrop, setContractAirdrop] = useState(null);
  const [balanceAirDrop, setBalanceAirDrop] = useState("");
  const [balanceTeams, setBalanceTeams] = useState("");
  const [balanceBounty, setBalanceBounty] = useState("");

  const [fhevm, setFhevm] = useState(null);

  // const [isAccessGovernance, setAccessGovernance] = useState(false);
  // const [isAccessCreate, setAccessCreate] = useState(false);

  const [isTransactionClaimPending, setIsTransactionClaimStakePending] =
    useState(false);
  const [isTransactionEstimatePending, setIsTransactionEstimateStakePending] =
    useState(false);

  const [isMetaMaskInitialized, setIsMetaMaskInitialized] = useState(false);

  const [balanceSPC, setBalanceSPC] = useState(0);
  const [contractCoin, setContractCoin] = useState(null);
  const [numberCrea, setNumberCrea] = useState(0);
  const [numberWin, setNumberWin] = useState(0);
  const [balanceReward, setBalanceReward] = useState(0);

  // Effets
  useEffect(() => {
    if (isMetaMaskInitialized && signer) {
      fetchData();
    }
  }, [isMetaMaskInitialized, signer]);

  const handleChainChanged = async () => {
    // Mettez à jour le contrat et le signer après un changement de réseau

    await initializeMetaMask();
    await fetchData();
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleChainChanged);
    }
    return () => {
      // Nettoyer le gestionnaire d'événements lorsque le composant est démonté
      if (window.ethereum) {
        window.ethereum.off("chainChanged", handleChainChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      // Cleanup the subscription when the component unmounts
      if (window.ethereum) {
        window.ethereum.off("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  const initializeMetaMask = async () => {
    try {
      setIsLoading(true);
      const signer = await initMetaMask();
      const contract = new ethers.Contract(process.env.CONTRACT, abi, signer);
      const contractCoin = new ethers.Contract(process.env.TOKEN, abi, signer);
      const contractGame = new ethers.Contract(
        process.env.GAME,
        abiGame,
        signer
      );

      const contractAirdrop = new ethers.Contract(
        process.env.AIRDROP,
        abiAir,
        signer
      );

      setSigner(signer);
      setContractAirdrop(contractAirdrop);
      setContractGame(contractGame);
      setContract(contract);
      setContractCoin(contractCoin);
      setIsMetaMaskInitialized(true);
      // if (window.ethereum) {
      //   window.ethereum.on("accountsChanged", handleAccountsChanged);
      // }
    } catch (error) {
      console.error("Error initializing MetaMask:", error);
      setIsLoading(false);
    }
  };

  // Fonction fetchData optimisée
  const fetchData = async () => {
    try {
      setIsLoading(true);

      if (signer) {
        console.log("OKOOKOK");
        const userAddress = await signer.getAddress();
        console.log(contract, userAddress);
        // const n = await contract.estimateRewardPlayer({
        //   from: userAddress,
        //   gasLimit: 1000000,
        // });
        // const r = await n.wait();
        // const b = await contractAirdrop.getBalanceAirdrop(userAddress);
        // console.log(b.toString());
        // console.log(n.value.toString());
        // Créez un tableau de promesses
        const promises = [
          contractAirdrop.getBalanceAirDrop(),
          contractAirdrop.getBalanceBounty(),
          contractAirdrop.getBalanceTeams(),
          contractAirdrop.getBalanceAirdrop(userAddress),
          contractGame.getNftWinnerForUser(userAddress),
          contractGame.getNftCreationAndFeesByUser(userAddress),
        ];

        const [
          balanceAirDrop,
          balanceBounty,
          balanceTeams,
          balanceReward,
          winNft,
          nftCrea,
        ] = await Promise.all(promises);
        console.log(balanceAirDrop.toString());

        const balanceAir = ethers.utils.formatUnits(balanceAirDrop, "ether");
        const balanceT = ethers.utils.formatUnits(balanceTeams, "ether");
        const balanceB = ethers.utils.formatUnits(balanceBounty, "ether");
        const creationNFTs = nftCrea[0].map((tokenId) => tokenId.toNumber());
        const winNfts = winNft.map((tokenId) => tokenId.toNumber());

        setBalanceAirDrop(balanceAir);
        setBalanceReward(balanceReward.toString());
        setBalanceBounty(balanceB);
        setBalanceTeams(balanceT);
        setNumberCrea(creationNFTs.length);
        setNumberWin(winNfts.length);

        // console.log(balanceCoinSpace);
        // setBalanceSPC(balanceCoinSpace);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return error;
    }
  };

  const handleAccountsChanged = async (accounts) => {
    const newAccount = accounts[0];

    setAccount(newAccount);
    await initializeMetaMask();
    await fetchData();
  };

  const connectToZamaDevnet = async () => {
    try {
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
        ],
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error connecting to Fhenix Devnet:", error);
    }
  };

  const checkNetwork = async () => {
    if (window.ethereum) {
      try {
        const networkId = await window.ethereum.request({
          method: "eth_chainId",
        });
        //  if (networkId !== "0x2382") {
        if (networkId !== "0x1f49") {
          const userResponse = window.confirm(
            "Please switch to Zama Devnet network to use this application. Do you want to switch now?"
          );

          if (userResponse) {
            await connectToZamaDevnet();
          }
        }
      } catch (error) {
        console.error("Error checking network:", error);
      }
    }
  };

  const estimate = async () => {
    try {
      setIsTransactionEstimateStakePending(true);
      const userAddress = await signer.getAddress();
      console.log(contract, userAddress);
      const n = await contract.estimateRewardPlayer({
        from: userAddress,
        gasLimit: 1000000,
      });
      await n.wait();
      const b = await contractAirdrop.getBalanceAirdrop(userAddress);
      setIsTransactionEstimateStakePending(false);

      // console.log(b.toString());
      setBalanceReward(b.toString());
    } catch (error) {
      console.error(error);
      setIsTransactionEstimateStakePending(false);
    }
  };

  const claim = async () => {
    try {
      setIsTransactionClaimStakePending(true);

      const userAddress = await signer.getAddress();
      const gasEstimation = await contract.estimateGas.claimAirDrop({
        from: userAddress,
      });
      const gasLimit = getMargeErrorTx(gasEstimation);

      const n = await contract.claimAirDrop({
        from: userAddress,
        gasLimit,
      });
      await n.wait();
      setIsTransactionClaimStakePending(false);

      setBalanceReward(0);
    } catch (error) {
      console.log(error);
      setIsTransactionClaimStakePending(false);
    }
  };
  // Dans votre useEffect de cleanup (composantWillUnmount)

  useEffect(() => {
    checkNetwork();
    initializeMetaMask();
  }, []);

  if (!signer && !isLoading) {
    return (
      <ErrorMetamask message="Please connect to MetaMask and go to zama devnet" />
    );
  }
  // if (isLoading) return <Loading />;

  // Fonction pour récupérer les données

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <Link href="/">
          <button className={`${styles.backHome}`}>Back Home</button>
        </Link>
      </div>
      <div className={styles.firstContainer}>
        <h1>AirDrop</h1>
        <p>
          Here is the airdrop section. The initial Total Supply is to be
          distributed among the players (airdrop), the teams, and the bounties.
        </p>
        <br />
        <h3 style={{ color: "#a88314" }}>
          Total distribution SpaceCoin:{" "}
          <p style={{ display: "inline", margin: 0 }}>50 000 000 SPC</p>
        </h3>
      </div>
      <div className={styles.tableContainer}>
        <div className={styles.firstContainer}>
          <h2>Repartition: </h2>
          <table className={styles.airdropTable}>
            <thead>
              <tr>
                <th>Actors</th>
                <th>Balance Initial</th>
                <th>Balance Actual</th>
              </tr>
            </thead>
            <tbody>
              {/* Ligne pour chaque acteur */}
              <tr>
                <td>AirDrop</td>
                <td>40000000.0</td>
                <td>{balanceAirDrop}</td>
              </tr>
              <tr>
                <td>Bounty</td>
                <td>5000000.0</td>
                <td>{balanceBounty}</td>
              </tr>
              <tr>
                <td>Teams</td>
                <td>5000000.0</td>
                <td>{balanceTeams}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.firstContainer}>
        <h1>My airdrop stat</h1>
        <div className={styles.balanceAndAddress}>
          <h3 style={{ color: "green" }}>
            Total number of win GeoSpace:{" "}
            <p style={{ display: "inline", margin: 0 }}>{numberWin} GSP</p>
          </h3>
          <h3 style={{ color: "green" }}>
            Total number of creation GeoSpace:{" "}
            <p style={{ display: "inline", margin: 0 }}>{numberCrea} SPC</p>
          </h3>
          <h3 style={{ color: "#a88314" }}>
            My reward airdrop:{" "}
            <p style={{ display: "inline", margin: 0 }}>{balanceReward} SPC</p>
          </h3>
        </div>
        <div style={{ flex: 1 }}>
          <div className={`${styles.yourNFTs}`}>
            <React.Fragment>
              {balanceReward > 0 ? (
                <div>
                  <h2>Claim your aidrop</h2>

                  {isTransactionClaimPending ? (
                    <CircleLoader
                      css={overrideCircle}
                      size={30}
                      color={"#107a20"}
                      loading={true}
                    />
                  ) : (
                    // <a
                    //   className={`${styles.red2Button} ${styles.buttonSpacing}`}
                    //   onClick={resetNFTs}
                    // >
                    <a className={styles.accessButton} onClick={claim}>
                      Claim
                    </a>
                  )}
                </div>
              ) : (
                ""
              )}
              <h2>Estimate your reward aidrop</h2>

              {isTransactionEstimatePending ? (
                <CircleLoader
                  css={overrideCircle}
                  size={30}
                  color={"#107a20"}
                  loading={true}
                />
              ) : (
                <a className={styles.accessButton} onClick={estimate}>
                  Estimate
                </a>
              )}
            </React.Fragment>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirDrop;
