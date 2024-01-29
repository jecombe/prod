// import { useState, useEffect, useRef } from "react";
// import {
//   GoogleMap,
//   LoadScript,
//   Marker,
//   StreetViewPanorama,
// } from "@react-google-maps/api";
// import style from "./map.module.css";
// import { ethers } from "ethers";
// import abi from "../../utils/abi/abi";
// import abiGame from "../../utils/abi/game";

// import { getFhevmInstance } from "../../utils/fhevmInstance";
// import initMetaMask from "../../utils/metamask";
// import Link from "next/link";
// import CryptoJS from "crypto-js";
// import Loading from "../loading/loading";
// import ReactPlayer from "react-player"; // Importez ReactPlayer
// import Image from "next/image";
// import { css } from "@emotion/react";
// import { PropagateLoader } from "react-spinners";
// import ErrorMetamask from "../errorPage/metamask";
// const lib = ["places"];

// export default function GamePage() {
//   const override = css`
//     display: block;
//     margin: 0 auto;
//     border-color: red; // Adjust the color as needed
//   `;

//   const containerStyle = {
//     width: "100%",
//     height: "90vh",
//   };

//   const init = { lat: 0, lng: 0 };

//   const [position, setPosition] = useState(init);
//   const [positionMiniMap, setPositionMiniMap] = useState(init);

//   const [markers, setMarkers] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isLoadingData, setIsLoadingData] = useState(false);
//   const [isLoadingGps, setIsLoadingDataGps] = useState(false);
//   const isMountedRef = useRef(true);

//   const [isTransactionSuccessful, setIsTransactionSuccessful] = useState(false);
//   const [isTransactionFailed, setIsTransactionFailed] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [failureMessage, setFailureMessage] = useState("");
//   const [fhevm, setFhevm] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [contractGa, setContractGame] = useState(null);

//   const [signer, setSigner] = useState(null);
//   const [nft, setNft] = useState({});
//   const [accountAddress, setAccountAddress] = useState("0x");
//   const [accountBalance, setAccountBalance] = useState(0);
//   const [balanceSpc, setBalanceSPC] = useState(0);
//   // const [feesNftMap, setFeesNftMap] = useState({});

//   // const [isMetaMaskInitialized, setIsMetaMaskInitialized] = useState(false);
//   const [showWinMessage, setShowWinMessage] = useState(false);
//   const [isPlay, setIsPlay] = useState(true);

//   const [assamblage, setAssamblage] = useState([]);

//   const handleAccountsChanged = async () => {
//     setBalanceSPC(0);
//     setAccountAddress("0x");
//     await initialize();
//     await manageData();
//   };

//   useEffect(() => {
//     const init = async () => {
//       if (isMountedRef.current) {
//         await checkNetwork();
//         await initialize();
//       }

//       if (window.ethereum) {
//         window.ethereum.on("accountsChanged", handleAccountsChanged);
//       }
//     };

//     init();
//     return () => {
//       // Cleanup the subscription when the component unmounts
//       if (window.ethereum) {
//         window.ethereum.off("accountsChanged", handleAccountsChanged);
//       }
//       isMountedRef.current = false;
//     };
//   }, []);

//   useEffect(() => {
//     checkNetwork();
//     // initializeMetaMask();
//   }, []);

//   const manageData = async () => {
//     try {
//       if (signer && contract && contractGa) {
//         updateAccountInfo();
//         initializeContract();
//         fetchData();
//       }
//     } catch (error) {
//       console.error("manageData", error);
//       setIsLoadingData(false); // Set loading to false when data processing is complete
//       return error;
//       // Handle errors
//     } finally {
//       setIsLoadingData(false); // Set loading to false when data processing is complete
//     }
//   };

//   const manageDataGps = async (isMounted) => {
//     try {
//       if (signer && contract && contractGa) {
//         await fetchGpsData(isMounted);
//         // Perform data-related logic here
//       }
//     } catch (error) {
//       setIsLoadingDataGps(false);
//       return error;
//       // Handle errors
//     } finally {
//       setIsLoadingDataGps(false);
//       //setIsLoadingData(false); // Set loading to false when data processing is complete
//     }
//   };

//   useEffect(() => {
//     let isMounted = true;
//     if (isMounted) {
//       setIsLoadingData(true);

//       manageData();
//     }

//     // Cleanup function
//     return () => {
//       isMounted = false;
//     };
//   }, [signer, contract, contractGa]); // Add dependency on 'signer' and 'contract'

//   useEffect(() => {
//     let isMounted = true;
//     if (isMounted && signer && contract && contractGa) {
//       setIsLoadingDataGps(true);

//       manageDataGps(isMounted);
//     }

//     // Cleanup function
//     return () => {
//       isMounted = false;
//     };
//   }, [signer, contract, contractGa]); // Add dependency on 'signer' and 'contract'

