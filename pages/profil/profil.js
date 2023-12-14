import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import initMetaMask from "../../utils/metamask";
import abi from "../../utils/abi/abi";
import styles from "./profil.module.css";
import ErrorMetamask from "../errorPage/metamask";
import Link from "next/link";
import axios from "axios";
import { getFhevmInstance } from "../../utils/fhevmInstance";
import Loading from "../loading/loading";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { parseUnits } from "ethers/lib/utils";
import { css } from "@emotion/react";
import { PropagateLoader, CircleLoader } from "react-spinners";
import { useRef } from "react";

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
const Profil = () => {
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
  const [balance, setBalance] = useState(0);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [stakedNFTs, setStakedNFTs] = useState([]);
  const [createdNFTs, setCreatedNFTs] = useState([]);

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
  const [decryptedNFTS, setDecrypted] = useState([]);
  const [errorsFetch, setErrorFetch] = useState("");
  // const [isAccessGovernance, setAccessGovernance] = useState(false);
  // const [isAccessCreate, setAccessCreate] = useState(false);

  const [isTransactionStakePending, setIsTransactionStakePending] =
    useState(false);
  const [isTransactionUnstakePending, setIsTransactionUnstakePending] =
    useState(false);

  const [isTransactionResetPending, setIsTransactionResetPending] =
    useState(false);
  const [isTransactionClaimPending, setIsTransactionClaimPending] =
    useState(false);

  const [isTransactionCreatePending, setIsTransactionCreatePending] =
    useState(false);

  const [isMetaMaskInitialized, setIsMetaMaskInitialized] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [isMapsScriptLoaded, setIsMapsScriptLoaded] = useState(false);
  const [isMapsLoadingData, setLoadingDataMap] = useState(false);

  const [showMap, setShowMap] = useState(false);
  const [balanceSPC, setBalanceSPC] = useState(0);
  const [contractCoin, setContractCoin] = useState(null);
  const createGeoSpaceRef = useRef(null);

  const [position, setPosition] = useState({ lat: 0, lng: 0 });
  const lib = ["places"];

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

      const fhevmInstance = await getFhevmInstance();
      setFhevm(fhevmInstance);
      setSigner(signer);
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

  // useEffect(() => {
  //   initializeMetaMask();
  // }, []);

  const callDecrypt = async (ownedNfts, userAddress, gasFees) => {
    const promises = ownedNfts.map((tokenId, index) =>
      contract.getNFTLocationForOwner(tokenId, {
        from: userAddress,
        gasLimit: gasFees[index],
      })
    );

    return Promise.all(promises);
  };
  const callDecryptGas = async (ownedNfts, userAddress) => {
    const promises = [];
    for (const tokenId of ownedNfts) {
      promises.push(
        contract.estimateGas.getNFTLocationForOwner(tokenId, {
          from: userAddress,
        })
      );
    }
    return Promise.all(promises);
  };
  const formaterNombre = (nombre) => {
    const nombreEnChaine = nombre.toString();

    if (nombreEnChaine.length === 7) {
      // Si le nombre a 7 chiffres, placez la virgule après le deuxième chiffre
      return nombreEnChaine.slice(0, 2) + "." + nombreEnChaine.slice(2);
    } else if (nombreEnChaine.length === 6) {
      // Si le nombre a 6 chiffres, placez la virgule après le premier chiffre
      return nombreEnChaine[0] + "." + nombreEnChaine.slice(1);
    } else {
      // Pour d'autres longueurs, laissez la représentation du nombre inchangée
      return nombreEnChaine;
    }
  };

  const setMarkerArray = (array) => {
    if (array.length > 0) {
      const markersData = array.map((marker, i) => {
        const lat = Number(marker[4]);
        const lng = Number(marker[5]);

        const latConvert = Number(formaterNombre(lat));
        const lngConvert = Number(formaterNombre(lng));

        return {
          position: {
            lat: latConvert,
            lng: lngConvert,
          },
          id: i,
          title: `GeoSpace ${i}`,
        };
      });
      setMarkers(markersData);
    }
  };
  useEffect(() => {
    setMarkerArray(decryptedNFTS);
  }, [decryptedNFTS]);

  const getAllOwnedNfts = () => {
    const assambly = [];
    if (ownedNFTs.length > 0) {
      assambly.push(ownedNFTs);
    }
    if (stakedNFTs.length > 0) {
      assambly.push(stakedNFTs);
    }
    if (resetNFT.length > 0) {
      assambly.push(resetNFT);
    }
    if (createdNFTs.length > 0) {
      assambly.push(createdNFTs);
    }
    return assambly.reduce((acc, currentArray) => acc.concat(currentArray), []);
  };
  const fetchDecrypt = async () => {
    if (signer) {
      try {
        setLoadingDataMap(true);
        const assamblage = getAllOwnedNfts();
        const decryptedLocations = await callDecryptGas(assamblage, account);
        console.log(decryptedLocations);
        const gasFees = [];
        decryptedLocations.forEach((value, index) => {
          const gasLimit = getMargeErrorTx(value);
          gasFees.push(gasLimit);
        });
        const decryptedGps = await callDecrypt(assamblage, account, gasFees);
        setDecrypted(decryptedGps);
        setMarkerArray(decryptedGps);
        setLoadingDataMap(false);
      } catch (error) {
        console.error("error get decrypt", error);
        setLoadingDataMap(false);
        return error;
      }
    }
  };

  const handleShowMap = async (isShow) => {
    try {
      setErrorFetch("");

      if (isShow) {
        if (!decryptedNFTS.length) await fetchDecrypt();
      }
      setShowMap(isShow);
    } catch (error) {
      console.error("fetch decrypt: ", error);
      setShowMap(false);
      setErrorFetch("Error decrypt maps");
    }
  };
  // Fonction fetchData optimisée
  const fetchData = async () => {
    try {
      setErrorFetch("");
      if (signer) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const userAddress = await signer.getAddress();
        // Créez un tableau de promesses
        const promises = [
          contract.getNFTsStakedByOwner(userAddress),
          contract.getOwnedNFTs(userAddress),
          contract.getResetNFTsAndFeesByOwner(userAddress),
          contract.getNftCreationAndFeesByUser(userAddress),
          provider.getBalance(userAddress),
          contract.getBalanceCoinSpace(userAddress),
        ];

        const [
          nftsStake,
          nftsOwned,
          nftsRAndFees,
          nftsCreationFees,
          balanceWei,
          balanceWeiCoinSpace,
        ] = await Promise.all(promises);
        const balanceEther = Math.round(
          ethers.utils.formatUnits(balanceWei, "ether")
        );
        const balanceCoinSpace = ethers.utils.formatUnits(
          balanceWeiCoinSpace,
          "ether"
        );

        const ownedNFTs = nftsOwned.map((tokenId) => tokenId.toNumber());

        const stakedNFTs = nftsStake.map((tokenId) => tokenId.toNumber());
        const resetNFTs = nftsRAndFees[0].map((tokenId) => tokenId.toNumber());
        const feesNft = nftsRAndFees[1].map((tokenId) => tokenId.toString());
        const creationNFTs = nftsCreationFees[0].map((tokenId) =>
          tokenId.toNumber()
        );
        const creationNFTsFees = nftsCreationFees[1].map((tokenId) =>
          tokenId.toString()
        );

        const nftsCreaFee = creationNFTs.map((id, index) => ({
          id,
          fee: Math.round(
            ethers.utils.formatUnits(creationNFTsFees[index], "ether")
          ),
        }));
        setCreatedNFTs(creationNFTs);

        const feesNftMap = {};
        feesNft.forEach((fee, index) => {
          const valueEth = Math.round(ethers.utils.formatUnits(fee, "ether"));

          feesNftMap[resetNFTs[index]] = valueEth;
        });

        setFeesNftMap(feesNftMap);

        const filteredOwnedNFTs = ownedNFTs.filter(
          (tokenId) =>
            !resetNFTs.includes(tokenId) && !stakedNFTs.includes(tokenId)
        );

        setOwnedNFTs(filteredOwnedNFTs);
        setAccount(userAddress);
        setBalance(balanceEther);
        setBalanceSPC(balanceCoinSpace);
        setStakedNFTs(stakedNFTs);
        setResetNFT(resetNFTs);
        setCreationNFT(nftsCreaFee);
        // const assamblage = getAllOwnedNfts();
        // if (stakedNFTs.length >= 3) {
        //   setAccessCreate(true);
        // } else setAccessCreate(false);
        // if (assamblage.length > 0) {
        //   setAccessGovernance(true);
        // } else {
        //   setAccessGovernance(false);
        // }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorFetch("Error fetching data");
      setAccessCreate(false);

      return error;
    }
  };

  const handleAccountsChanged = async (accounts) => {
    const newAccount = accounts[0];

    setAccount(newAccount);
    // const signer = await initMetaMask();
    // setSigner(signer);
    await initializeMetaMask();
    // setBalance(0);
    // setBalanceSPC(0);
    // setOwnedNFTs([]);
    // setStakedNFTs([]);
    await fetchData();
  };

  const stakeSelectedNFTs = async () => {
    if (selectedNFTs.length === 0) {
      alert("Please select NFTs to stake");
      return;
    }

    try {
      setIsTransactionStakePending(true); // Set transaction pending state

      const gasEstimation = await contract.estimateGas.stakeNFT(selectedNFTs);
      const gasLimit = getMargeErrorTx(gasEstimation);
      const rep = await contract.stakeNFT(selectedNFTs, { gasLimit });

      await rep.wait();
      setIsTransactionStakePending(false); // Set transaction pending state

      setStakedNFTs((prevStakedNFTs) => [...prevStakedNFTs, ...selectedNFTs]);

      const updatedOwnedNFTs = ownedNFTs.filter(
        (tokenId) => !selectedNFTs.includes(tokenId)
      );
      setOwnedNFTs(updatedOwnedNFTs);

      setSelectedNFTs([]);
    } catch (error) {
      setIsTransactionStakePending(false); // Set transaction pending state

      console.error("Error staking NFTs:", error);
    }
  };

  const resetNFTs = async () => {
    if (selectedNFTs.length === 0) {
      alert("Please select NFTs to reset");
      return;
    }

    try {
      setIsTransactionResetPending(true); // Set transaction pending state

      const feesArray = [];
      const ffes = [];
      const feesNftMap = {};

      for (const tokenId of selectedNFTs) {
        const feeInput = document.querySelector(`#feeInput-${tokenId}`);
        const feeValue = feeInput.value || 0;
        ffes.push(feeValue);

        const amountInWei = ethers.utils.parseUnits(
          feeValue.toString(),
          "ether"
        );
        feesArray.push(amountInWei);
        feesNftMap[tokenId] = Number(feeValue.toString());
      }
      setFeesNftMap(feesNftMap);

      const gasEstimation = await contract.estimateGas.resetNFT(
        selectedNFTs,
        feesArray
      );
      const gasLimit = getMargeErrorTx(gasEstimation);
      const rep = await contract.resetNFT(selectedNFTs, feesArray, {
        gasLimit,
      });
      await rep.wait();

      setIsTransactionResetPending(false); // Set transaction pending state

      setResetNFT((prevResetNFTs) => [...prevResetNFTs, ...selectedNFTs]);

      const updatedOwnedNFTs = ownedNFTs.filter(
        (tokenId) => !selectedNFTs.includes(tokenId)
      );
      setOwnedNFTs(updatedOwnedNFTs);

      setSelectedNFTs([]);
    } catch (error) {
      setIsTransactionResetPending(false); // Set transaction pending state

      console.error("Error resetting NFTs:", error);
    }
  };

  const unstakeNFTs = async () => {
    if (selectedStakedNFTs.length === 0) {
      ("Please select NFTs to unstake");
      return;
    }

    try {
      setIsTransactionUnstakePending(true); // Set transaction pending state

      const rep = await contract.unstakeNFT(selectedStakedNFTs);
      await rep.wait();
      setIsTransactionUnstakePending(false); // Set transaction pending state

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
      setIsTransactionUnstakePending(false); // Set transaction pending state

      console.error("Error unstaking NFTs:", error);
    }
  };

  const claimNft = async () => {
    if (selectedResetNFTs.length === 0) {
      alert("Please select NFTs to cancel reset");
      return;
    }

    try {
      setIsTransactionClaimPending(true); // Set transaction pending state
      const gasEstimation = await contract.estimateGas.cancelResetNFT(
        selectedResetNFTs
      );
      const gasLimit = getMargeErrorTx(gasEstimation);
      const rep = await contract.cancelResetNFT(selectedResetNFTs, {
        gasLimit,
      });
      await rep.wait();

      setIsTransactionClaimPending(false); // Set transaction pending state

      setSelectedResetNFTs([]);
      const updatedResetNFTs = resetNFT.filter(
        (tokenId) => !selectedResetNFTs.includes(tokenId)
      );
      setResetNFT(updatedResetNFTs);
      setOwnedNFTs((prevOwnedNFTs) => [...prevOwnedNFTs, ...selectedResetNFTs]);
    } catch (error) {
      setIsTransactionClaimPending(false); // Set transaction pending state

      console.error("Error reset claim NFTs:", error);
    }
  };

  const createGps = async () => {
    try {
      setIsTransactionCreatePending(true); // Set transaction pending state

      const number = numberInput;
      const latitude = parseFloat(latitudeInput.replace(",", "."));
      const longitude = parseFloat(longitudeInput.replace(",", "."));

      if (isNaN(number) || isNaN(latitude) || isNaN(longitude)) {
        alert("Invalid input");
        setIsTransactionCreatePending(false); // Set transaction pending state

        return;
      }

      if (number < 0 || latitude < 0 || longitude < 0) {
        alert(
          "Please set a positive value because now the smart contract only handles positive numbers (uint)"
        );
        setIsTransactionCreatePending(false); // Set transaction pending state

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
        ];

        const objFees = [amountInWei];
        const erc20Contract = new ethers.Contract(
          process.env.TOKEN,
          abi,
          signer
        );
        const feesCreation = await axios.get(
          `${process.env.SERVER}${process.env.ROUTE_GET_FEES_CREATION}`
        );
        const approvalAmount = parseUnits(feesCreation.data, 18);
        console.log(approvalAmount);

        const gasEstimation = await erc20Contract.estimateGas.approve(
          process.env.CONTRACT,
          approvalAmount
        );
        const gasLimit = getMargeErrorTx(gasEstimation);

        const approvalTx = await erc20Contract.approve(
          process.env.CONTRACT,
          approvalAmount,
          { gasLimit }
        );

        await approvalTx.wait();

        const gasEstimationCreate =
          await contract.estimateGas.createGpsOwnerNft(obj, objFees);
        const gasLimitCreate = getMargeErrorTx(gasEstimationCreate);
        let whatFees = gasLimitCreate;

        if (Number(gasEstimation) < 1000000 && gasLimitCreate > 1000000) {
          whatFees = gasEstimation;
        }
        const rep = await contract.createGpsOwnerNft(obj, objFees, {
          gasLimit: gasLimitCreate,
        });

        await rep.wait();
        const id = await contract.totalSupply();

        setCreationNFT((prevCreationNFT) => [
          ...prevCreationNFT,
          {
            id: Number(id.toString()),
            fee: number,
          },
        ]);
        setIsTransactionCreatePending(false); // Set transaction pending state
      } else {
        setIsTransactionCreatePending(false); // Set transaction pending state
        alert("street view non accessible, please enter another street view");
        console.error("Street View Non Disponible");
      }
    } catch (error) {
      setIsTransactionCreatePending(false); // Set transaction pending state

      console.error("Error creating GPS NFT:", error);
    }
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
  // Dans votre useEffect de cleanup (composantWillUnmount)

  useEffect(() => {
    checkNetwork();
    initializeMetaMask();
  }, []);

  // Rendu du composant
  const handleMapLoad = (map) => {
    //try {
    // map.addListener("center_changed", () => {
    //const newCenter = map.getCenter();
    // const newMapPosition = { lat: newCenter.lat(), lng: newCenter.lng() };
    //setPosition(newMapPosition);
    // });
    // } catch (error) {
    //   console.error("Error handling map interaction:", error);
    // }
  };
  if (!signer && !isLoading) {
    return (
      <ErrorMetamask message="Please connect to MetaMask and go to zama devnet" />
    );
  }
  if (isLoading) return <Loading />;

  // Fonction pour récupérer les données

  const getOpt = () => {
    if (window.google && window.google.maps) {
      // Utilisez window.google.maps.Size ici
      return {
        url: "/nfts.png",
        scaledSize: new window.google.maps.Size(40, 40),
      };
      // Utilisez markerIcon dans votre composant ou script
    } else {
      console.error("L'API Google Maps n'est pas chargée.");
      return {};
      // Gérez l'erreur en conséquence, chargez l'API Google Maps, ou prenez d'autres mesures nécessaires
    }
  };
  const scrollToCreateGeoSpace = () => {
    createGeoSpaceRef.current.scrollIntoView({
      behavior: "smooth",
    });
  };
  return (
    <LoadScript
      googleMapsApiKey={process.env.API_MAP}
      libraries={lib}
      onLoad={() => setIsMapsScriptLoaded(true)} // Callback function
    >
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <Link href="/">
            <button className={`${styles.backHome}`}>Back Home</button>
          </Link>
        </div>
        <div className={styles.firstContainer}>
          <h1>My Profil</h1>
        </div>
        <div className={styles.balanceAndAddress}>
          <p>{account}</p>
          <p>{balance} ZAMA</p>
          <p>{balanceSPC} SPC</p>
        </div>
        {ownedNFTs.length === 0 &&
        resetNFT.length === 0 &&
        stakedNFTs.length === 0 ? (
          <div className={styles.needToPlay}>
            <h1>You don&#39;t have any nft</h1>
            <p>you need to play to win nft</p>
          </div>
        ) : (
          <div>
            <div className={styles.titleMap}>
              {/* <h2>Location of your GeoSpace NFTs</h2> */}

              {isMapsLoadingData ? (
                // Affichez le bouton en tant que <p> lorsqu'il est en cours de chargement
                <PropagateLoader
                  css={override}
                  size={10}
                  color={"#a88314"}
                  loading={true}
                />
              ) : (
                // Affichez le bouton en tant que <a> avec le texte approprié
                <a
                  className={styles.accessButton}
                  onClick={() => {
                    if (!isMapsLoadingData) {
                      handleShowMap(!showMap);
                    }
                  }}
                >
                  {showMap ? (
                    // Affichez le bouton pour masquer la carte
                    <span>Hide Map</span>
                  ) : (
                    // Affichez le bouton pour afficher la carte
                    <span>Decrypt Map</span>
                  )}
                </a>
              )}
            </div>

            {isMapsLoadingData && isMapsScriptLoaded && showMap && (
              <div
                style={{
                  height: "300px",
                  top: "10px", // Ajustez la hauteur en fonction de vos besoins
                  margin: "auto", // Center the map horizontally
                  bottom: "10px",
                }}
              >
                <p>Loading...</p>
              </div>
            )}
            {errorsFetch && <p> {errorsFetch} </p>}
            {isMapsScriptLoaded && showMap && !isMapsLoadingData && (
              <div className={styles.map}>
                <GoogleMap
                  mapContainerStyle={{
                    width: "70%",
                    height: "400px",
                    top: "20px", // Ajustez la hauteur en fonction de vos besoins
                    margin: "auto", // Center the map horizontally
                    bottom: "10px",
                  }}
                  center={position} // Centrez la carte aux coordonnées désirées
                  zoom={1}
                  onLoad={(map) => handleMapLoad(map)}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    scrollwheel: true, // Active la roulette de la souris pour le zoom
                  }}
                >
                  {markers.map((marker) => (
                    <Marker
                      key={marker.id}
                      position={marker.position}
                      title={marker.title}
                      icon={getOpt()}
                    />
                  ))}
                </GoogleMap>
              </div>
            )}
            <div className={styles.access}>
              {stakedNFTs.length >= 3 && (
                <a href="#" onClick={scrollToCreateGeoSpace}>
                  You have access to create GeoSpace
                </a>
              )}
            </div>
            <div className={styles.containerInfos}>
              <div className={`${styles.displayContainer}`}>
                {/* <div style={{ display: "flex", flexDirection: "column" }}> */}

                <div style={{ flex: 1 }}>
                  <div className={`${styles.yourNFTs}`}>
                    <h2>Your available GeoSpace</h2>
                    <p>
                      Just select nft to stake or to put your NFT back into play
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
                                      ? prevSelected.filter(
                                          (id) => id !== value
                                        )
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
                              placeholder="Enter a fees"
                              min="0"
                              // Add any additional attributes or event handlers as needed
                            />
                          </li>
                        ))}
                      </ul>
                      {isTransactionStakePending ? (
                        <CircleLoader
                          css={overrideCircle}
                          size={30}
                          color={"#107a20"}
                          loading={true}
                        />
                      ) : (
                        <a
                          className={styles.red2Button}
                          onClick={stakeSelectedNFTs}
                        >
                          Stake
                        </a>
                      )}

                      {isTransactionResetPending ? (
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
                        <a
                          className={`${styles.red2Button} ${styles.buttonSpacing}`}
                          onClick={resetNFTs}
                        >
                          Back in Game
                        </a>
                      )}
                    </React.Fragment>
                  </div>
                </div>
                {stakedNFTs.length > 0 ? (
                  <div style={{ flex: 1 }}>
                    <div className={`${styles.yourStakedNft}`}>
                      <h2>Staked GeoSpaces</h2>
                      <p>
                        Just stake 3 GeoSpaces to have the right to unlock the
                        creation of NFTs.
                      </p>
                      <p>
                        If you have at least 1 GeoSpace staked, then you receive
                        1 SpaceCoin daily.
                      </p>

                      {stakedNFTs.length > 0 ? (
                        <p>just select GeoSpaces to unstake</p>
                      ) : (
                        ""
                      )}

                      {stakedNFTs.length === 0 ? (
                        ""
                      ) : (
                        <React.Fragment>
                          <ul>
                            {stakedNFTs.map((tokenId) => (
                              <li key={tokenId}>
                                <label>
                                  <input
                                    type="checkbox"
                                    value={tokenId}
                                    checked={selectedStakedNFTs.includes(
                                      tokenId
                                    )}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      setSelectedStakedNFTs((prevSelected) =>
                                        prevSelected.includes(value)
                                          ? prevSelected.filter(
                                              (id) => id !== value
                                            )
                                          : [...prevSelected, value]
                                      );
                                    }}
                                  />
                                  GeoSpace {tokenId}
                                </label>
                              </li>
                            ))}
                          </ul>

                          {isTransactionUnstakePending ? (
                            <CircleLoader
                              css={overrideCircle}
                              size={30}
                              color={"#a81419"}
                              loading={true}
                            />
                          ) : (
                            <a
                              className={styles.redButton}
                              onClick={unstakeNFTs}
                            >
                              Unstake
                            </a>
                          )}
                        </React.Fragment>
                      )}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                {resetNFT.length > 0 ? (
                  <div style={{ flex: 1 }}>
                    <div className={`${styles.yourResetNft}`}>
                      <h2>GeoSpaces Back in game </h2>
                      {/* <p>just select nft to clean reset</p> */}
                      {resetNFT.length === 0 ? (
                        <p>
                          Please select GeoSpace on your collection to put back
                          in games
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
                                    checked={selectedResetNFTs.includes(
                                      tokenId
                                    )}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      setSelectedResetNFTs((prevSelected) =>
                                        prevSelected.includes(value)
                                          ? prevSelected.filter(
                                              (id) => id !== value
                                            )
                                          : [...prevSelected, value]
                                      );
                                    }}
                                  />
                                  GeoSpace: {tokenId} (Fee:{" "}
                                  {feesNftMap[tokenId]} ZAMA)
                                </label>
                              </li>
                            ))}
                          </ul>
                          {isTransactionClaimPending ? (
                            <CircleLoader
                              css={overrideCircle}
                              size={30}
                              color={"#a81419"}
                              loading={true}
                            />
                          ) : (
                            <a className={styles.redButton} onClick={claimNft}>
                              Cancel
                            </a>
                          )}
                        </React.Fragment>
                      )}
                    </div>
                  </div>
                ) : (
                  ""
                )}

                {creationNFT.length === 0 ? (
                  ""
                ) : (
                  <div style={{ flex: 1 }}>
                    <div className={`${styles.yourCreationNft}`}>
                      <h2>NFTs Creation</h2>
                      <p>Just see nft your nft creation</p>
                      <p>
                        You receive the creation fees (SpaceCoin) of GeoSpace
                        shared with other creators.{" "}
                      </p>

                      <React.Fragment>
                        <ul>
                          {creationNFT.map((tokenId) => (
                            <li key={tokenId.id}>
                              <label>
                                GeoSpace: {tokenId.id} (Fee: {tokenId.fee} ZAMA)
                              </label>
                            </li>
                          ))}
                        </ul>
                      </React.Fragment>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {stakedNFTs.length >= 3 && (
          <div className={styles.secondContainer} ref={createGeoSpaceRef}>
            <h1>Create GeoSpace</h1>

            <h2>
              Include your tax in ZAMA for one round and receives a portion of
              the creation fees in SpaceCoin along with all other creators.
            </h2>
            <p>
              ⚠️ Be careful ⚠️ <br />
              For now, Zama does not handle negative integers. So you need to
              use positive latitude and longitude values. <br /> <br />
              You must have a valid GPS coordinate, meaning it should have an
              available Google Street View. <br /> <br />
              Go to Google Maps, enter Street View mode, navigate to the desired
              location. <br /> <br />
              Go to the search bar, and find the two values after the @ symbol.
              The first value is the latitude, and the second is the longitude.{" "}
              <br /> <br />
              Copy and paste these values into the form here. <br /> <br /> It
              will cost you 1 SpaceCoin. <br /> <br />
              ⚠️ Be careful ⚠️ <br />
              Your transaction will occur in two steps: <br /> <br />
              1) Approve the use of 1 token from your wallet to the NftGuessr
              contract.
              <br /> <br /> 2) Minting transaction for NFT GeoSpace. <br />
              Please be patient during the creation time, thank you.
            </p>
            <form>
              <label>
                Fees:
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
            {isTransactionCreatePending ? (
              <CircleLoader
                css={overrideCircle}
                size={30}
                color={"#a88314"}
                loading={true}
              />
            ) : (
              <a className={styles.accessButton} onClick={createGps}>
                Create Gps
              </a>
            )}
          </div>
        )}
        {ownedNFTs.length === 0 &&
          stakedNFTs.length === 0 &&
          resetNFT.length === 0 && (
            <>
              <div className={styles.containerAccess}>
                <Link href="/game/game">
                  <button className={`${styles.backHome} center-left-button`}>
                    PLAY
                  </button>
                </Link>
              </div>
            </>
          )}
      </div>
    </LoadScript>
  );
};

export default Profil;
