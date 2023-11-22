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
import Loading from "../loading/loading";

const lib = ["places"];

export default function GamePage() {
  const containerStyle = {
    width: "100%",
    height: "90vh",
  };

  const init = { lat: 0, lng: 0 };

  const [position, setPosition] = useState(init);
  const [markers, setMarkers] = useState([]);
  const [lastPosition, setLastPosition] = useState(init);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [isTransactionSuccessful, setIsTransactionSuccessful] = useState(false);
  const [isTransactionFailed, setIsTransactionFailed] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");
  const [isMiniMapDisabled, setIsMiniMapDisabled] = useState(false);
  const [fhevm, setFhevm] = useState(null);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [nft, setNft] = useState({});
  const [isMounted, setIsMounted] = useState(true);
  const [accountAddress, setAccountAddress] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [isMetaMaskInitialized, setIsMetaMaskInitialized] = useState(false);
  const [showWinMessage, setShowWinMessage] = useState(false);

  const updateAccountInfo = async () => {
    if (typeof window !== "undefined" && window.ethereum && isMounted) {
      const web3 = new Web3(window.ethereum);
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        setAccountAddress(`Address : ${address}`);

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

      setContract(null);
      setSigner(null);

      await initializeContract();
      await updateAccountInfo();
    } catch (error) {
      console.error("Error connecting to Fhenix Devnet:", error);
    }
  };
  async function initializeContract() {
    try {
      setIsLoadingMeta(true);
      const signer = await initMetaMask();
      const fhevmInstance = await getFhevmInstance();

      setSigner(signer);
      const contract = new ethers.Contract(process.env.CONTRACT, abi, signer);
      setFhevm(fhevmInstance);
      setContract(contract);
      setIsMetaMaskInitialized(true);

      if (window.ethereum) {
        window.ethereum.on("accountsChanged", updateAccountInfo);
      }
      setIsLoadingMeta(false);

      contract.on("GpsCheckResult", async (userAddress, result) => {
        const addrSigner = await signer.getAddress();
        if (userAddress === addrSigner) {
          if (result) {
            setShowWinMessage(true);

            setIsTransactionSuccessful(true);
            setSuccessMessage("You Win NFT");
            setIsTransactionFailed(false);
            setIsLoading(false);

            setTimeout(() => {
              setShowWinMessage(false);
              setIsTransactionSuccessful(false);
              setIsTransactionFailed(false);
              setIsMiniMapDisabled(false);
            }, 5000);
          } else {
            setIsTransactionFailed(true);
            setFailureMessage("Sorry, you lost.");
            setIsTransactionSuccessful(false);
            setIsLoading(false);

            setTimeout(() => {
              setIsTransactionSuccessful(false);
              setIsTransactionFailed(false);
              setIsMiniMapDisabled(false);
            }, 5000);
          }
        }
      });
    } catch (error) {
      console.error("Error initialize contract:", error);

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

  useEffect(() => {
    alert("Attention: The game is under development, and bugs may occur.");

    checkNetwork();
  }, []);

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
    initializeContract();
    fetchGpsData();

    return () => {
      setIsMounted(false);
    };
  }, [isMounted]);

  const handleMiniMapClick = async (e) => {
    if (isMiniMapDisabled || !signer) {
      return;
    }
    const newMarker = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setIsLoading(true);
    setIsMiniMapDisabled(true);

    setMarkers([...markers, newMarker]);
    setLastPosition(newMarker);
    try {
      const attConvert = Math.trunc(newMarker.lat * 1e5);
      const lngConvert = Math.trunc(newMarker.lng * 1e5);
      const lat = fhevm.encrypt32(attConvert);
      const lng = fhevm.encrypt32(lngConvert);

      const value = 1 + nft.tax;
      console.log(nft.tokenId);
      const transaction = await contract["checkGps(bytes,bytes,uint256)"](
        lat,
        lng,
        1,
        {
          value: ethers.utils.parseEther(`${value}`),
          gasLimit: 10000000,
        }
      );

      await transaction.wait();
    } catch (error) {
      console.error("Error send transaction:", error);
      setIsLoading(false);
      setIsMiniMapDisabled(false);
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

  if (!signer && !isLoadingMeta) {
    return (
      <ErrorMetamask message="Please connect to MetaMask and go to zama devnet" />
    );
  }
  if (isLoadingMeta) return <Loading />;

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
      {showWinMessage && (
        <div className={style.overlay}>
          <div className={style.winMessage}>
            You Win Geospace! Go to your profile...
          </div>
        </div>
      )}
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
