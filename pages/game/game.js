import { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { getFhevmInstance } from "../../utils/fhevmInstance";
import abi from "../../utils/abi/abi";

import Link from "next/link";
import {
  GoogleMap,
  LoadScript,
  Marker,
  StreetViewPanorama,
} from "@react-google-maps/api";
import style from "./map.module.css";
import { PropagateLoader } from "react-spinners";
import CryptoJS from "crypto-js";

import { css } from "@emotion/react";
import Loading from "../loading/loading";

const init = { lat: 0, lng: 0 };
const lib = ["places"];

const ConnectButton = () => {
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red; // Adjust the color as needed
  `;

  const containerStyle = {
    width: "100%",
    height: "90vh",
  };

  const [position, setPosition] = useState(init);
  const [showWinMessage, setShowWinMessage] = useState(false);

  const [chain, setChain] = useState("");
  const [accountBalance, setAccountBalance] = useState(null);
  const [accountAddress, setAccountAddress] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [balanceSpc, setBalanceSPC] = useState(0);
  const [failureMessage, setFailureMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [nft, setNft] = useState({});
  const [assamblage, setAssamblage] = useState([]);
  const [positionMiniMap, setPositionMiniMap] = useState(init);
  const [isTransactionSuccessful, setIsTransactionSuccessful] = useState(false);
  const [isTransactionFailed, setIsTransactionFailed] = useState(false);
  //const [signer, setSigner] = useState(null);
  const [fhevm, setFhevm] = useState(null);
  const [contract, setContract] = useState(null);

  async function initializeContract(signer, contract) {
    try {
      const addrSigner = await signer.getAddress();
      console.log("INIT CONTRACT", addrSigner, contract);
      contract.on("GpsCheckResult", async (userAddress, result, tokenId) => {
        if (userAddress === addrSigner) {
          if (result) {
            const readable = Number(tokenId.toString());
            console.log("YOU WIN NFT", readable);
            setShowWinMessage(true);
            setIsTransactionSuccessful(true);
            setSuccessMessage(`You Win NFT ${readable}`);
            setIsTransactionFailed(false);
            setIsLoading(false);

            setTimeout(async () => {
              setShowWinMessage(false);
              setIsTransactionSuccessful(false);
              setIsTransactionFailed(false);
              // await fetchData();
              await fetchGpsData();
            }, 5000);
          } else {
            setIsTransactionFailed(true);
            setFailureMessage("Sorry, you lost.");
            setIsTransactionSuccessful(false);
            setIsLoading(false);
            setMarkers([]);

            setTimeout(() => {
              setIsTransactionSuccessful(false);
              setIsTransactionFailed(false);
              setMarkers([]);
            }, 5000);
          }
        }
      });
    } catch (error) {
      console.error("Error initializing contract:", error);
      console.error("Error initializing contract:", error);
      setIsLoading(false);
      setMarkers([]);
      setIsTransactionSuccessful(false);
      setIsTransactionFailed(false);
      return error;
      return error;
    }
  }
  const gestOption = () => {
    return {
      addressControl: false,
      linksControl: false,
      panControl: true,
      zoomControl: false,
      showRoadLabels: false,
      enableCloseButton: false,
      panControlOptions: {
        position:
          typeof window !== "undefined" && window.google && window.google.maps
            ? window.google.maps.ControlPosition.LEFT_TOP
            : undefined,
      },
    };
  };

  const streetViewPanoramaOptions = useMemo(() => {
    return {
      id: "street-view",
      containerStyle,
      options: gestOption(),
      position,
      visible: true,
    };
  }, [position]);

  const opt = () => {
    return {
      disableDefaultUI: true,
      zoomControl: true,
      scrollwheel: true, // Active la roulette de la souris pour le zoom
    };
  };
  async function fetchGpsData(chainI) {
    try {
      setMarkers([]);
      let chainId;
      if (!chain) chainId = chainI;
      else chainId = chain;
      console.log("============>", chain);
      const response = await fetch(
        `${process.env.SERVER}${process.env.ROUTE}?chain=${chainId}`
      );
      const data = await response.json();
      console.log(data);

      var bytes = CryptoJS.AES.decrypt(data, process.env.KEY);
      var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      console.log(decryptedData);
      setPosition({
        lat: decryptedData.latitude,
        lng: decryptedData.longitude,
      });
      setNft({
        tokenId: decryptedData.id,
        tax: decryptedData.tax,
      });
    } catch (error) {
      setPosition({
        lat: 0,
        lng: 0,
      });
      setNft({
        tokenId: 0,
        tax: 0,
      });
      alert(
        "Either no NFT is found, or an error occurs ! Contact support discord / telegram"
      );
      throw `fetchGps ${error}`;
    }
  }

  const getAllOwnedNfts = (ownedNFTsU, stakedNFTsU, resetNFTU, createdNFTs) => {
    const assambly = [];
    if (ownedNFTsU.length > 0) {
      assambly.push(ownedNFTsU);
    }
    if (stakedNFTsU.length > 0) {
      assambly.push(stakedNFTsU);
    }
    if (resetNFTU.length > 0) {
      assambly.push(resetNFTU);
    }
    if (createdNFTs.length > 0) {
      assambly.push(createdNFTs);
    }
    return assambly.reduce((acc, currentArray) => acc.concat(currentArray), []);
  };

  const getContract = (chain) => {
    if (chain === "zama") {
      return process.env.CONTRACT;
    } else if (chain === "inco") {
      return process.env.CONTRACT_INCO;
    } else if (chain === "fhenix") {
      return process.env.CONTRACT_FHENIX;
    }
  };

  const connectToDevnet = async (selectedChain) => {
    setIsLoadingData(true);
    try {
      let chainParams;

      if (selectedChain === "zama") {
        chainParams = {
          chainId: "0x1f49",
          chainName: "Zama Network",
          nativeCurrency: {
            name: "ZAMA",
            symbol: "ZAMA",
            decimals: 18,
          },
          rpcUrls: ["https://devnet.zama.ai"],
          blockExplorerUrls: ["https://main.explorer.zama.ai"],
        };
      }
      if (selectedChain === "inco") {
        console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOK");

        chainParams = {
          chainId: "0x2382",
          chainName: "Inco Network",
          nativeCurrency: {
            name: "INCO",
            symbol: "INCO",
            decimals: 18,
          },
          rpcUrls: ["https://evm-rpc.inco.network/"],
          blockExplorerUrls: ["https://explorer.inco.network/"],
        };
      }

      if (selectedChain === "fhenix") {
        chainParams = {
          chainId: "0x1538",
          chainName: "Fhenix DevNet",
          nativeCurrency: {
            name: "FHE",
            symbol: "tFHE",
            decimals: 18,
          },
          rpcUrls: ["https://fhenode.fhenix.io/new/evm"],
          blockExplorerUrls: ["https://demoexplorer.fhenix.io/"],
        };
      }

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [chainParams],
      });
      setChain(selectedChain);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const fhevmInstance = await getFhevmInstance();

      const contractAddr = getContract(selectedChain);

      const signer = provider.getSigner();
      console.log(signer);

      // setSigner(signer);
      const contractGame = new ethers.Contract(contractAddr, abi, signer);
      setContract(contractGame);
      setFhevm(fhevmInstance);
      console.log(contractGame, provider);
      const userAddress = await signer.getAddress();
      console.log("?????????????????????????????????????", userAddress);
      // Créez un tableau de promesses
      const promises = [
        contractGame.getNFTsStakedByOwner(userAddress),
        contractGame.getOwnedNFTs(userAddress),
        contractGame.getResetNFTsAndFeesByOwner(userAddress),
        contractGame.getNftCreationAndFeesByUser(userAddress),
        provider.getBalance(userAddress),
        contractGame.getBalanceCoinSpace(userAddress),
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
      // console.log(balanceCoinSpace);
      const ownedNFTs = nftsOwned.map((tokenId) => tokenId.toNumber());

      const stakedNFTs = nftsStake.map((tokenId) => tokenId.toNumber());
      const resetNFTs = nftsRAndFees[0].map((tokenId) => tokenId.toNumber());
      // const feesNft = nftsRAndFees[1].map((tokenId) => tokenId.toString());
      const creationNFTs = nftsCreationFees[0].map((tokenId) =>
        tokenId.toNumber()
      );
      const filteredOwnedNFTs = ownedNFTs.filter(
        (tokenId) =>
          !resetNFTs.includes(tokenId) && !stakedNFTs.includes(tokenId)
      );
      const assamblage = getAllOwnedNfts(
        filteredOwnedNFTs,
        stakedNFTs,
        resetNFTs,
        creationNFTs
      );
      setAssamblage(assamblage);
      setAccountBalance(balanceEther);
      setAccountAddress(userAddress);

      initializeContract(signer, contractGame);
      fetchGpsData(selectedChain);
      setBalanceSPC(balanceCoinSpace);
      setIsLoadingData(false);
    } catch (error) {
      console.error(`Error connecting to ${selectedChain} Devnet:`, error);
      setIsLoadingData(false);
    }
  };

  const handleSelectChange = (event) => {
    connectToDevnet(event);
  };

  const handleAccountsChanged = async (newAccounts) => {
    console.log("Accounts changed:", newAccounts);

    // Mettez à jour les données ici si nécessaire
    if (newAccounts.length > 0) {
      await connectToDevnet(chain);
    }
  };
  const handleMiniMapClick = async (e) => {
    const newMarker = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMarkers((prevMarkers) => [newMarker]);
    setPositionMiniMap(newMarker);
  };
  const handleConfirmGps = async () => {
    if (!positionMiniMap.lat || !positionMiniMap.lng) {
      alert("You need to place a pin");
      return;
    }
    setIsLoading(true);
    try {
      const attConvert = Math.trunc(positionMiniMap.lat * 1e5);
      const lngConvert = Math.trunc(positionMiniMap.lng * 1e5);
      console.log(attConvert, lngConvert, nft.tokenId);
      const lat = fhevm.encrypt32(attConvert);
      const lng = fhevm.encrypt32(lngConvert);
      const value = 1 + nft.tax;
      const gasEstimation = await contract.estimateGas.checkGps(
        lat,
        lng,
        nft.tokenId,
        {
          value: ethers.utils.parseEther(`${value}`),
        }
      );
      const gasLimit = gasEstimation.mul(120).div(100);
      console.log(
        `Gas estimation estimation ${gasEstimation} Gwei\nGas estimation with error marge: ${gasLimit}`
      );

      const transaction = await contract["checkGps(bytes,bytes,uint256)"](
        lat,
        lng,
        nft.tokenId,
        {
          value: ethers.utils.parseEther(`${value}`),
          gasLimit,
        }
      );
      const rep = await transaction.wait();
      console.log(rep);
    } catch (error) {
      console.error("handleConfirmGps", error);
      setIsLoading(false);
      return error;
    }
  };

  useEffect(() => {
    // Ajouter un gestionnaire d'événements pour les changements de compte
    const handleAccountsChangedEvent = (newAccounts) =>
      handleAccountsChanged(newAccounts);
    window.ethereum.on("accountsChanged", handleAccountsChangedEvent);

    // Nettoyer l'écouteur d'événements lorsque le composant est démonté
    return () => {
      window.ethereum.off("accountsChanged", handleAccountsChangedEvent);
    };
  }, [chain]); // Assurez-vous de ne pas ajouter l'écouteur à chaque re-render
  if (isLoadingData) return <Loading />;
  return (
    <LoadScript
      googleMapsApiKey={process.env.API_MAP}
      libraries={lib}
      onLoad={() => console.log("Google Maps loaded successfully.")}
    >
      {chain ? (
        <div>
          <div className={style.headerContainer}>
            <Link href="/">
              <button className={`${style.newCoordinate} center-left-button`}>
                Back Home
              </button>
            </Link>

            <div className={style.accountInfo}>
              <p>{accountAddress}</p>
              <p>
                {accountBalance} {chain}
              </p>
              <p>{balanceSpc} SpaceCoin</p>
            </div>
            <div className={style.infoNft}>
              <p>GeoSpace: {nft.tokenId}</p>
              <p>
                Fees: {nft.tax + 1} {chain}
              </p>
              {assamblage.includes(nft.tokenId) && (
                <p style={{ color: "red" }}>You are the owner</p>
              )}
            </div>
            <button
              onClick={fetchGpsData}
              className={`${style.newCoordinate} center-left-button`}
            >
              New coordinates
            </button>
          </div>
          {showWinMessage && (
            <div className={style.overlay}>
              <div className={style.winMessage}>
                You Win Geospace {nft.tokenId}! Go to your profil...
              </div>
            </div>
          )}
          <div style={style.map}>
            {console.log(position)}
            <GoogleMap
              mapContainerStyle={containerStyle}
              // center={position}
              zoom={1}
            >
              <StreetViewPanorama {...streetViewPanoramaOptions} />
            </GoogleMap>
            <div className={style.miniMapContainer}>
              <GoogleMap
                mapContainerStyle={{
                  width: "100%",
                  height: "100%",
                }}
                center={positionMiniMap}
                zoom={1}
                options={opt()}
                onClick={handleMiniMapClick}
              >
                {markers.map((marker, index) => (
                  <Marker key={index} position={marker} />
                ))}
              </GoogleMap>
              {isLoading && (
                <div className={style.loadingIndicator}>
                  <PropagateLoader
                    css={override}
                    size={10}
                    color={"#107a20"}
                    loading={true}
                  />
                </div>
              )}
              {isTransactionSuccessful && (
                <div className={style.overlay}>
                  <div className={style.successMessage}>{successMessage}</div>
                </div>
              )}
              {isTransactionFailed && (
                <div className={style.overlay}>
                  <div className={style.failureMessage}>{failureMessage}</div>
                </div>
              )}
              {!assamblage.includes(nft.tokenId) && !isLoading && (
                <div className={style.containerButton}>
                  <a className={style.button} onClick={handleConfirmGps}>
                    Guess
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className={style.headerContainer}>
            <Link href="/">
              <button className={`${style.newCoordinate} center-left-button`}>
                Back Home
              </button>
            </Link>
          </div>
          <div className={style.firstContainer}>
            <h1>Start playing</h1>

            <div className={style.dropdownContainer}>
              <button className={`${style.dropdownButton}`}>
                Choose Network
              </button>
              <div className={style.dropdownContent}>
                <button onClick={() => handleSelectChange("inco")}>
                  Inco Network
                </button>
                <button onClick={() => handleSelectChange("zama")}>Zama</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LoadScript>
  );
};

export default ConnectButton;