//   // useEffect(() => {
//   //   setIsLoadingData(true);
//   //   let isMounted = true;
//   //   if (isMounted) {
//   //     manageData();
//   //     manageDataGps();
//   //   }

//   //   // Cleanup function
//   //   return () => {
//   //     isMounted = false;
//   //   };
//   // }, [signer, contract]); // Add dependency on 'signer'

//   // useEffect(() => {
//   //   setIsLoadingDataGps(true);
//   //   let isMounted = true;
//   //   if (isMounted) {
//   //     manageDataGps(isMounted);
//   //   }

//   //   // Cleanup function
//   //   return () => {
//   //     isMounted = false;
//   //   };
//   // }, [signer, contract]); // Add dependency on 'signer'

//   const getSignerContract = async () => {
//     const sign = await initMetaMask();
//     const fhevmInstance = await getFhevmInstance();
//     const contractGame = new ethers.Contract(process.env.CONTRACT, abi, sign);
//     const contractG = new ethers.Contract(process.env.GAME, abiGame, sign);

//     return { sign, fhevmInstance, contractGame, contractG };
//   };
//   const getAllOwnedNfts = (ownedNFTsU, resetNFTU, createdNFTs) => {
//     const assambly = [];
//     if (ownedNFTsU.length > 0) {
//       assambly.push(ownedNFTsU);
//     }
//     if (resetNFTU.length > 0) {
//       assambly.push(resetNFTU);
//     }
//     if (createdNFTs.length > 0) {
//       assambly.push(createdNFTs);
//     }
//     return assambly.reduce((acc, currentArray) => acc.concat(currentArray), []);
//   };

//   // const updateBalances = async (web3) => {
//   //   try {
//   //     const balance = await web3.eth.getBalance(accountAddress);
//   //     const balanceCoin = await contract.getBalanceCoinSpace(accountAddress);

//   //     const etherBalance = Math.round(web3.utils.fromWei(balance, "ether"));
//   //     const etherBalanceCoin = Math.round(
//   //       web3.utils.fromWei(balanceCoin, "ether")
//   //     );

//   //     setAccountBalance(etherBalance);
//   //     setBalanceSPC(etherBalanceCoin);
//   //   } catch (error) {
//   //     console.error("Error updating balances:", error);
//   //   }
//   // };

//   const initialize = async () => {
//     const { sign, fhevmInstance, contractGame, contractG } =
//       await getSignerContract();

//     setFhevm(fhevmInstance);
//     setSigner(sign);
//     setContract(contractGame);
//     setContractGame(contractG);

//     setIsLoadingData(true);
//   };

//   // Fonction fetchData optimisée
//   const fetchData = async () => {
//     try {
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const userAddress = await signer.getAddress();

//       // Créez un tableau de promesses
//       const promises = [
//         contractGa.getOwnedNFTs(userAddress),
//         contractGa.getResetNFTsAndFeesByOwner(userAddress),
//         contractGa.getNftCreationAndFeesByUser(userAddress),
//         contractGa.getWinIds(userAddress),
//         provider.getBalance(userAddress),
//         contract.getBalanceCoinSpace(userAddress),
//       ];

//       const [
//         nftsOwned,
//         nftsRAndFees,
//         nftsCreationFees,
//         nftsWin,
//         balanceWei,
//         balanceWeiCoinSpace,
//       ] = await Promise.all(promises);
//       const balanceEther = ethers.utils.formatUnits(balanceWei, "ether");

//       const balanceCoinSpace = ethers.utils.formatUnits(
//         balanceWeiCoinSpace,
//         "ether"
//       );

//       const ownedNFTs = nftsOwned.map((tokenId) => tokenId.toNumber());

//       const resetNFTs = nftsRAndFees[0].map((tokenId) => tokenId.toNumber());
//       // const feesNft = nftsRAndFees[1].map((tokenId) => tokenId.toString());
//       const creationNFTs = nftsCreationFees[0].map((tokenId) =>
//         tokenId.toNumber()
//       );
//       const winsNfts = nftsWin.map((tokenId) => tokenId.toNumber());
//       // const creationNFTsFees = nftsCreationFees[1].map((tokenId) =>
//       //   tokenId.toString()
//       // );

//       // const nftsCreaFee = creationNFTs.map((id, index) => ({
//       //   id,
//       //   fee: Math.round(
//       //     ethers.utils.formatUnits(creationNFTsFees[index], "ether")
//       //   ),
//       // }));
//       //setCreatedNFTs(creationNFTs);

//       // const feesNftMap = {};
//       // feesNft.forEach((fee, index) => {
//       //   const valueEth = Math.round(ethers.utils.formatUnits(fee, "ether"));

//       //   feesNftMap[resetNFTs[index]] = valueEth;
//       // });

