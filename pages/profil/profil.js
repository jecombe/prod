import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import initMetaMask from "../../utils/metamask";
import abi from "../../utils/abi/abi";
import styles from "./profil.module.css";
import ErrorMetamask from "../errorPage/metamask";
import Link from "next/link";
import axios from "axios";
import { getFhevmInstance } from "../../utils/fhevmInstance";

// Fonction utilitaire pour créer un carré autour d'un point avec des décimales
function createSquareAroundPointWithDecimals(
  latitude,
  longitude,
  distanceInKilometers
) {
  const degreesPerKilometer = 1 / 111.32;
  const degreesDelta = distanceInKilometers * degreesPerKilometer;
  const northLat = latitude + degreesDelta / 2;
  const westLon = longitude - degreesDelta / 2;
  const southLat = latitude - degreesDelta / 2;
  const eastLon = longitude + degreesDelta / 2;
  const scaledNorthLat = Math.trunc(northLat * 1e5);
  const scaledWestLon = Math.trunc(westLon * 1e5);
  const scaledSouthLat = Math.trunc(southLat * 1e5);
  const scaledEastLon = Math.trunc(eastLon * 1e5);

  return {
    northLat: scaledNorthLat,
    southLat: scaledSouthLat,
    eastLon: scaledEastLon,
    westLon: scaledWestLon,
    lat: Math.trunc(latitude * 1e5),
    lng: Math.trunc(longitude * 1e5),
  };
}

