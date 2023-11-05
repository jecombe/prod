"use client";
import { useState, useEffect } from "react";
import Web3 from "web3";
import {
  GoogleMap,
  LoadScript,
  Marker,
  StreetViewPanorama,
} from "@react-google-maps/api";
import style from "./map.module.css";
import { ethers } from "ethers";
import abi from "../../utils/abi/abi";
import { getFhevmInstance } from "../../utils/fhevmInstance";
import initMetaMask from "../../utils/metamask";
import Link from "next/link";
const lib = ["places"];

export default function GamePage() {
  const containerStyle = {
    width: "100%",
    height: "90vh",
  };
  const panoramaOptions = {
    addressControl: false,
    linksControl: false,
    panControl: false,
    zoomControl: false,
    showRoadLabels: false,

    enableCloseButton: false,
  };
  const init = {
    lat: 0,
    lng: 0,
  };

  const [position, setPosition] = useState(init);
  const [markers, setMarkers] = useState([]); // État pour stocker les marqueurs
  const [lastPosition, setLastPosition] = useState(init); // État pour stocker les marqueurs
  const [isLoading, setIsLoading] = useState(false); // État pour suivre l'état de chargement
  const [isTransactionSuccessful, setIsTransactionSuccessful] = useState(false);
  const [isTransactionFailed, setIsTransactionFailed] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");
  const [isMiniMapDisabled, setIsMiniMapDisabled] = useState(false);
  const [contract, setContract] = useState(null);
  const [fhevm, setFhevm] = useState(null);
  const [isFetchingCoordinates, setIsFetchingCoordinates] = useState(false);

  const [accountAddress, setAccountAddress] = useState("Loading...");
  const [accountBalance, setAccountBalance] = useState("Loading...");
  const [addr, setAddress] = useState(init);

  const updateAccountInfo = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        setAccountAddress(`Address : ${address}`);
        setAddress(address);

        const balance = await web3.eth.getBalance(address);
        const etherBalance = web3.utils.fromWei(balance, "ether");
        setAccountBalance(`Balance : ${etherBalance} ZAMA`);
      } catch (error) {
        console.error("error upadte account :", error);
      }
    } else {
      setAccountAddress("Metamask is not install");
    }
  };

  useEffect(() => {
    updateAccountInfo();

    // Écoutez l'événement accountsChanged pour détecter les changements de compte
    window.ethereum.on("accountsChanged", updateAccountInfo);

    // Nettoyez l'écouteur d'événements lorsque le composant est démonté
    return () => {
      window.ethereum.removeListener("accountsChanged", updateAccountInfo);
    };
  }, []);

  useEffect(() => {
    async function fetchGpsData() {
      try {
        const response = await fetch(
          `${process.env.SERVER}${process.env.ROUTE}`
        );
        const data = await response.json();
        setPosition({
          lat: data.latitude,
          lng: data.longitude,
        });
      } catch (error) {
        console.error("Error:", error);
      }
    }

    async function initializeContract() {
      try {
        const fhevmInstance = await getFhevmInstance();

        const signer = await initMetaMask();
        const contract = new ethers.Contract(
          process.env.CONTRACT, // Adresse de votre contrat
          abi, // ABI de votre contrat
          signer
        );
        setFhevm(fhevmInstance);

        // Enregistrez le contrat dans l'état
        setContract(contract);
        // Écoutez l'événement "Result" du contrat
        contract.on("GpsCheckResult", async (userAddress, result) => {
          const addrSigner = await signer.getAddress();
          if (userAddress === addrSigner) {
            // Mettez à jour l'état de votre composant en conséquence
            if (result) {
              setIsTransactionSuccessful(true);
              setSuccessMessage("You Win NFT");
              setIsTransactionFailed(false);
              setIsLoading(false);

              setTimeout(() => {
                setIsTransactionSuccessful(false);
                setIsTransactionFailed(false); // Réinitialisez isTransactionFailed ici
                setIsMiniMapDisabled(false);
              }, 5000);
            } else {
              setIsTransactionFailed(true);
              setFailureMessage("Sorry, you lost.");
              setIsTransactionSuccessful(false);
              setIsLoading(false);

              setTimeout(() => {
                setIsTransactionSuccessful(false);
                setIsTransactionFailed(false); // Réinitialisez isTransactionFailed ici
                setIsMiniMapDisabled(false);
              }, 5000);
            }
          }
        });
      } catch (error) {
        console.error("Erorr initialize contract :", error);
        setIsLoading(false);
        setIsTransactionSuccessful(false);
        setIsTransactionFailed(false); // Réinitialisez isTransactionFailed ici
        setIsMiniMapDisabled(false);
      }
    }
    fetchGpsData();
    initializeContract();
  }, []);

  const handleMiniMapClick = async (e) => {
    if (isMiniMapDisabled) {
      return; // Ne rien faire si la mini-map est désactivée
    }
    const newMarker = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setIsLoading(true);
    setIsMiniMapDisabled(true); // Désactiver la mini-map pendant le chargement

    setMarkers([...markers, newMarker]);
    setLastPosition(newMarker);
    try {
      const attConvert = Math.trunc(newMarker.lat * 1e5);
      const lngConvert = Math.trunc(newMarker.lng * 1e5);
      const lat = fhevm.encrypt32(attConvert);
      const lng = fhevm.encrypt32(lngConvert);

      //const gasPrice = ethers.utils.parseUnits("50", "gwei"); // Spécifiez le prix du gaz (20 Gwei dans cet exemple)
      const signer = await initMetaMask(); // Initialisez MetaMask
      const gasLimit = 9000000; // Vous pouvez personnaliser la limite de gaz selon vos besoins

      const gasPrice = await signer.provider.getGasPrice();
      const maxPriorityFeePerGas = await signer.provider.getFeeData();

      // // Créez votre transaction avec les détails nécessaires (à personnaliser selon vos besoins)
      const transaction = {
        from: addr, // Adresse de l'expéditeur
        to: contract.address, // Adresse du contrat
        gasLimit: "5000000", // Limite de gaz (à personnaliser)
        maxFeePerGas: ethers.utils.parseUnits("100", "gwei"), // Max Fee Per Gas (à personnaliser)
        maxPriorityFeePerGas: ethers.utils.parseUnits("10", "gwei"), // Max Priority Fee Per Gas (à personnaliser)
        value: ethers.utils.parseEther("1"), // Montant à envoyer (à personnaliser)
        data: contract.interface.encodeFunctionData("checkGps", [lat, lng]), // Encodage de la fonction du contrat et de ses paramètres
      };

      const tx = await signer.sendTransaction(transaction);

      await tx.wait();
    } catch (error) {
      console.error("Error send transaction :", error);
      setIsLoading(false);
      setIsMiniMapDisabled(false); // Désactiver la mini-map pendant le chargement
      setMarkers([]);
      setLastPosition(init);
    }
  };

  const fetchNewCoordinates = async () => {
    setIsFetchingCoordinates(true);

    try {
      const response = await fetch(`${process.env.SERVER}${process.env.ROUTE}`);
      const data = await response.json();

      setPosition({
        lat: data.latitude,
        lng: data.longitude,
      });
    } catch (error) {
      console.error("Error new coordinates :", error);
    } finally {
      setIsFetchingCoordinates(false);
    }
  };

  return (
    <LoadScript googleMapsApiKey={process.env.API_MAP} libraries={lib}>
      <div className={style.headerContainer}>
        <Link href="/home/page">
          <button className={`${style.newCoordinate} center-left-button`}>
            Back Home
          </button>
        </Link>

        <div className={style.accountInfo}>
          <div>{accountAddress}</div>
          <div>{accountBalance}</div>
        </div>
        <button
          onClick={fetchNewCoordinates}
          className={`${style.newCoordinate} center-left-button`}
          disabled={isFetchingCoordinates}
        >
          {isFetchingCoordinates ? "Loading..." : "New coordinates"}
        </button>
      </div>
      <div style={style.map}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={1}
        >
          <StreetViewPanorama
            id="street-view"
            containerStyle={containerStyle}
            options={panoramaOptions}
            position={position}
            visible={true}
          />
        </GoogleMap>

        <div
          className={style.miniMapContainer}
          style={{
            width: "300px",
            height: "300px",
            position: "absolute",
            bottom: "10px",
            right: "10px",
            zIndex: 1,
          }}
        >
          {/* <MiniMap
            markers={markers}
            onMiniMapClick={isLoading ? null : handleMiniMapClick}
            position={lastPosition}
          /> */}

          <GoogleMap
            mapContainerStyle={{
              width: "100%",
              height: "100%",
            }}
            center={lastPosition}
            zoom={2}
            options={{
              disableDefaultUI: true,
            }}
            onClick={handleMiniMapClick}
          >
            {markers.map((marker, index) => (
              <Marker key={index} position={marker} />
            ))}
          </GoogleMap>
          {isLoading && (
            <div className={style.loadingIndicator}>Loading...</div>
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
        </div>
      </div>
    </LoadScript>
  );
}
