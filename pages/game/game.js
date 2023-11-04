"use client";
import { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  StreetViewPanorama,
} from "@react-google-maps/api";
import style from "./map.module.css";
import { MiniMap } from "./minimap/minimap";
import { ethers } from "ethers";
import abi from "../../utils/abi/abi";
import { getFhevmInstance } from "../../utils/fhevmInstance";
import initMetaMask from "../../utils/metamask";
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

  useEffect(() => {
    async function fetchGpsData() {
      try {
        const response = await fetch(`http://localhost:8000/api/get-gps`);
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
              setSuccessMessage("Félicitations ! Vous avez gagné.");
              setIsTransactionFailed(false);
              setIsLoading(false);

              setTimeout(() => {
                setIsTransactionSuccessful(false);
                setIsTransactionFailed(false); // Réinitialisez isTransactionFailed ici
                setIsMiniMapDisabled(false);
              }, 5000);
            } else {
              setIsTransactionFailed(true);
              setFailureMessage("Désolé, vous avez perdu.");
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
        console.error("Erreur lors de l'initialisation du contrat :", error);
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

      const value = ethers.utils.parseEther("1");
      //const gasPrice = ethers.utils.parseUnits("50", "gwei"); // Spécifiez le prix du gaz (20 Gwei dans cet exemple)

      const rep = await contract.checkGps(lat, lng, {
        value,
        gasPrice: 5000000, // Spécifiez le prix du gaz dans l'objet de transaction
      });

      await rep.wait();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la transaction :", error);
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
      console.error(
        "Erreur lors de la récupération des nouvelles coordonnées :",
        error
      );
    } finally {
      setIsFetchingCoordinates(false);
    }
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyD0ZKYS4E9Sl1izucojjOl3nErVLN2ixVQ"
      libraries={lib}
    >
      <div style={style.map}>
        <button
          onClick={fetchNewCoordinates}
          className={`${style.fetchButton} center-left-button`}
          disabled={isFetchingCoordinates}
        >
          {isFetchingCoordinates
            ? "Chargement..."
            : "Nouvelles coordonnées GPS"}
        </button>
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
          <MiniMap
            markers={markers}
            onMiniMapClick={isLoading ? null : handleMiniMapClick}
            position={lastPosition}
          />
          {isLoading && (
            <div className={style.loadingIndicator}>Chargement en cours...</div>
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
