import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import initMetaMask from "../../utils/metamask";
import abi from "../../utils/abi/abi";
import styles from "./profil.module.css";
import ErrorMetamask from "../errorPage/metamask";
import Link from "next/link";
import axios from "axios";
import { getFhevmInstance } from "../../utils/fhevmInstance";

function createSquareAroundPointWithDecimals(
  latitude,
  longitude,
  distanceInKilometers
) {
  // Convertissez la distance en degrés en fonction de la latitude
  const degreesPerKilometer = 1 / 111.32; // En supposant une latitude proche de l'équateur

  // Calculez la taille du carré en degrés
  const degreesDelta = distanceInKilometers * degreesPerKilometer;

  // Coordonnées du coin nord-ouest du carré
  const northLat = latitude + degreesDelta / 2;
  const westLon = longitude - degreesDelta / 2;

  // Coordonnées du coin sud-est du carré
  const southLat = latitude - degreesDelta / 2;
  const eastLon = longitude + degreesDelta / 2;

  // Conversion en coordonnées sans décimales
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
const Profil = () => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [stakedNFTs, setStakedNFTs] = useState([]); // Ajout de l'état pour les NFTs stakés
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

  const [isMetaMaskInitialized, setIsMetaMaskInitialized] = useState(false);

  const checkIfMessageIsSigned = async (message) => {
    try {
      const signature = await signer.signMessage(
        ethers.utils.toUtf8Bytes(message)
      );
      await axios.post(
        `${process.env.SERVER}${process.env.ROUTE_PROFIL_SAVE_SIGNATURE}`,
        { signature, id: message }
      );
      return signature;
      //console.log(response);
      // Stockez la signature dans l'état local ou envoyez-la à votre serveur pour vérification
      //setSignature(signature);
    } catch (error) {
      console.log(erreur);
      // La signature a échoué, l'utilisateur n'a pas signé le message
    }
  };

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
        const contract = new ethers.Contract(
          process.env.CONTRACT, // Adresse de votre contrat
          abi, // ABI de votre contrat
          signer
        );

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

  const fetchData = async () => {
    try {
      if (signer) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const userAddress = await signer.getAddress();
        const ownedNFTIds = await contract.getNFTsByOwner(userAddress);
        const resetNfts = await contract.getNFTsResetByOwner(userAddress);
        const stakedNFTIds = await contract.getNFTsStakedByOwner(userAddress);
        const balanceWei = await provider.getBalance(userAddress); // Récupère le solde en wei
        const balanceEther = ethers.utils.formatUnits(balanceWei, "ether"); // Convertit le solde en ethers
        const ownedNFTs = ownedNFTIds.map((tokenId) => tokenId.toNumber());
        const stakedNFTs = stakedNFTIds.map((tokenId) => tokenId.toNumber());
        const resetNFTs = resetNfts.map((tokenId) => tokenId.toNumber());

        // Utilisez la méthode filter pour exclure les NFTs qui sont également dans resetNFTs
        const filteredOwnedNFTs = ownedNFTs.filter(
          (tokenId) =>
            !resetNFTs.includes(tokenId) && !stakedNFTs.includes(tokenId)
        );
        setOwnedNFTs(filteredOwnedNFTs);
        setAccount(userAddress);
        setBalance(balanceEther); // Met à jour le solde au format ether
        setStakedNFTs(stakedNFTs);
        setResetNFT(resetNFTs);
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

    // Réinitialisez les données lorsque le compte change
    setBalance(0);
    setOwnedNFTs([]);
    setStakedNFTs([]);
    // Appelez fetchData pour mettre à jour les données
    fetchData();
  };

  const stakeSelectedNFTs = async () => {
    if (selectedNFTs.length === 0) {
      // Aucun NFT sélectionné pour staker
      return;
    }

    try {
      // Appelez la fonction `stakeNFT` du contrat intelligent pour staker les NFTs sélectionnés.
      const rep = await contract.stakeNFT(selectedNFTs);
      await rep.wait();

      // Mise à jour de l'état pour refléter les NFTs stakés.
      setStakedNFTs((prevStakedNFTs) => [...prevStakedNFTs, ...selectedNFTs]);

      // Mise à jour de l'état pour exclure les NFTs stakés de la liste des NFTs possédés
      const updatedOwnedNFTs = ownedNFTs.filter(
        (tokenId) => !selectedNFTs.includes(tokenId)
      );
      setOwnedNFTs(updatedOwnedNFTs);

      // Réinitialisez la liste des NFTs sélectionnés
      setSelectedNFTs([]);
    } catch (error) {
      console.error("Error staking NFTs:", error);
    }
  };

  const resetNFTs = async () => {
    if (selectedNFTs.length === 0) {
      // Aucun NFT sélectionné pour réinitialiser
      return;
    }

    try {
      const feesArray = [];
      const ffes = [];
      for (const tokenId of selectedNFTs) {
        const feeInput = document.querySelector(`#feeInput-${tokenId}`);
        const feeValue = feeInput.value || 0; // Use a default value if the user didn't enter anything
        ffes.push(feeValue);
        const amountInWei = ethers.utils.parseUnits(
          feeValue.toString(),
          "ether"
        );
        feesArray.push(amountInWei);
      }
      const rep = await contract.resetNFT(selectedNFTs, feesArray);
      await rep.wait();
      const updatedOwnedNFTs = ownedNFTs.filter(
        (tokenId) => !selectedNFTs.includes(tokenId)
      );
      await axios.post(`${process.env.SERVER}${process.env.ROUTE_NFT_RESET}`, {
        selectedNFTs,
        feesArray: ffes,
      });

      setOwnedNFTs(updatedOwnedNFTs);

      // Mise à jour de l'état pour refléter les NFTs réinitialisés.
      setResetNFT((prevResetNFTs) => [...prevResetNFTs, ...selectedNFTs]);

      setSelectedNFTs([]);
    } catch (error) {
      console.error("Error resetting NFTs:", error);
    }
  };

  const unstakeNFTs = async () => {
    if (selectedStakedNFTs.length === 0) {
      // Aucun NFT staké à dé-staker
      return;
    }

    try {
      // Appelez la fonction `unstakeNFT` du contrat intelligent pour dé-staker les NFTs stakés.
      const rep = await contract.unstakeNFT(selectedStakedNFTs);
      await rep.wait();
      setSelectedStakedNFTs([]); // Réinitialisez la liste des NFTs stakés sélectionnés
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
    if (selectedResetNFTs.length === 0) {
      // Aucun NFT staké à dé-staker
      return;
    }

    try {
      // Appelez la fonction `unstakeNFT` du contrat intelligent pour dé-staker les NFTs stakés.
      const rep = await contract.claimNFT(selectedResetNFTs);
      await rep.wait();
      await axios.post(`${process.env.SERVER}${process.env.ROUTE_NFT_RESET}`, {
        selectedNFTs: selectedResetNFTs,
        feesArray: Array(selectedResetNFTs.length).fill(0),
      });
      // Mettez à jour l'état pour exclure les NFTs réclamés de la liste resetNFT
      const updatedResetNFTs = resetNFT.filter(
        (tokenId) => !selectedResetNFTs.includes(tokenId)
      );
      setResetNFT(updatedResetNFTs);
      // Ajoutez les NFTs réclamés à la liste des NFTs disponibles
      setOwnedNFTs((prevOwnedNFTs) => [...prevOwnedNFTs, ...selectedResetNFTs]);
      // Réinitialisez la liste des NFTs sélectionnés
      setSelectedResetNFTs([]);
    } catch (error) {
      console.error("Error unstaking NFTs:", error);
    }
  };

  const createGps = async () => {
    try {
      // Appelez la fonction `unstakeNFT` du contrat intelligent pour dé-staker les NFTs stakés.

      const number = numberInput;

      const latitude = parseFloat(latitudeInput.replace(",", "."));
      const longitude = parseFloat(longitudeInput.replace(",", "."));
      if (isNaN(number) || isNaN(latitude) || isNaN(longitude)) {
        // Vérifiez que les valeurs saisies sont des nombres valides
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
        const obj = [];
        const amt = Number(amountInWei.toString());
        obj.push(
          fhevm.encrypt32(location.northLat),
          fhevm.encrypt32(location.southLat),
          fhevm.encrypt32(location.eastLon),
          fhevm.encrypt32(location.westLon),
          fhevm.encrypt32(location.lat),
          fhevm.encrypt32(location.lng),
          fhevm.encrypt32(amt)
        );
        const id = await contract.getNextTokenId();
        const signature = await checkIfMessageIsSigned(id.toString()); // Vérifiez si le message a déjà été signé
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
      console.error("Error unstaking NFTs:", error);
    }
  };

  if (isLoading)
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  if (!signer) return <ErrorMetamask />;

  let shorterListClass = "";
  if (ownedNFTs.length < stakedNFTs.length) {
    shorterListClass = styles.shorterList;
  } else if (stakedNFTs.length < ownedNFTs.length) {
    shorterListClass = styles.shorterList;
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
                    NFTs Stake
                  </a>

                  <a className={styles.red2Button} onClick={resetNFTs}>
                    NFTs Back in games
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
                <h2>Reset NFTs</h2>
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
                            GeoSpace: {tokenId}
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
