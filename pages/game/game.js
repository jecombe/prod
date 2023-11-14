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
import ErrorMetamask from "../errorPage/metamask";
import CryptoJS from "crypto-js";

const lib = ["places"];

export default function GamePage() {
  const containerStyle = {
    width: "100%",
    height: "90vh",
  };

  const init = {
    lat: 0,
    lng: 0,
  };
  //const { addressUser, balance } = useSelector((state) => state.metamask);
  // const dispatch = useDispatch();

  const [position, setPosition] = useState(init);
  const [markers, setMarkers] = useState([]); // État pour stocker les marqueurs
  const [lastPosition, setLastPosition] = useState(init); // État pour stocker les marqueurs
  const [isLoading, setIsLoading] = useState(false); // État pour suivre l'état de chargement
  const [isLoadingMeta, setIsLoadingMeta] = useState(false); // État pour suivre l'état de chargement

  const [isTransactionSuccessful, setIsTransactionSuccessful] = useState(false);
  const [isTransactionFailed, setIsTransactionFailed] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");
  const [isMiniMapDisabled, setIsMiniMapDisabled] = useState(false);
  const [fhevm, setFhevm] = useState(null);
  const [isFetchingCoordinates, setIsFetchingCoordinates] = useState(false);
  const [contract, setContract] = useState(null); // État pour suivre l'état de chargement
  const [signer, setSigner] = useState(null); // État pour suivre l'état de chargement
  const [nft, setNft] = useState({});
  const [isMounted, setIsMounted] = useState(true);

  const [accountAddress, setAccountAddress] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [addr, setAddress] = useState(init);
  const [isMetaMaskInitialized, setIsMetaMaskInitialized] = useState(false);

  const updateAccountInfo = async () => {
    if (typeof window !== "undefined" && window.ethereum && isMounted) {
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
        console.error("error updating account info:", error);
      }
    } else {
      setAccountAddress("MetaMask is not installed");
    }
  };

  useEffect(() => {
    if (isMetaMaskInitialized && isMounted) {
      updateAccountInfo();
    }
  }, [isMetaMaskInitialized, isMounted]);

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);
  useEffect(() => {
    async function initializeContract() {
      try {
        setIsLoadingMeta(true);
        const signer = await initMetaMask();

        const fhevmInstance = await getFhevmInstance();

        setSigner(signer);
        const contract = new ethers.Contract(
          process.env.CONTRACT, // Adresse de votre contrat
          abi, // ABI de votre contrat
          signer
        );
        setFhevm(fhevmInstance);

        // Enregistrez le contrat dans l'état
        setContract(contract);
        setIsMetaMaskInitialized(true);

        if (window.ethereum) {
          window.ethereum.on("accountsChanged", updateAccountInfo);
        }
        setIsLoadingMeta(false);

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
        console.error("Error initialize contract :", error);

        if (isMounted) {
          console.error("Error initialize contract mounted:", error);
          setIsLoading(false);
          setIsLoadingMeta(false);
          setIsTransactionSuccessful(false);
          setIsTransactionFailed(false);
          setIsMiniMapDisabled(false);
        }
      }
    }
    initializeContract();
    fetchGpsData();

    return () => {
      setIsMounted(false);
      //setIsLoadingMeta(false);
    };
  }, [isMounted]);

  const handleMiniMapClick = async (e) => {
    if (isMiniMapDisabled || !signer) {
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
      // const signer = await initMetaMask(); // Initialisez MetaMask
      const gasLimit = 9000000; // Vous pouvez personnaliser la limite de gaz selon vos besoins

      const value = 1 + nft.tax;
      const feeData = await signer.provider.getFeeData();
      //const maxPriorityFeePerGas = maxFeePerGas.div(2); // Exemple, vous pouvez ajuster le facteur selon vos besoins

      // // Créez votre transaction avec les détails nécessaires (à personnaliser selon vos besoins)
      // const transaction = {
      //   from: addr, // Adresse de l'expéditeur
      //   to: contract.address, // Adresse du contrat
      //   gasLimit: "5000000", // Limite de gaz (à personnaliser)
      //   maxFeePerGas: feeData.maxFeePerGas,
      //   maxPriorityFeePerGas: feeData.maxPriorityFeePerGas, // Max Priority Fee Per Gas (à personnaliser)
      //   value: ethers.utils.parseEther(`${value}`), // Montant à envoyer (à personnaliser)
      //   data: contract.interface.encodeFunctionData("checkGps", [lat, lng]), // Encodage de la fonction du contrat et de ses paramètres
      // };

      const transaction = {
        from: addr, // Adresse de l'expéditeur
        to: contract.address, // Adresse du contrat
        gasLimit: "10000000", // Limite de gaz (à personnaliser)
        maxFeePerGas: ethers.utils.parseUnits("500", "gwei"), // Max Fee Per Gas (à personnaliser)
        maxPriorityFeePerGas: ethers.utils.parseUnits("50", "gwei"), // Max Priority Fee Per Gas (à personnaliser)
        value: ethers.utils.parseEther("1"), // Montant à envoyer (à personnaliser)
        data: contract.interface.encodeFunctionData("checkGps", [lat, lng]), // Encodage de la fonction du contrat et de ses paramètres
      };
      // Estimez le gaz nécessaire
      const estimatedGas = await signer.estimateGas(transaction);

      // Ajoutez la limite de gaz estimée à la transaction avec une marge de sécurité
      transaction.gasLimit = estimatedGas.add(10000);

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

  async function fetchGpsData() {
    try {
      const response = await fetch(`${process.env.SERVER}${process.env.ROUTE}`);
      const data = await response.json();
      var bytes = CryptoJS.AES.decrypt(data, process.env.KEY);
      var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      setPosition({
        lat: decryptedData.latitude,
        lng: decryptedData.longitude,
      });
      setNft({
        tokenId: decryptedData.id,
        tax: decryptedData.tax,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const getOption = () => {
    return {
      addressControl: false,
      linksControl: false,
      panControl: true,
      zoomControl: false,
      showRoadLabels: false,

      enableCloseButton: false,
      panControlOptions: {
        position:
          window.google && window.google.maps
            ? window.google.maps.ControlPosition.LEFT_TOP
            : undefined,
      },
    };
  };
  if (isLoadingMeta)
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  if (!signer) return <ErrorMetamask />;

  return (
    <LoadScript
      googleMapsApiKey={process.env.API_MAP}
      libraries={lib}
      onLoad={() => console.log("Google Maps loaded successfully.")}
    >
      <div className={style.headerContainer}>
        <Link href="/">
          <button className={`${style.newCoordinate} center-left-button`}>
            Back Home
          </button>
        </Link>

        <div className={style.accountInfo}>
          <div>{accountAddress}</div>
          <div>{accountBalance}</div>
        </div>
        <button
          onClick={fetchGpsData}
          className={`${style.newCoordinate} center-left-button`}
        >
          New coordinates
        </button>
        <div>
          <p>TokenId: {nft.tokenId}</p>
          <p>Tax: {nft.tax + 1} ZAMA</p>
        </div>
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
            options={getOption()}
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
            zoom={1}
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