// Composant Profil
const Profil = () => {
  // États
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [stakedNFTs, setStakedNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [selectedStakedNFTs, setSelectedStakedNFTs] = useState([]);
  const [selectedResetNFTs, setSelectedResetNFTs] = useState([]);
  const [fhevm, setFhevm] = useState(null);
  const [numberInput, setNumberInput] = useState(0);
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [resetNFT, setResetNFT] = useState([]);
  const [creationNFT, setCreationNFT] = useState([]);
  const [feesNftMap, setFeesNftMap] = useState({});

  const [isMetaMaskInitialized, setIsMetaMaskInitialized] = useState(false);

  // Effets
  useEffect(() => {
    if (isMetaMaskInitialized && signer) {
      fetchData();
    }
  }, [isMetaMaskInitialized, signer]);

  useEffect(() => {
    const initializeMetaMask = async () => {
      try {
        setIsLoading(true);
        const signer = await initMetaMask();
        const contract = new ethers.Contract(process.env.CONTRACT, abi, signer);

        const fhevmInstance = await getFhevmInstance();
        setFhevm(fhevmInstance);

        setSigner(signer);
        setContract(contract);
        setIsMetaMaskInitialized(true);

        if (window.ethereum) {
          window.ethereum.on("accountsChanged", handleAccountsChanged);
        }
      } catch (error) {
        console.error("Error initializing MetaMask:", error);
        setIsLoading(false);
      }
    };

    initializeMetaMask();
  }, []);

  useEffect(() => {
    if (isMetaMaskInitialized) {
      fetchData();
    }
  }, [isMetaMaskInitialized, signer, contract]);

  // Fonction fetchData optimisée
  const fetchData = async () => {
    try {
      if (signer) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const userAddress = await signer.getAddress();
        const nftsStake = await contract.getNFTsStakedByOwner(userAddress);
        const nftsAndFees = await contract.getNFTsAndFeesByOwner(userAddress);
        const nftsRAndFees = await contract.getResetNFTsAndFeesByOwner(
          userAddress
        );

        const nftsReset = await contract.getNFTsResetByOwner(userAddress);
        const nftsCreationFees = await contract.getNftCreationAndFeesByUser(
          userAddress
        );
        // const [ownedNFTIds, resetNfts, stakedNFTIds] = await Promise.all([
        //   contract.getNFTsByOwner(userAddress),
        //   contract.getNFTsResetByOwner(userAddress),
        //   contract.getNFTsStakedByOwner(userAddress),
        // ]);
        const balanceWei = await provider.getBalance(userAddress);
        const balanceEther = ethers.utils.formatUnits(balanceWei, "ether");
        const ownedNFTs = nftsAndFees[0].map((tokenId) => tokenId.toNumber());
        const stakedNFTs = nftsStake.map((tokenId) => tokenId.toNumber());
        const resetNFTs = nftsReset.map((tokenId) => tokenId.toNumber());
        const feesNft = nftsRAndFees[1].map((tokenId) => tokenId.toString());
        const creationNFTs = nftsCreationFees[0].map((tokenId) =>
          tokenId.toNumber()
        );
        const feesCreationNFTs = nftsCreationFees[1].map((tokenId) =>
          tokenId.toString()
        );

        const feesNftMap = {};
        feesNft.forEach((fee, index) => {
          feesNftMap[resetNFTs[index]] = fee;
        });

        setFeesNftMap(feesNftMap);

        const filteredOwnedNFTs = ownedNFTs.filter(
          (tokenId) =>
            !resetNFTs.includes(tokenId) && !stakedNFTs.includes(tokenId)
        );

        setOwnedNFTs(filteredOwnedNFTs);
        setAccount(userAddress);
        setBalance(balanceEther);
        setStakedNFTs(stakedNFTs);
        setResetNFT(resetNFTs);
        setCreationNFT(creationNFTs);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    const newAccount = accounts[0];
    setAccount(newAccount);
    const signer = await initMetaMask();
    setSigner(signer);

    setBalance(0);
    setOwnedNFTs([]);
    setStakedNFTs([]);
    fetchData();
  };

  const stakeSelectedNFTs = async () => {
    if (selectedNFTs.length === 0) return;

    try {
      const rep = await contract.stakeNFT(selectedNFTs);
      await rep.wait();

      setStakedNFTs((prevStakedNFTs) => [...prevStakedNFTs, ...selectedNFTs]);

      const updatedOwnedNFTs = ownedNFTs.filter(
        (tokenId) => !selectedNFTs.includes(tokenId)
      );
      setOwnedNFTs(updatedOwnedNFTs);

      setSelectedNFTs([]);
    } catch (error) {
      console.error("Error staking NFTs:", error);
    }
  };

  const resetNFTs = async () => {
    if (selectedNFTs.length === 0) return;

    try {
      const feesArray = [];
      const ffes = [];

      for (const tokenId of selectedNFTs) {
        const feeInput = document.querySelector(`#feeInput-${tokenId}`);
        const feeValue = feeInput.value || 0;
        ffes.push(feeValue);

        const amountInWei = ethers.utils.parseUnits(
          feeValue.toString(),
          "ether"
        );
        feesArray.push(amountInWei);
      }
      const rep = await contract.resetNFT(selectedNFTs, [1]);
      await rep.wait();

      const updatedOwnedNFTs = ownedNFTs.filter(
        (tokenId) => !selectedNFTs.includes(tokenId)
      );
      await axios.post(`${process.env.SERVER}${process.env.ROUTE_NFT_RESET}`, {
        selectedNFTs,
        feesArray: ffes,
      });

      setOwnedNFTs(updatedOwnedNFTs);
      setResetNFT((prevResetNFTs) => [...prevResetNFTs, ...selectedNFTs]);
      setSelectedNFTs([]);
    } catch (error) {
      console.error("Error resetting NFTs:", error);
    }
  };

  const unstakeNFTs = async () => {
    if (selectedStakedNFTs.length === 0) return;

    try {
      const rep = await contract.unstakeNFT(selectedStakedNFTs);
      await rep.wait();

      setSelectedStakedNFTs([]);
      const updatedStakedNFTs = stakedNFTs.filter(
        (tokenId) => !selectedStakedNFTs.includes(tokenId)
      );
      setStakedNFTs(updatedStakedNFTs);
      setOwnedNFTs((prevOwnedNFTs) => [
        ...prevOwnedNFTs,
        ...selectedStakedNFTs,
      ]);
    } catch (error) {
      console.error("Error unstaking NFTs:", error);
    }
  };

  const claimNft = async () => {
    if (selectedResetNFTs.length === 0) return;

    try {
      const rep = await contract.cancelResetNFT(selectedResetNFTs);
      await rep.wait();
      await axios.post(`${process.env.SERVER}${process.env.ROUTE_NFT_RESET}`, {
        selectedNFTs: selectedResetNFTs,
        feesArray: Array(selectedResetNFTs.length).fill(0),
      });

      const updatedResetNFTs = resetNFT.filter(
        (tokenId) => !selectedResetNFTs.includes(tokenId)
      );
      setResetNFT(updatedResetNFTs);
      setOwnedNFTs((prevOwnedNFTs) => [...prevOwnedNFTs, ...selectedResetNFTs]);
      setSelectedResetNFTs([]);
    } catch (error) {
      console.error("Error unstaking NFTs:", error);
    }
  };

  const createGps = async () => {
    try {
      const number = numberInput;
      const latitude = parseFloat(latitudeInput.replace(",", "."));
      const longitude = parseFloat(longitudeInput.replace(",", "."));

      if (isNaN(number) || isNaN(latitude) || isNaN(longitude)) {
        console.error("Invalid input");
        return;
      }

      const rep = await axios.post(
        `${process.env.SERVER}${process.env.ROUTE_PROFIL_CHECK_NEW_GPS}`,
        {
          latitude,
          longitude,
        }
      );

      const amountInWei = ethers.utils.parseUnits(number.toString(), "ether");

      if (rep.data.success) {
        const location = createSquareAroundPointWithDecimals(
          latitude,
          longitude,
          5
        );
        const obj = [
          fhevm.encrypt32(location.northLat),
          fhevm.encrypt32(location.southLat),
          fhevm.encrypt32(location.eastLon),
          fhevm.encrypt32(location.westLon),
          fhevm.encrypt32(location.lat),
          fhevm.encrypt32(location.lng),
          fhevm.encrypt32(Number(amountInWei.toString())),
        ];

        const id = await contract.getNextTokenId();
        const signature = await checkIfMessageIsSigned(id.toString());

        const rep = await contract.createNftForOwner(obj);
        await rep.wait();
        await axios.post(
          `${process.env.SERVER}${process.env.ROUTE_PROFIL_NEW_GPS}`,
          {
            nftId: Number(id.toString()),
            signature,
          }
        );
      }
    } catch (error) {
      console.error("Error creating GPS NFT:", error);
    }
  };

  // Rendu du composant
  if (isLoading)
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );

  if (!signer) {
    return (
      <ErrorMetamask message="Please connect to MetaMask and go to zama devnet" />
    );
  }
  // Fonction pour récupérer les données
  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <Link href="/">
          <button className={`${styles.backHome} center-left-button`}>
            Back Home
          </button>
        </Link>
      </div>
      <div className={styles.firstContainer}>
        <h1>Profil</h1>
      </div>
      <div className={styles.balanceAndAddress}>
        <div className={styles.headerItem}>
          <h3> My address </h3>
          <p>{account}</p>
        </div>

        <div className={styles.headerItem}>
          <h3>My balance </h3>
          <p>{balance} ZAMA</p>
        </div>
      </div>
      {ownedNFTs.length === 0 &&
      resetNFT.length === 0 &&
      stakedNFTs.length === 0 ? (
        <div className={styles.needToPlay}>
          <h1>You don&#39;t have any nft</h1>
          <p>you need to play to win nft</p>
        </div>
      ) : (
        <div className={styles.containerInfos}>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <div className={`${styles.yourStakedNft}`}>
                <h2>Your available NFTs</h2>
                <p>
                  just select nft to stake or to put your NFT back into play
                  with your fees. (default is set on 0)
                </p>
                <React.Fragment>
                  <ul>
                    {ownedNFTs.map((tokenId) => (
                      <li key={tokenId}>
                        <label>
                          <input
                            type="checkbox"
                            value={tokenId}
                            checked={selectedNFTs.includes(tokenId)}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              setSelectedNFTs((prevSelected) =>
                                prevSelected.includes(value)
                                  ? prevSelected.filter((id) => id !== value)
                                  : [...prevSelected, value]
                              );
                            }}
                            disabled={
                              stakedNFTs.includes(tokenId) ||
                              resetNFT.includes(tokenId)
                            }
                          />
                          GeoSpace {tokenId}
                        </label>
                        <input
                          id={`feeInput-${tokenId}`} // ID unique pour chaque champ de saisie
                          type="number"
                          placeholder="Enter a fees reset"
                          min="0"
                          // Add any additional attributes or event handlers as needed
                        />
                      </li>
                    ))}
                  </ul>
                  <a className={styles.red2Button} onClick={stakeSelectedNFTs}>
                    Stake NFTs
                  </a>

                  <a className={styles.red2Button} onClick={resetNFTs}>
                    Back in Game NFTs
                  </a>
                </React.Fragment>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className={`${styles.yourStakedNft}`}>
                <h2>Staked NFTs</h2>

                <p>just select nft to unstake</p>
                {stakedNFTs.length === 0 ? (
                  <p>Find a NFT first before staking</p>
                ) : (
                  <React.Fragment>
                    <ul>
                      {stakedNFTs.map((tokenId) => (
                        <li key={tokenId}>
                          <label>
                            <input
                              type="checkbox"
                              value={tokenId}
                              checked={selectedStakedNFTs.includes(tokenId)}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setSelectedStakedNFTs((prevSelected) =>
                                  prevSelected.includes(value)
                                    ? prevSelected.filter((id) => id !== value)
                                    : [...prevSelected, value]
                                );
                              }}
                            />
                            GeoSpace {tokenId}
                          </label>
                        </li>
                      ))}
                    </ul>
                    <a className={styles.redButton} onClick={unstakeNFTs}>
                      Unstake Selected NFTs
                    </a>
                  </React.Fragment>
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className={`${styles.yourResetNft}`}>
                <h2>NFTs Back in game </h2>
                <p>just select nft to clean reset</p>
                {resetNFT.length === 0 ? (
                  <p>
                    Please select nft on your collection to put back in games
                  </p>
                ) : (
                  <React.Fragment>
                    <ul>
                      {resetNFT.map((tokenId) => (
                        <li key={tokenId}>
                          <label>
                            <input
                              type="checkbox"
                              value={tokenId}
                              checked={selectedResetNFTs.includes(tokenId)}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setSelectedResetNFTs((prevSelected) =>
                                  prevSelected.includes(value)
                                    ? prevSelected.filter((id) => id !== value)
                                    : [...prevSelected, value]
                                );
                              }}
                            />
                            GeoSpace: {tokenId} (Fee: {feesNftMap[tokenId]}{" "}
                            ZAMA)
                          </label>
                        </li>
                      ))}
                    </ul>
                    <a className={styles.redButton} onClick={claimNft}>
                      Claim Selected NFTs
                    </a>
                  </React.Fragment>
                )}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div className={`${styles.yourResetNft}`}>
                <h2>NFTs Creation</h2>
                <p>just see nft your nft creation</p>
                {creationNFT.length === 0 ? (
                  <p>No creation nft</p>
                ) : (
                  <React.Fragment>
                    <ul>
                      {creationNFT.map((tokenId) => (
                        <li key={tokenId}>
                          <label>GeoSpace: {tokenId}</label>
                        </li>
                      ))}
                    </ul>
                  </React.Fragment>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={styles.containerAccess}>
        {stakedNFTs.length >= 3 && ( // Condition pour afficher le bouton si le nombre de NFTs stakés est supérieur à 3
          <>
            <form>
              <label>
                Number:
                <input
                  type="number"
                  value={numberInput}
                  onChange={(e) =>
                    setNumberInput(Math.max(0, parseInt(e.target.value)))
                  }
                  min="0"
                />
              </label>
              <label>
                Latitude:
                <input
                  type="number"
                  value={latitudeInput}
                  onChange={(e) => setLatitudeInput(e.target.value)}
                />
              </label>
              <label>
                Longitude:
                <input
                  type="number"
                  value={longitudeInput}
                  onChange={(e) => setLongitudeInput(e.target.value)}
                />
              </label>
            </form>
            <a className={styles.accessButton} onClick={createGps}>
              Create Gps
            </a>
          </>
        )}

        {ownedNFTs.length === 0 &&
          stakedNFTs.length === 0 &&
          resetNFT.length === 0 && (
            // Condition pour afficher le bouton si le nombre de NFTs stakés est supérieur à 3
            <Link href="/game/game">
              <button className={`${styles.backHome} center-left-button`}>
                PLAY
              </button>
            </Link>
          )}
      </div>
    </div>
  );
};

export default Profil;
