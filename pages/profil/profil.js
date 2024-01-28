import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import initMetaMask from "../../utils/metamask";
import abi from "../../utils/abi/abi";
import abiGame from "../../utils/abi/game";
import abiCoin from "../../utils/abi/coin";

import styles from "./profil.module.css";
import ErrorMetamask from "../errorPage/metamask";
import Link from "next/link";
import axios from "axios";
import { getFhevmInstance } from "../../utils/fhevmInstance";
import Loading from "../loading/loading";
import { parseUnits } from "ethers/lib/utils";
import { css } from "@emotion/react";
import { PropagateLoader, CircleLoader } from "react-spinners";
import { useRef } from "react";
// import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";

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
const OpenStreetMap = dynamic(() => import("./NftMaps"), {
  ssr: false,
});

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
  const [balanceNftGsr, setBalanceNftGsr] = useState(0);
  const [balanceNftGsrSpc, setBalanceNftGsrSpc] = useState(0);

  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [createdNFTs, setCreatedNFTs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [selectedResetNFTs, setSelectedResetNFTs] = useState([]);

  const [fhevm, setFhevm] = useState(null);
  const [numberInput, setNumberInput] = useState(0);
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [qtyWithdraw, setQtyWithdraw] = useState("");
  const [center, setCenter] = useState({ lat: -4.043477, lng: 39.668205 });
  const ZOOM_LEVEL = 3;
  const mapRef = useRef();
  const [resetNFT, setResetNFT] = useState([]);
  const [creationNFT, setCreationNFT] = useState([]);
  const [feesNftMap, setFeesNftMap] = useState({});
  const [decryptedNFTS, setDecrypted] = useState([]);
  const [errorsFetch, setErrorFetch] = useState("");
  const [pubKey, setPublicKey] = useState(null);
  const [lifeMint, setLifeMint] = useState(null);

  // const [isAccessGovernance, setAccessGovernance] = useState(false);
  // const [isAccessCreate, setAccessCreate] = useState(false);

  const [isTransactionStakePending, setIsTransactionStakePending] =
    useState(false);
  const [isTransactionUnstakePending, setIsTransactionUnstakePending] =
    useState(false);
  const [isLoadingClaimOwner, setLoadingClaimOwner] = useState(false);
  const [isLoadingClaimCreator, setLoadingClaimCreator] = useState(false);
  const [isLoadingClaimStaker, setLoadingClaimStaker] = useState(false);

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
  const [isGood, setIsGood] = useState(false);

  const [showMap, setShowMap] = useState(false);
  const [balanceSPC, setBalanceSPC] = useState(0);
  const [contractCoin, setContractCoin] = useState(null);
  const [contractGame, setContractGame] = useState(null);

  const createGeoSpaceRef = useRef(null);
  const [balanceStake, setBalanceStake] = useState(null);
  const [balanceRewardCreator, setBalanceRewardCreator] = useState(null);
  const [balanceRewardStake, setBalanceRewardStake] = useState(null);
  const [balanceRewardOwner, setBalanceRewardOwner] = useState(null);

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
      const contractGame = new ethers.Contract(
        process.env.GAME,
        abiGame,
        signer
      );

      const fhevmInstance = await getFhevmInstance();

      setFhevm(fhevmInstance);
      setSigner(signer);
      setContract(contract);
      setContractCoin(contractCoin);
      setContractGame(contractGame);
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

  // const callDecrypt = async (ownedNfts, userAddress, gasFees) => {
  //   const promises = ownedNfts.map((tokenId, index) =>
  //     contract.getNFTLocationForOwner(tokenId, {
  //       from: userAddress,
  //       gasLimit: gasFees[index],
  //     })
  //   );

  //   return Promise.all(promises);
  // };
  // const callDecryptGas = async (ownedNfts, userAddress) => {
  //   const promises = [];
  //   for (const tokenId of ownedNfts) {
  //     promises.push(
  //       contract.estimateGas.getNFTLocationForOwner(tokenId, {
  //         from: userAddress,
  //       })
  //     );
  //   }
  //   return Promise.all(promises);
  // };
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
        const lat = Number(marker[0]);
        const lng = Number(marker[1]);

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
    if (resetNFT.length > 0) {
      assambly.push(resetNFT);
    }
    if (createdNFTs.length > 0) {
      assambly.push(createdNFTs);
    }
    return assambly.reduce((acc, currentArray) => acc.concat(currentArray), []);
  };
  // const fetchDecrypt = async () => {
  //   if (signer) {
  //     try {
  //       setLoadingDataMap(true);
  //       const assamblage = getAllOwnedNfts();
  //       const decryptedLocations = await callDecryptGas(assamblage, account);
  //       console.log(decryptedLocations);
  //       const gasFees = [];
  //       decryptedLocations.forEach((value, index) => {
  //         const gasLimit = getMargeErrorTx(value);
  //         gasFees.push(gasLimit);
  //       });
  //       const decryptedGps = await callDecrypt(assamblage, account, gasFees);
  //       setDecrypted(decryptedGps);
  //       setMarkerArray(decryptedGps);
  //       setLoadingDataMap(false);
  //     } catch (error) {
  //       console.error("error get decrypt", error);
  //       setLoadingDataMap(false);
  //       return error;
  //     }
  //   }
  // };
  const callDecryptGas = async (
    ownedNfts,
    userAddress,
    publicKey,
    signature
  ) => {
    const promises = [];
    console.log(pubKey);
    for (const tokenId of ownedNfts) {
      promises.push(
        contractGame.getNFTLocationForOwner(tokenId, publicKey, signature, {
          from: userAddress,
        })
      );
    }
    return Promise.all(promises);
  };

  // const callDecrypt = async (ownedNfts, userAddress, gasFees) => {
  //   const promises = ownedNfts.map((tokenId, index) =>
  //     contract.getNFTLocation(tokenId, pubKey, {
  //       from: userAddress,
  //       gasLimit: 10000000, //gasFees[index],
  //     })
  //   );

  //   return Promise.all(promises);
  // };

  const allDecrypt = (tableau, contract) => {
    // Vous pouvez remplacer cette fonction par votre propre logique de calcul
    return tableau.map((valeur) => fhevm.decrypt(contract, valeur)); // Exemple : multiplier chaque valeur par 2
  };

  const fetchDecrypt = async () => {
    if (signer) {
      try {
        setLoadingDataMap(true);
        const assamblage = getAllOwnedNfts();
        //const addrContract = process.env.CONTRACT;
        const { publicKey, signature } = await getTokenSignature(
          process.env.GAME,
          account
        );
        // setPublicKey(publicKey);
        // setSignature(signature);
        const decryptedLocations = await callDecryptGas(
          assamblage,
          account,
          publicKey,
          signature
        );
        for (let i = 0; i < decryptedLocations.length; i++) {
          decryptedLocations[i] = allDecrypt(
            decryptedLocations[i],
            process.env.GAME
          );
        }
        console.log(decryptedLocations);

        // console.log(r);
        //console.log(decryptedLocations);
        // const gasFees = [];
        // decryptedLocations.forEach((value, index) => {
        //   const gasLimit = getMargeErrorTx(value);
        //   gasFees.push(gasLimit);
        // });

        // const decryptedGps = await callDecrypt(assamblage, account, gasFees);
        // console.log(
        //   "?????????????????????????????????????????????????????????????3",
        //   decryptedGps
        // );
        setDecrypted(decryptedLocations);
        setMarkerArray(decryptedLocations);
        console.log(markers);
        setLoadingDataMap(false);
        setIsGood(true);
      } catch (error) {
        console.error("error get decrypt", error);
        setLoadingDataMap(false);
        setIsGood(false);

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

  const getBalances = async () => {
    try {
      const userAddress = await signer.getAddress();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balanceWei = await provider.getBalance(userAddress);
      const balanceWeiCoinSpace = await contract.getBalanceCoinSpace(
        userAddress
      );

      const balanceStake = await contract.stakedBalance(userAddress);

      const balanceEther = ethers.utils.formatUnits(balanceWei, "ether");
      const balanceStakeEth = ethers.utils.formatUnits(balanceStake, "ether");
      const balanceCoinSpace = ethers.utils.formatUnits(
        balanceWeiCoinSpace,
        "ether"
      );
      setBalance(balanceEther);
      setBalanceSPC(balanceCoinSpace);
      setBalanceStake(balanceStakeEth);
    } catch (error) {
      return error;
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
          contractGame.getOwnedNFTs(userAddress),
          contractGame.getResetNFTsAndFeesByOwner(userAddress),
          contractGame.getNftCreationAndFeesByUser(userAddress),
          provider.getBalance(userAddress),
          contract.getBalanceCoinSpace(userAddress),
          contract.balanceRewardStaker(userAddress),
          contract.balanceRewardCreator(userAddress),
          contract.balanceRewardOwner(userAddress),
          contract.stakedBalance(userAddress),
          contractGame.lifePointTotal(userAddress),
          //   contractGame.creatorNft(userAddress),
          // contractGame.userFees(
          //   "0x95977386303e586B3C9765B51c8A77b7A18efb84",
          //   3
          // ),
          //contractGame.ownerNft(3),

          //contractGame.get
        ];

        const [
          nftsOwned,
          nftsRAndFees,
          nftsCreationFees,
          balanceWei,
          balanceWeiCoinSpace,
          balanceRewardStake,
          balanceRewardCreator,
          balanceRewardCreatorOwner,
          balanceStake,
          lifeMint,
          // userFees,
          // ownerNft,
        ] = await Promise.all(promises);
        const rewardStake = ethers.utils.formatUnits(
          balanceRewardStake,
          "ether"
        );
        // const usrFees = ethers.utils.formatUnits(userFees, "ether");
        // console.log(usrFees, ownerNft);
        const rewardOwner = ethers.utils.formatUnits(
          balanceRewardCreatorOwner,
          "ether"
        );
        const balanceEther = ethers.utils.formatUnits(balanceWei, "ether");
        const balanceStakeEth = ethers.utils.formatUnits(balanceStake, "ether");
        const balanceCoinSpace = ethers.utils.formatUnits(
          balanceWeiCoinSpace,
          "ether"
        );

        const ownedNFTs = nftsOwned.map((tokenId) => tokenId.toNumber());
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

        const feesNftMap = {};
        feesNft.forEach((fee, index) => {
          const valueEth = Math.round(ethers.utils.formatUnits(fee, "ether"));

          feesNftMap[resetNFTs[index]] = valueEth;
        });

        const filteredOwnedNFTs = ownedNFTs.filter(
          (tokenId) => !resetNFTs.includes(tokenId)
        );
        if (userAddress === process.env.OWNER) {
          const balanceEth = await provider.getBalance(process.env.CONTRACT);

          const balanceSpc = await contract.getBalanceCoinSpace(
            process.env.CONTRACT
          );

          const valueREth = ethers.utils.formatUnits(balanceEth, "ether");
          const valueSpc = Number(
            ethers.utils.formatUnits(balanceSpc, "ether")
          );
          setBalanceNftGsr(valueREth);
          setBalanceNftGsrSpc(valueSpc);
        }
        setCreatedNFTs(creationNFTs);
        setLifeMint(lifeMint.toString());
        setFeesNftMap(feesNftMap);
        setBalanceStake(balanceStakeEth);
        setBalanceRewardStake(rewardStake);
        setBalanceRewardCreator(balanceRewardCreator.toString());
        setBalanceRewardOwner(rewardOwner);
        setOwnedNFTs(filteredOwnedNFTs);
        setAccount(userAddress);
        setBalance(balanceEther);
        setBalanceSPC(balanceCoinSpace);
        setResetNFT(resetNFTs);
        setCreationNFT(nftsCreaFee);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorFetch("Error fetching data");
      return error;
    }
  };

  const handleAccountsChanged = async (accounts) => {
    const newAccount = accounts[0];

    setAccount(newAccount);
    await initializeMetaMask();
    await fetchData();
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

  const unStakeSpc = async () => {
    const number = qtyWithdraw;
    setIsTransactionStakePending(true);

    if (isNaN(number)) {
      alert("Invalid input");
      setIsTransactionStakePending(false);

      return;
    }
    const erc20Contract = new ethers.Contract(process.env.TOKEN, abi, signer);
    // const amountInWei = ethers.utils.parseUnits(number.toString(), "ether");

    // const gasEstimation = await contract.estimateGas.withdrawToken(amountInWei);
    // const gasLimit = getMargeErrorTx(gasEstimation);
    // const rep = await contract.withdrawToken(amountInWei, {
    //   gasLimit,
    // });
    // await rep.wait();
    try {
      const approvalAmount = parseUnits(number, 18);
      console.log(approvalAmount);

      const gasEstimationStake = await contract.estimateGas.unstakeSPC(
        approvalAmount
      );
      const gasLimitStake = getMargeErrorTx(gasEstimationStake);
      const rep = await contract.unstakeSPC(approvalAmount, {
        gasLimit: gasLimitStake,
      });
      await rep.wait();
      await getBalances();
      setIsTransactionStakePending(false);
    } catch (error) {
      console.error(error);
      setIsTransactionStakePending(false);
    }
  };

  const stakeSpc = async () => {
    const number = qtyWithdraw;
    setIsTransactionStakePending(true);

    if (isNaN(number)) {
      alert("Invalid input");
      setIsTransactionStakePending(false);

      return;
    }
    const erc20Contract = new ethers.Contract(
      process.env.TOKEN,
      abiCoin,
      signer
    );
    // const amountInWei = ethers.utils.parseUnits(number.toString(), "ether");

    // const gasEstimation = await contract.estimateGas.withdrawToken(amountInWei);
    // const gasLimit = getMargeErrorTx(gasEstimation);
    // const rep = await contract.withdrawToken(amountInWei, {
    //   gasLimit,
    // });
    // await rep.wait();
    try {
      const approvalAmount = parseUnits(number, 18);
      console.log(approvalAmount);
      const gasEstimation = await erc20Contract.estimateGas.approve(
        process.env.CONTRACT,
        approvalAmount
      );
      const gasLimit = getMargeErrorTx(gasEstimation);
      console.log(gasLimit);

      const approvalTx = await erc20Contract.approve(
        process.env.CONTRACT,
        approvalAmount,
        { gasLimit }
      );

      await approvalTx.wait();

      const gasEstimationStake = await contract.estimateGas.stakeSPC(
        approvalAmount
      );
      const gasLimitStake = getMargeErrorTx(gasEstimationStake);
      const rep = await contract.stakeSPC(approvalAmount, {
        gasLimit: gasLimitStake,
      });
      await rep.wait();
      await getBalances();
      setIsTransactionStakePending(false);
    } catch (error) {
      console.error(error);
      setIsTransactionStakePending(false);
    }
  };

  const claim = async () => {
    const number = qtyWithdraw;
    setIsTransactionStakePending(true);

    if (isNaN(number)) {
      alert("Invalid input");
      setIsTransactionStakePending(false);

      return;
    }
    const erc20Contract = new ethers.Contract(process.env.TOKEN, abi, signer);
    // const amountInWei = ethers.utils.parseUnits(number.toString(), "ether");

    // const gasEstimation = await contract.estimateGas.withdrawToken(amountInWei);
    // const gasLimit = getMargeErrorTx(gasEstimation);
    // const rep = await contract.withdrawToken(amountInWei, {
    //   gasLimit,
    // });
    // await rep.wait();
    try {
      const gasEstimationClaim = await contract.estimateGas.claimRewardStaker();
      const gasLimit = getMargeErrorTx(gasEstimationClaim);
      const rep = await contract.claimRewardStaker({
        gasLimit,
      });
      await rep.wait();
      setIsTransactionStakePending(false);
    } catch (error) {
      console.error(error);
      setIsTransactionStakePending(false);
    }
  };

  const claimStaker = async () => {
    const number = qtyWithdraw;
    setLoadingClaimStaker(true);

    if (isNaN(number)) {
      alert("Invalid input");
      setLoadingClaimStaker(false);

      return;
    }
    const erc20Contract = new ethers.Contract(process.env.TOKEN, abi, signer);
    // const amountInWei = ethers.utils.parseUnits(number.toString(), "ether");

    // const gasEstimation = await contract.estimateGas.withdrawToken(amountInWei);
    // const gasLimit = getMargeErrorTx(gasEstimation);
    // const rep = await contract.withdrawToken(amountInWei, {
    //   gasLimit,
    // });
    // await rep.wait();
    try {
      const gasEstimationClaim = await contract.estimateGas.claimRewardStaker();
      const gasLimit = getMargeErrorTx(gasEstimationClaim);
      const rep = await contract.claimRewardStaker({
        gasLimit,
      });
      await rep.wait();
      setLoadingClaimStaker(false);
    } catch (error) {
      console.error(error);
      setLoadingClaimStaker(false);
    }
  };

  const claimOwner = async () => {
    const number = qtyWithdraw;
    setLoadingClaimOwner(true);

    if (isNaN(number)) {
      alert("Invalid input");
      setLoadingClaimOwner(false);

      return;
    }
    const erc20Contract = new ethers.Contract(process.env.TOKEN, abi, signer);
    // const amountInWei = ethers.utils.parseUnits(number.toString(), "ether");

    // const gasEstimation = await contract.estimateGas.withdrawToken(amountInWei);
    // const gasLimit = getMargeErrorTx(gasEstimation);
    // const rep = await contract.withdrawToken(amountInWei, {
    //   gasLimit,
    // });
    // await rep.wait();
    try {
      const gasEstimationClaim =
        await contract.estimateGas.claimRewardCreatorOwnerFees();
      const gasLimit = getMargeErrorTx(gasEstimationClaim);
      const rep = await contract.claimRewardCreatorOwnerFees({
        gasLimit,
      });
      await rep.wait();
      setLoadingClaimOwner(false);
    } catch (error) {
      console.error(error);
      setLoadingClaimOwner(false);
    }
  };

  const claimCreator = async () => {
    const number = qtyWithdraw;
    setLoadingClaimCreator(true);

    if (isNaN(number)) {
      alert("Invalid input");
      setLoadingClaimCreator(false);

      return;
    }
    const erc20Contract = new ethers.Contract(process.env.TOKEN, abi, signer);
    // const amountInWei = ethers.utils.parseUnits(number.toString(), "ether");

    // const gasEstimation = await contract.estimateGas.withdrawToken(amountInWei);
    // const gasLimit = getMargeErrorTx(gasEstimation);
    // const rep = await contract.withdrawToken(amountInWei, {
    //   gasLimit,
    // });
    // await rep.wait();
    try {
      const gasEstimationClaim =
        await contract.estimateGas.claimRewardCreator();
      const gasLimit = getMargeErrorTx(gasEstimationClaim);
      const rep = await contract.claimRewardCreator({
        gasLimit,
      });
      await rep.wait();
      setLoadingClaimCreator(false);
    } catch (error) {
      console.error(error);
      setLoadingClaimCreator(false);
    }
  };

  const createGpsOwner = async () => {
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
        const gasEstimationCreate = await contract.estimateGas.createGpsOwner(
          obj,
          objFees
        );
        const gasLimitCreate = getMargeErrorTx(gasEstimationCreate);

        const rep = await contract.createGpsOwner(obj, objFees, {
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
          abiCoin,
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
        const id = await contractGame.totalSupply();

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
        // if (networkId !== "0x2382") {
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

  const setWithdrawQty = () => {};

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
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <Link href="/">
          <button className={`${styles.backHome}`}>Back Home</button>
        </Link>

        <Link href="/airdrop/airdrop">
          <button className={`${styles.backHome}`}>AirDrop</button>
        </Link>
      </div>
      <div className={styles.firstContainer}>
        <h1>My Profil</h1>
      </div>
      <div className={styles.balanceAndAddress}>
        <p>{account}</p>
        <p>{balance} ZAMA</p>
      </div>
      <div>
        <div className={styles.firstContainer}>
          <h1>Your Rewards</h1>
          <h3 style={{ color: "#a88314" }}>
            Your reward owner:{" "}
            <p style={{ display: "inline", margin: 0 }}>
              {balanceRewardOwner} ZAMA
            </p>
          </h3>

          {balanceRewardOwner > 0 ? (
            <div>
              <React.Fragment>
                {isLoadingClaimOwner ? (
                  <CircleLoader
                    css={overrideCircle}
                    size={30}
                    color={"#107a20"}
                    loading={true}
                  />
                ) : (
                  <>
                    <a
                      className={`${styles.accessButton} ${styles.buttonSpacing}`}
                      onClick={claimOwner}
                    >
                      Claim
                    </a>
                  </>
                )}
              </React.Fragment>
            </div>
          ) : (
            ""
          )}

          <h3 style={{ color: "#a88314" }}>
            Your reward creator:{" "}
            <p style={{ display: "inline", margin: 0 }}>
              {balanceRewardCreator} SPC
            </p>
          </h3>

          {balanceRewardCreator > 0 ? (
            <div>
              <React.Fragment>
                {isLoadingClaimCreator ? (
                  <CircleLoader
                    css={overrideCircle}
                    size={30}
                    color={"#107a20"}
                    loading={true}
                  />
                ) : (
                  <>
                    <a
                      className={`${styles.accessButton} ${styles.buttonSpacing}`}
                      onClick={claimCreator}
                    >
                      Claim
                    </a>
                  </>
                )}
              </React.Fragment>
            </div>
          ) : (
            ""
          )}

          <h3 style={{ color: "#a88314" }}>
            Your reward staking:{" "}
            <p style={{ display: "inline", margin: 0 }}>
              {balanceRewardStake} ZAMA
            </p>
          </h3>

          {balanceRewardStake > 0 ? (
            <div>
              <React.Fragment>
                {isLoadingClaimStaker ? (
                  <CircleLoader
                    css={overrideCircle}
                    size={30}
                    color={"#107a20"}
                    loading={true}
                  />
                ) : (
                  <>
                    <a
                      className={`${styles.accessButton} ${styles.buttonSpacing}`}
                      onClick={claimStaker}
                    >
                      Claim
                    </a>
                  </>
                )}
              </React.Fragment>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className={styles.firstContainer}>
        <h1>SpaceCoin</h1>
        <h3 style={{ color: "green" }}>
          Your SpaceCoin balance:{" "}
          <p style={{ display: "inline", margin: 0 }}>{balanceSPC} SPC</p>
        </h3>
        <h3 style={{ color: "green" }}>
          Your SpaceCoin stake:{" "}
          <p style={{ display: "inline", margin: 0 }}>{balanceStake} SPC</p>
        </h3>
        <div className={styles.centerExplication}>
          <h2> Stake your SpaceCoin to earn a portion guess fees Zama!</h2>
          <p>
            The more you stake (compared to other stakers), the more shares of
            the guess tax by other players in ZAMA you will receive.
          </p>
        </div>

        <div style={{ flex: 1 }}>
          <div className={`${styles.titleMap}`}>
            <React.Fragment>
              {isTransactionStakePending ? (
                <CircleLoader
                  css={overrideCircle}
                  size={30}
                  color={"#107a20"}
                  loading={true}
                />
              ) : (
                <>
                  <h3>Set quantity to stake or unstake</h3>
                  <form>
                    <input
                      type="number"
                      min="1"
                      value={qtyWithdraw}
                      onChange={(e) => setQtyWithdraw(e.target.value)}
                    />
                  </form>

                  {balanceStake > 0 ? (
                    <a
                      className={`${styles.redButton} ${styles.buttonSpacing}`}
                      onClick={unStakeSpc}
                    >
                      UnStake SPC
                    </a>
                  ) : (
                    <a
                      className={`${styles.red2Button} ${styles.buttonSpacing}`}
                      onClick={stakeSpc}
                    >
                      Stake SPC
                    </a>
                  )}
                </>
              )}
            </React.Fragment>
          </div>
        </div>
      </div>

      <div className={styles.firstContainer}>
        <h1>GeoSpace</h1>
        <h3 style={{ color: "green" }}>
          Your GeoSpace creation:{" "}
          <p style={{ display: "inline", margin: 0 }}>
            {creationNFT.length} GSP
          </p>
        </h3>
        <h3 style={{ color: "green" }}>
          Your mint life:{" "}
          <p style={{ display: "inline", margin: 0 }}>{lifeMint}</p>
        </h3>
        <div className={styles.centerExplication}>
          <h2>Put your GeoSpace with your winning fees and earn SpaceCoin !</h2>
          <p>
            The more GeoSpace you create (compared to the total number of NFTs
            created), the more shares of the minted SpaceCoin you will receive
            when a guess request is made by other players.
          </p>
        </div>
      </div>
      <>
        <div className={styles.titleMap}>
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

        {errorsFetch && <p> {errorsFetch} </p>}
        <div className={styles.map}>
          {/* <h1>MAPS</h1> */}
          <OpenStreetMap />
        </div>
      </>

      <div className={styles.firstContainer}>
        {balanceRewardCreator > 0 ? (
          <div>
            <React.Fragment>
              {isTransactionStakePending ? (
                <CircleLoader
                  css={overrideCircle}
                  size={30}
                  color={"#107a20"}
                  loading={true}
                />
              ) : (
                <>
                  <a
                    className={`${styles.accessButton} ${styles.buttonSpacing}`}
                    onClick={claimCreator}
                  >
                    Claim
                  </a>
                </>
              )}
            </React.Fragment>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className={styles.access}>
        {/* {resetNFT.length >= 1 && (
            <a href="#" onClick={scrollToCreateGeoSpace}>
              You have access to create GeoSpace
            </a>
          )} */}
      </div>
      <div className={styles.containerInfos}>
        <div className={`${styles.displayContainer}`}>
          <div style={{ flex: 1 }}>
            <div className={`${styles.yourNFTs}`}>
              <h2>Your available GeoSpace</h2>
              <p>
                Just select nft to stake or to put your NFT back into play with
                your winning fees. (default is set on 0)
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
                          disabled={resetNFT.includes(tokenId)}
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

          {resetNFT.length > 0 ? (
            <div style={{ flex: 1 }}>
              <div className={`${styles.yourResetNft}`}>
                <h2>GeoSpaces Back in game </h2>
                {/* <p>just select nft to clean reset</p> */}
                {resetNFT.length === 0 ? (
                  <p>
                    Please select GeoSpace on your collection to put back in
                    games
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
                  You receive the creation fees (SpaceCoin) of GeoSpace shared
                  with other creators.{" "}
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
      {resetNFT.length >= 1 && (
        <div className={styles.secondContainer} ref={createGeoSpaceRef}>
          <div>
            <h1>Create GeoSpace</h1>

            <h2>
              Include your winning tax in ZAMA. Receives a portion of the
              creation fees in SpaceCoin along with all other creators.
            </h2>
            <h3>⚠️ Be careful ⚠️</h3>
            <p>
              For now, Zama does not handle negative integers. So you need to
              use positive latitude and longitude values.
            </p>
            <p>
              You must have a valid GPS coordinate, meaning it should have an
              available Google Street View.
            </p>
            <p>
              Go to Google Maps, enter Street View mode, navigate to the desired
              location.
            </p>
            <p>
              Go to the search bar, and find the two values after the @ symbol.
              The first value is the latitude, and the second is the longitude.
              Copy and paste these values into the form here.
            </p>
            <p>It will cost you 1 SpaceCoin.</p>
            <h3>⚠️ Be careful ⚠️ </h3>
            <p>Your transaction will occur in two steps:</p>
            <ul>
              1) Approve the use of 1 token from your wallet to the NftGuessr
              contract.
            </ul>
            <ul>2) Minting transaction for NFT GeoSpace.</ul>
            <p> Please be patient during the creation time, thank you.</p>
          </div>

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

      {ownedNFTs.length === 0 && resetNFT.length === 0 && (
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

      {ownedNFTs.length === 0 &&
      createdNFTs.length === 0 &&
      resetNFT.length === 0 ? (
        <div className={styles.needToPlay}>
          <h1>You don&#39;t have any nft</h1>
          <p>you need to play to win nft</p>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Profil;