//       // setFeesNftMap(feesNftMap);

//       const filteredOwnedNFTs = ownedNFTs.filter(
//         (tokenId) => !resetNFTs.includes(tokenId)
//       );

//       const allFiltrage = winsNfts.filter(
//         (tokenId) => !filteredOwnedNFTs.includes(tokenId)
//       );
//       // setOwnedNFTs(filteredOwnedNFTs);
//       setAccountBalance(balanceEther);
//       setBalanceSPC(balanceCoinSpace);
//       // setStakedNFTs(stakedNFTs);
//       // setResetNFT(resetNFTs);
//       // setCreationNFT(nftsCreaFee);
//       const assamblage = getAllOwnedNfts(allFiltrage, resetNFTs, creationNFTs);
//       setAssamblage(assamblage);

//       return assamblage;
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       return error;
//     }
//   };

//   const updateAccountInfo = async () => {
//     if (typeof window !== "undefined" && window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({
//           method: "eth_requestAccounts",
//         });
//         const address = accounts[0];
//         setAccountAddress(`${address}`);
//       } catch (error) {
//         console.error("error updating account info:", error);
//         setAccountAddress("0x");
//         return error;
//       }
//     } else {
//       setAccountAddress("0x");
//     }
//   };

//   const connectToZamaDevnet = async () => {
//     try {
//       await window.ethereum.request({
//         method: "wallet_addEthereumChain",
//         params: [
//           {
//             chainId: "0x1f49",
//             chainName: "Zama Network",
//             nativeCurrency: {
//               name: "ZAMA",
//               symbol: "ZAMA",
//               decimals: 18,
//             },
//             rpcUrls: ["https://devnet.zama.ai"],
//             blockExplorerUrls: ["https://main.explorer.zama.ai"],
//           },
//           // {
//           //   chainId: "0x2382",
//           //   chainName: "Inco Network",
//           //   nativeCurrency: {
//           //     name: "INCO",
//           //     symbol: "INCO",
//           //     decimals: 18,
//           //   },
//           //   rpcUrls: ["https://evm-rpc.inco.network/"],
//           //   blockExplorerUrls: ["https://explorer.inco.network/"],
//           // },
//         ],
//       });

//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     } catch (error) {
//       console.error("Error connecting to Fhenix Devnet:", error);
//       return error;
//     }
//   };

//   async function initializeContract() {
//     try {
//       const addrSigner = await signer.getAddress();
//       console.log("INIT CONTRACT", addrSigner, contract);
//       contract.on(
//         "GpsCheckResult",
//         async (userAddress, owner, result, tokenId) => {
//           if (userAddress === addrSigner) {
//             if (result) {
//               const readable = Number(tokenId.toString());
//               console.log("YOU WIN NFT", readable);
//               setShowWinMessage(true);
//               setIsTransactionSuccessful(true);
//               setSuccessMessage(`You Win NFT ${readable}`);
//               setIsTransactionFailed(false);
//               setIsLoading(false);

//               setTimeout(async () => {
//                 setShowWinMessage(false);
//                 setIsTransactionSuccessful(false);
//                 setIsTransactionFailed(false);
//                 await fetchData();
//                 await fetchGpsData();
//               }, 5000);
//             } else {
//               setIsTransactionFailed(true);
//               setFailureMessage("Sorry, you lost.");
//               setIsTransactionSuccessful(false);
//               setIsLoading(false);
//               setMarkers([]);

//               setTimeout(() => {
//                 setIsTransactionSuccessful(false);
//                 setIsTransactionFailed(false);
//                 setMarkers([]);
//               }, 5000);
//             }
//           }
//         }
//       );
//     } catch (error) {
//       console.error("Error initializing contract:", error);
//       setIsLoading(false);
//       setMarkers([]);
//       setIsTransactionSuccessful(false);
//       setIsTransactionFailed(false);
//       return error;
//     }
//   }

//   const checkNetwork = async () => {
//     if (window.ethereum) {
//       try {
//         const networkId = await window.ethereum.request({
//           method: "eth_chainId",
//         });
//         //  0x2382;
//         // if (networkId !== "0x2382") {
//         if (networkId !== "0x1f49") {
//           const userResponse = window.confirm(
//             "Please switch to Zama Devnet network to use this application. Do you want to switch now?"
//           );

//           if (userResponse) {
//             await connectToZamaDevnet();
//             const { sign, contract } = await getSignerContract();
//             await initializeContract(sign, contract);
//           }
//         }
//       } catch (error) {
//         console.error("Error checking network:", error);
//         return error;
//       }
//     }
//   };

//   const gestOption = () => {
//     return {
//       addressControl: false,
//       linksControl: false,
//       panControl: true,
//       zoomControl: false,
//       showRoadLabels: false,
//       enableCloseButton: false,
//       panControlOptions: {
//         position:
//           typeof window !== "undefined" && window.google && window.google.maps
//             ? window.google.maps.ControlPosition.LEFT_TOP
//             : undefined,
//       },
//     };
//   };

