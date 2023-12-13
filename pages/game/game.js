import { useState, useEffect, useRef } from "react";
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
import CryptoJS from "crypto-js";
import Loading from "../loading/loading";
import ReactPlayer from "react-player"; // Importez ReactPlayer
import Image from "next/image";
import { css } from "@emotion/react";
import { PropagateLoader } from "react-spinners";
const lib = ["places"];

export default function GamePage() {
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red; // Adjust the color as needed
  `;

  const containerStyle = {
    width: "100%",
    height: "90vh",
  };

  const init = { lat: 0, lng: 0 };

  const [position, setPosition] = useState(init);
  const [positionMiniMap, setPositionMiniMap] = useState(init);

  const [markers, setMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingGps, setIsLoadingDataGps] = useState(false);
  const isMountedRef = useRef(true);

  const [isTransactionSuccessful, setIsTransactionSuccessful] = useState(false);
  const [isTransactionFailed, setIsTransactionFailed] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");
  const [fhevm, setFhevm] = useState(null);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [nft, setNft] = useState({});
  const [accountAddress, setAccountAddress] = useState("0x");
  const [accountBalance, setAccountBalance] = useState(0);
  const [balanceSpc, setBalanceSPC] = useState(0);
  // const [feesNftMap, setFeesNftMap] = useState({});

  // const [isMetaMaskInitialized, setIsMetaMaskInitialized] = useState(false);
  const [showWinMessage, setShowWinMessage] = useState(false);
  const [isPlay, setIsPlay] = useState(true);

  const [assamblage, setAssamblage] = useState([]);

  const handleAccountsChanged = async () => {
    setBalanceSPC(0);
    setAccountAddress("0x");
    await initialize();
    await manageData();
  };

  useEffect(() => {
    const init = async () => {
      if (isMountedRef.current) {
        await checkNetwork();
        await initialize();
      }

      if (window.ethereum) {
        window.ethereum.on("accountsChanged", handleAccountsChanged);
      }
    };

    init();
    return () => {
      // Cleanup the subscription when the component unmounts
      if (window.ethereum) {
        window.ethereum.off("accountsChanged", handleAccountsChanged);
      }
      isMountedRef.current = false;
    };
  }, []);

  const manageData = async () => {
    try {
      if (signer && contract) {
        updateAccountInfo();
        initializeContract();
        fetchData();
      }
    } catch (error) {
      console.error("manageData", error);
      setIsLoadingData(false); // Set loading to false when data processing is complete
      return error;
      // Handle errors
    } finally {
      setIsLoadingData(false); // Set loading to false when data processing is complete
    }
  };

  const manageDataGps = async (isMounted) => {
    try {
      if (signer && contract) {
        await fetchGpsData(isMounted);
        // Perform data-related logic here
      }
    } catch (error) {
      console.log(position);
      setIsLoadingDataGps(false);
      return error;
      // Handle errors
    } finally {
      setIsLoadingDataGps(false);
      //setIsLoadingData(false); // Set loading to false when data processing is complete
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      setIsLoadingData(true);

      manageData();
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [signer, contract]); // Add dependency on 'signer' and 'contract'

  useEffect(() => {
    let isMounted = true;
    if (isMounted && signer && contract) {
      setIsLoadingDataGps(true);

      manageDataGps(isMounted);
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [signer, contract]); // Add dependency on 'signer' and 'contract'

  // useEffect(() => {
  //   setIsLoadingData(true);
  //   let isMounted = true;
  //   if (isMounted) {
  //     manageData();
  //     manageDataGps();
  //   }

  //   // Cleanup function
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [signer, contract]); // Add dependency on 'signer'

  // useEffect(() => {
  //   setIsLoadingDataGps(true);
  //   let isMounted = true;
  //   if (isMounted) {
  //     manageDataGps(isMounted);
  //   }

  //   // Cleanup function
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [signer, contract]); // Add dependency on 'signer'

  const getSignerContract = async () => {
    const sign = await initMetaMask();
    const fhevmInstance = await getFhevmInstance();
    const contractGame = new ethers.Contract(process.env.CONTRACT, abi, sign);
    return { sign, fhevmInstance, contractGame };
  };
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

  // const updateBalances = async (web3) => {
  //   try {
  //     const balance = await web3.eth.getBalance(accountAddress);
  //     const balanceCoin = await contract.getBalanceCoinSpace(accountAddress);

  //     const etherBalance = Math.round(web3.utils.fromWei(balance, "ether"));
  //     const etherBalanceCoin = Math.round(
  //       web3.utils.fromWei(balanceCoin, "ether")
  //     );

  //     setAccountBalance(etherBalance);
  //     setBalanceSPC(etherBalanceCoin);
  //   } catch (error) {
  //     console.error("Error updating balances:", error);
  //   }
  // };

  const initialize = async () => {
    const { sign, fhevmInstance, contractGame } = await getSignerContract();

    setFhevm(fhevmInstance);
    setSigner(sign);
    setContract(contractGame);

    setIsLoadingData(true);
  };

  // Fonction fetchData optimisée
  const fetchData = async () => {
    try {
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

      // const feesNftMap = {};
      // feesNft.forEach((fee, index) => {
      //   const valueEth = Math.round(ethers.utils.formatUnits(fee, "ether"));

      //   feesNftMap[resetNFTs[index]] = valueEth;
      // });

      // setFeesNftMap(feesNftMap);

      const filteredOwnedNFTs = ownedNFTs.filter(
        (tokenId) =>
          !resetNFTs.includes(tokenId) && !stakedNFTs.includes(tokenId)
      );
      setOwnedNFTs(filteredOwnedNFTs);
      setAccountBalance(balanceEther);
      setBalanceSPC(balanceCoinSpace);
      setStakedNFTs(stakedNFTs);
      setResetNFT(resetNFTs);
      setCreationNFT(nftsCreaFee);
      const assamblage = getAllOwnedNfts(
        filteredOwnedNFTs,
        stakedNFTs,
        resetNFTs,
        creationNFTs
      );
      setAssamblage(assamblage);

      return assamblage;
    } catch (error) {
      console.error("Error fetching data:", error);
      return error;
    }
  };

  const updateAccountInfo = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        setAccountAddress(`${address}`);
      } catch (error) {
        console.error("error updating account info:", error);
        setAccountAddress("0x");
        return error;
      }
    } else {
      setAccountAddress("0x");
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
      return error;
    }
  };

  async function initializeContract() {
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
              await fetchData();
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
      setIsLoading(false);
      setMarkers([]);
      setIsTransactionSuccessful(false);
      setIsTransactionFailed(false);
      return error;
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
            const { sign, contract } = await getSignerContract();
            await initializeContract(sign, contract);
          }
        }
      } catch (error) {
        console.error("Error checking network:", error);
        return error;
      }
    }
  };

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

  const opt = () => {
    return {
      disableDefaultUI: true,
      zoomControl: true,
      scrollwheel: true, // Active la roulette de la souris pour le zoom
    };
  };

  const MuteButton = ({ onClick }) => {
    return (
      <button onClick={onClick}>
        {isPlay ? (
          <Image src="/volume-2.svg" alt="volume2" height={30} width={30} />
        ) : (
          <Image src="/volume-x.svg" alt="volumex" height={30} width={30} />
        )}
      </button>
    );
  };

  async function fetchGpsData() {
    try {
      setMarkers([]);
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
  if (!signer) {
    return <Loading />;
  }
  if (isLoadingData && isLoadingGps) {
    return <Loading />;
  }
  return (
    <LoadScript
      googleMapsApiKey={process.env.API_MAP}
      libraries={lib}
      onLoad={() => console.log("Google Maps loaded successfully.")}
    >
      <ReactPlayer
        url="/musicGeo.mp3"
        playing={isPlay}
        loop={true}
        volume={0.1}
        width="0px"
        height="0px"
      />

      <div className={style.headerContainer}>
        <Link href="/">
          <button className={`${style.newCoordinate} center-left-button`}>
            Back Home
          </button>
        </Link>
        <MuteButton onClick={() => setIsPlay(!isPlay)} />

        <div className={style.accountInfo}>
          <p>{accountAddress}</p>
          <p>{accountBalance} ZAMA</p>
          <p>{balanceSpc} SpaceCoin</p>
        </div>

        <div className={style.infoNft}>
          <p>GeoSpace: {nft.tokenId}</p>
          <p>Fees: {nft.tax + 1} ZAMA</p>
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
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={1}
        >
          <StreetViewPanorama
            id="street-view"
            containerStyle={containerStyle}
            options={gestOption()}
            position={position}
            visible={true}
          />
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
    </LoadScript>
  );
}
