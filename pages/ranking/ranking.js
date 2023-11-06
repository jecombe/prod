// pages/ranking.js
"use client";
import { useEffect, useState } from "react";
import Web3 from "web3";
import abi from "../../utils/abi/abi";
import { ethers } from "ethers";
import initMetaMask from "../../utils/metamask";
import style from "./ranking.module.css";
import Link from "next/link";

const Ranking = () => {
  const [rankings, setRankings] = useState([]);

  const loadOwners = async () => {
    // Initialisez Web3 (assurez-vous de déployer le contrat GeoNFT sur un réseau Ethereum)

    // Remplacez par l'adresse du contrat GeoNFT sur le réseau Ethereum
    const signer = await initMetaMask();
    const contract = new ethers.Contract(
      process.env.CONTRACT, // Adresse de votre contrat
      abi, // ABI de votre contrat
      signer
    );

    const nfts = await contract.getNFTOwnersAndTokenIds();
    const owners = nfts[0];
    const tokenIds = nfts[1];

    // Créez un tableau de paires address/tokenId
    const nftData = owners.map((owner, index) => {
      return {
        address: owner,
        tokenId: tokenIds[index].toNumber(), // Convertissez le tokenId en nombre
      };
    });

    // Regroupez les Token IDs par adresse
    const groupedRankings = nftData.reduce((acc, item) => {
      if (!acc[item.address]) {
        acc[item.address] = [];
      }
      acc[item.address].push(item.tokenId);
      return acc;
    }, {});

    const filteredRankings = Object.entries(rankings).filter(
      ([address, tokenIds]) => {
        // Replace 'YOUR_ADDRESS_TO_EXCLUDE' with the address you want to exclude
        return address !== process.env.OWNER;
      }
    );
    setRankings(filteredRankings);
  };

  useEffect(() => {
    loadOwners();

    // Initialisez Web3 (assurez-vous de déployer le contrat GeoNFT sur un réseau Ethereum)
    const web3 = new Web3(process.env.PROVIDER); // Remplacez par votre propre URL Infura

    // Remplacez par l'adresse du contrat GeoNFT sur le réseau Ethereum
    const contractAddress = process.env.CONTRACT;

    // Créez une instance du contrat GeoNFT
    const geoNFTContract = new web3.eth.Contract(abi, contractAddress);

    // Créez un événement listener pour NFTTransfer

    // Écoutez l'événement
    geoNFTContract.on("NFTTransfer", async (userAddress, result) => {
      console.log(result);
      const user = result.returnValues.from; // Adresse de l'expéditeur
      const tokenId = result.returnValues.tokenId; // Token ID transféré
      const updatedRankings = [...rankings, { user, tokenId }];
      setRankings(updatedRankings);
    });

    // Listen for the NFTReset event
    geoNFTContract.events.NFTReset({ fromBlock: 0 }).on("data", (event) => {
      // Update rankings to remove the NFT with the specified tokenId
      const tokenId = event.returnValues.tokenId;
      setRankings((rankings) =>
        rankings.filter((nft) => nft.tokenId !== tokenId)
      );
    });

    // Listen for the NFTTransferred event
    geoNFTContract.events
      .NFTTransferred({ fromBlock: 0 })
      .on("data", (event) => {
        // Update rankings to reflect the NFT transfer
        const tokenId = event.returnValues.tokenId;
        const from = event.returnValues.from;
        const to = event.returnValues.to;

        setRankings((rankings) => {
          const updatedRankings = rankings.map((nft) => {
            if (nft.tokenId === tokenId) {
              return { ...nft, address: to }; // Update the owner to 'to'
            }
            return nft;
          });

          return updatedRankings;
        });
      });

    // Gérez les erreurs
    geoNFTContract.on("error", console.error);

    return () => {
      // Arrêtez l'écoute de l'événement lorsque le composant est démonté
      geoNFTContract.removeAllListeners("data");
      geoNFTContract.removeAllListeners("error");
    };
  }, [loadOwners, rankings]); // Écoutez les changements du tableau des classements

  return (
    <div className={style.rankingContainer}>
      <div className={style.headerContainer}>
        <Link href="/">
          <button className={`${style.backHome} center-left-button`}>
            Back Home
          </button>
        </Link>
      </div>
      <h1>Ranking owner NFTs</h1>
      {Object.entries(rankings).map(([address, tokenIds], index) => (
        <div key={index}>
          <table className={style.rankingTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Token ID</th>
              </tr>
            </thead>
            <tbody>
              {tokenIds.map((tokenId, i) => (
                <tr key={i}>
                  <td>{address}</td>
                  <td>{tokenId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Ranking;
