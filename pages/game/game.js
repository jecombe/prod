"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import style from "./map.module.css";
import { ethers } from "ethers";
import abi from "../../utils/abi/abi";
import abiGame from "../../utils/abi/game";

import { getFhevmInstance } from "../../utils/fhevmInstance";
import initMetaMask from "../../utils/metamask";
import Link from "next/link";
import CryptoJS from "crypto-js";
import Loading from "../loading/loading";
import ReactPlayer from "react-player"; // Importez ReactPlayer
import Image from "next/image";
import { css } from "@emotion/react";
import { PropagateLoader } from "react-spinners";
import ErrorMetamask from "../errorPage/metamask";
import MapStreet from "../../components/MapStreet";
import dynamic from "next/dynamic";
const lib = ["places"];

const OpenStreetMap = dynamic(() => import("../../components/Map2"), {
  ssr: false,
});

const OpenStreetMapWrapper = ({ handleMapClick }) => {
  return <OpenStreetMap handleMapClick={handleMapClick} />;
};

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

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingGps, setIsLoadingDataGps] = useState(false);
  const isMountedRef = useRef(true);
  const [errorNft, setErrorNft] = useState(false);
  const [isTransactionSuccessful, setIsTransactionSuccessful] = useState(false);
  const [isTransactionFailed, setIsTransactionFailed] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");
  const [fhevm, setFhevm] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractGa, setContractGame] = useState(null);

  const [signer, setSigner] = useState(null);
  const [nft, setNft] = useState({});
  const [accountAddress, setAccountAddress] = useState("0x");
  const [accountBalance, setAccountBalance] = useState(0);
  const [balanceSpc, setBalanceSPC] = useState(0);
  const [isOver, setIsOver] = useState(true);

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

  const handleMapClick = ({ lat, lng }) => {
    const pos = { lat, lng };
    setPositionMiniMap(pos);
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

  useEffect(() => {
    checkNetwork();
    // initializeMetaMask();
  }, []);

  const manageData = async () => {
    try {
      if (signer && contract && contractGa) {
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
      if (signer && contract && contractGa) {
        await fetchGpsData(isMounted);
        // Perform data-related logic here
      }
    } catch (error) {
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
  }, [signer, contract, contractGa]); // Add dependency on 'signer' and 'contract'

  useEffect(() => {
    let isMounted = true;
    if (isMounted && signer && contract && contractGa) {
      setIsLoadingDataGps(true);

      manageDataGps(isMounted);
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [signer, contract, contractGa]); // Add dependency on 'signer' and 'contract'

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
    try {
      const sign = await initMetaMask();
      console.log("LLLLLLLLLLLLLl");

      const fhevmInstance = await getFhevmInstance();
      console.log("ggggggggggggggg");
      const contractGame = new ethers.Contract(process.env.CONTRACT, abi, sign);
      const contractG = new ethers.Contract(process.env.GAME, abiGame, sign);

      return { sign, fhevmInstance, contractGame, contractG };
    } catch (error) {
      console.log(error);
    }
  };
  const getAllOwnedNfts = (ownedNFTsU, resetNFTU, createdNFTs) => {
    const assambly = [];
    if (ownedNFTsU.length > 0) {
      assambly.push(ownedNFTsU);
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
    try {
      console.log("OKOKOKOK");
      const { sign, fhevmInstance, contractGame, contractG } =
        await getSignerContract();

      setFhevm(fhevmInstance);
      setSigner(sign);
      setContract(contractGame);
      setContractGame(contractG);

      setIsLoadingData(true);
    } catch (error) {
      console.log(error);
    }
  };

  // Fonction fetchData optimisée
  const fetchData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const userAddress = await signer.getAddress();

      // Créez un tableau de promesses
      const promises = [
        contractGa.getOwnedNFTs(userAddress),
        contractGa.getResetNFTsAndFeesByOwner(userAddress),
        contractGa.getNftCreationAndFeesByUser(userAddress),
        contractGa.getWinIds(userAddress),
        provider.getBalance(userAddress),
        contract.getBalanceCoinSpace(userAddress),
      ];

      const [
        nftsOwned,
        nftsRAndFees,
        nftsCreationFees,
        nftsWin,
        balanceWei,
        balanceWeiCoinSpace,
      ] = await Promise.all(promises);
      const balanceEther = ethers.utils.formatUnits(balanceWei, "ether");

      const balanceCoinSpace = ethers.utils.formatUnits(
        balanceWeiCoinSpace,
        "ether"
      );

      const ownedNFTs = nftsOwned.map((tokenId) => tokenId.toNumber());

      const resetNFTs = nftsRAndFees[0].map((tokenId) => tokenId.toNumber());
      // const feesNft = nftsRAndFees[1].map((tokenId) => tokenId.toString());
      const creationNFTs = nftsCreationFees[0].map((tokenId) =>
        tokenId.toNumber()
      );
      const winsNfts = nftsWin.map((tokenId) => tokenId.toNumber());
      // const creationNFTsFees = nftsCreationFees[1].map((tokenId) =>
      //   tokenId.toString()
      // );

      // const nftsCreaFee = creationNFTs.map((id, index) => ({
      //   id,
      //   fee: Math.round(
      //     ethers.utils.formatUnits(creationNFTsFees[index], "ether")
      //   ),
      // }));
      //setCreatedNFTs(creationNFTs);

      // const feesNftMap = {};
      // feesNft.forEach((fee, index) => {
      //   const valueEth = Math.round(ethers.utils.formatUnits(fee, "ether"));

      //   feesNftMap[resetNFTs[index]] = valueEth;
      // });

      // setFeesNftMap(feesNftMap);

      const filteredOwnedNFTs = ownedNFTs.filter(
        (tokenId) => !resetNFTs.includes(tokenId)
      );

      const allFiltrage = winsNfts.filter(
        (tokenId) => !filteredOwnedNFTs.includes(tokenId)
      );
      // setOwnedNFTs(filteredOwnedNFTs);
      setAccountBalance(balanceEther);
      setBalanceSPC(balanceCoinSpace);
      // setStakedNFTs(stakedNFTs);
      // setResetNFT(resetNFTs);
      // setCreationNFT(nftsCreaFee);
      const assamblage = getAllOwnedNfts(allFiltrage, resetNFTs, creationNFTs);
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
          /* {
            chainId: "0x1f49",
            chainName: "Zama Network",
            nativeCurrency: {
              name: "ZAMA",
              symbol: "ZAMA",
              decimals: 18,
            },
            rpcUrls: ["https://devnet.zama.ai"],
            blockExplorerUrls: ["https://main.explorer.zama.ai"],
          },*/
          {
            chainId: "0x2382",
            chainName: "Inco Network",
            nativeCurrency: {
              name: "INCO",
              symbol: "INCO",
              decimals: 18,
            },
            rpcUrls: ["https://testnet.inco.org"],
            blockExplorerUrls: ["https://explorer.testnet.inco.org"],
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
      contract.on(
        "GpsCheckResult",
        async (userAddress, owner, result, tokenId) => {
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

              setTimeout(() => {
                setIsTransactionSuccessful(false);
                setIsTransactionFailed(false);
              }, 5000);
            }
          }
        }
      );
    } catch (error) {
      console.error("Error initializing contract:", error);
      setIsLoading(false);
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
        console.log("°°°°°°°°°°", networkId);
        //  0x2382;
        if (networkId !== "0x2382") {
          const userResponse = window.confirm(
            "Please switch to Inco network testnet to use this application. Do you want to switch now?"
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
      const value = 0.2 + nft.tax;
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

  // const opt = () => {
  //   return {
  //     disableDefaultUI: true,
  //     zoomControl: true,
  //     scrollwheel: true, // Active la roulette de la souris pour le zoom
  //   };
  // };

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

  const isAutorize = async (address) => {
    try {
      // const r = await contract.dailyCount(address);
      // const readable = r.toString();

      // if (Number(readable) >= 10) {
      //   setIsOver(true);
      //   throw "is over";
      // } else setIsOver(false);
      alert(`Attention, you have the right to 10 locations per day.`);

      const gasEstimation = await contract.estimateGas.IsAuthorize({
        from: address,
      });
      const gasLimit = gasEstimation.mul(120).div(100);
      console.log(
        `Gas estimation estimation ${gasEstimation} Gwei\nGas estimation with error marge: ${gasLimit}`
      );

      await contract.IsAuthorize({
        from: address,
        gasLimit,
      });

      const after = await contract.callCount(address);
      const readableAfter = after.toString();

      alert(`You are currently at: ${Number(readableAfter) + 1} / 10`);
      setIsOver(false);
    } catch (error) {
      console.error("isAutorize ", error);
      setIsOver(true);
    }
  };

  async function fetchGpsData() {
    try {
      setIsLoadingDataGps(true);

      //    const addr = await signer.getAddress();

      // await isAutorize(addr);
      const response = await fetch(
        `${process.env.SERVER}${process.env.ROUTE}?ids=${assamblage}`
      );
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
      setIsLoadingDataGps(false);
    } catch (error) {
      console.error("::::::::::::::::::::::::::", error);
      setErrorNft(true);
      setPosition({
        lat: 0,
        lng: 0,
      });
      setNft({
        tokenId: 0,
        tax: 0,
      });
      alert(
        "Either no NFT is found, or an error occurs maybe you have reach the rate limit (10 per day) ! Contact support discord / telegram"
      );
      setIsLoadingDataGps(false);

      throw `fetchGps ${error}`;
    }
  }

  if (isLoadingData || isLoadingGps) {
    return <Loading />;
  }

  if (!signer && !isLoading) {
    console.log(signer, isLoading);
    return (
      <ErrorMetamask message="Please connect to MetaMask and go to zama devnet" />
    );
  }

  // if (isOver)
  //   return (
  //     <div className={style.headerContainer}>
  //       <Link href="/" legacyBehavior>
  //         <button className={`${style.newCoordinate} center-left-button`}>
  //           Back Home
  //         </button>
  //       </Link>
  //       <div>
  //         <p>You are allowed to make 10 location requests per day.</p>
  //       </div>
  //     </div>
  //   );
  // if (isLoading) return <Loading />;
  //  return isLoaded ? (
  //     <GoogleMap
  //       mapContainerStyle={containerStyle}
  //       center={center}
  //       zoom={10}
  //       onLoad={onLoad}
  //       onUnmount={onUnmount}
  //     >
  //       <StreetViewPanorama
  //         id="street-view"
  //         containerStyle={containerStyle}
  //         position={center}
  //         visible={true}
  //       />
  //     </GoogleMap>
  //   ) : (
  //     <></>
  //   );

  if (errorNft) {
    return (
      <ErrorMetamask
        message="Maybe you have reach the rate limit (10 per day) or the liquidity of
            nft is insufficient"
      />
    );
  }
  return (
    <div>
      <ReactPlayer
        url="/summer.mp3"
        playing={isPlay}
        loop={true}
        volume={0.1}
        width="0px"
        height="0px"
      />

      <div className={style.headerContainer}>
        <Link href="/" legacyBehavior>
          <button className={`${style.newCoordinate} center-left-button`}>
            Back Home
          </button>
        </Link>
        <MuteButton onClick={() => setIsPlay(!isPlay)} />

        <div className={style.accountInfo}>
          <p>{accountAddress}</p>
          <p>{accountBalance} INCO</p>
          <p>{balanceSpc} SpaceCoin</p>
        </div>

        <div className={style.infoNft}>
          <p>GeoSpace: {nft.tokenId}</p>
          <p>Fees: {nft.tax + 0.2} INCO</p>
          {assamblage.includes(nft.tokenId) && (
            <p style={{ color: "red" }}>You cannot have it !</p>
          )}
        </div>
        {!isLoadingGps ? (
          <div>
            <button
              onClick={fetchGpsData}
              className={`${style.newCoordinate} center-left-button`}
            >
              New coordinates
            </button>
          </div>
        ) : (
          ""
        )}
      </div>
      {showWinMessage && (
        <div className={style.overlay}>
          <div className={style.winMessage}>
            You Win Geospace {nft.tokenId}! and 1 Space coin, go to your profil
            !
          </div>
        </div>
      )}
      <div style={style.map}>
        <MapStreet position={position} />

        <div className={style.miniMapContainer}>
          <OpenStreetMapWrapper handleMapClick={handleMapClick} />

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
  );
}