//   const handleMiniMapClick = async (e) => {
//     const newMarker = {
//       lat: e.latLng.lat(),
//       lng: e.latLng.lng(),
//     };
//     setMarkers((prevMarkers) => [newMarker]);
//     setPositionMiniMap(newMarker);
//   };

//   const handleConfirmGps = async () => {
//     if (!positionMiniMap.lat || !positionMiniMap.lng) {
//       alert("You need to place a pin");
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const attConvert = Math.trunc(positionMiniMap.lat * 1e5);
//       const lngConvert = Math.trunc(positionMiniMap.lng * 1e5);
//       const lat = fhevm.encrypt32(attConvert);
//       const lng = fhevm.encrypt32(lngConvert);
//       const value = 2 + nft.tax;
//       const gasEstimation = await contract.estimateGas.checkGps(
//         lat,
//         lng,
//         nft.tokenId,
//         {
//           value: ethers.utils.parseEther(`${value}`),
//         }
//       );
//       const gasLimit = gasEstimation.mul(120).div(100);
//       console.log(
//         `Gas estimation estimation ${gasEstimation} Gwei\nGas estimation with error marge: ${gasLimit}`
//       );

//       const transaction = await contract["checkGps(bytes,bytes,uint256)"](
//         lat,
//         lng,
//         nft.tokenId,
//         {
//           value: ethers.utils.parseEther(`${value}`),
//           gasLimit,
//         }
//       );
//       const rep = await transaction.wait();
//       console.log(rep);
//     } catch (error) {
//       console.error("handleConfirmGps", error);
//       setIsLoading(false);
//       return error;
//     }
//   };

//   const opt = () => {
//     return {
//       disableDefaultUI: true,
//       zoomControl: true,
//       scrollwheel: true, // Active la roulette de la souris pour le zoom
//     };
//   };

//   const MuteButton = ({ onClick }) => {
//     return (
//       <button onClick={onClick}>
//         {isPlay ? (
//           <Image src="/volume-2.svg" alt="volume2" height={30} width={30} />
//         ) : (
//           <Image src="/volume-x.svg" alt="volumex" height={30} width={30} />
//         )}
//       </button>
//     );
//   };

//   async function fetchGpsData() {
//     try {
//       setMarkers([]);
//       const response = await fetch(`${process.env.SERVER}${process.env.ROUTE}`);
//       const data = await response.json();
//       var bytes = CryptoJS.AES.decrypt(data, process.env.KEY);
//       var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
//       setPosition({
//         lat: decryptedData.latitude,
//         lng: decryptedData.longitude,
//       });
//       setNft({
//         tokenId: decryptedData.id,
//         tax: decryptedData.tax,
//       });
//     } catch (error) {
//       setPosition({
//         lat: 0,
//         lng: 0,
//       });
//       setNft({
//         tokenId: 0,
//         tax: 0,
//       });
//       alert(
//         "Either no NFT is found, or an error occurs ! Contact support discord / telegram"
//       );
//       throw `fetchGps ${error}`;
//     }
//   }

//   if (isLoadingData && isLoadingGps) {
//     return <Loading />;
//   }

//   if (!signer && !isLoading) {
//     return (
//       <ErrorMetamask message="Please connect to MetaMask and go to zama devnet" />
//     );
//   }
//   // if (isLoading) return <Loading />;

//   return (
//     <LoadScript
//       googleMapsApiKey={process.env.API_MAP}
//       libraries={lib}
//       onLoad={() => console.log("Google Maps loaded successfully.")}
//     >
//       <div style={style.map}>
//         <GoogleMap
//           mapContainerStyle={containerStyle}
//           center={position}
//           zoom={1}
//         >
//           <StreetViewPanorama
//             id="street-view"
//             containerStyle={containerStyle}
//             options={gestOption()}
//             position={position}
//             visible={true}
//           />
//         </GoogleMap>
//       </div>
//     </LoadScript>
//   );
// }

import {
  GoogleMap,
  StreetViewPanorama,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useCallback, useMemo, useState } from "react";

const containerStyle = {
  width: "100%",
  height: "90vh",
};

// const center = {
//   lat: -3.745,
//   lng: -38.523,
// };

function MapStreet(props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.API_MAP,
  });

  const center = useMemo(
    () => ({ lat: props.position.lat, lng: props.position.lng }),
    [props.position]
  );

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

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded && props.position ? (
    <>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        <StreetViewPanorama
          id="street-view"
          containerStyle={containerStyle}
          options={gestOption()}
          position={center}
          visible={true}
        />
      </GoogleMap>
    </>
  ) : (
    <></>
  );
}
export default MapStreet;
