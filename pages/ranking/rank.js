import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./ranking.module.css";

const Ranking = () => {
  const [holders, setHolders] = useState([]);
  const [numberNft, setNumberNft] = useState([]);
  const [numberNftStake, setNumberNftStake] = useState(0);
  const [numberNftReset, setNumberNftReset] = useState(0);

  const [fees, setFees] = useState(0); // Added state for fees
  const [numberNftStakeMinimum, setNumberNftStakeMinimum] = useState(0);

  useEffect(() => {
    // Function to fetch holders and their tokenIds from the backend
    async function fetchTotalNftFromBackend() {
      try {
        const response = await fetch(
          `${process.env.SERVER}${process.env.ROUTE_GET_NFT}`
        );
        if (!response.ok) {
          throw new Error("Error fetching total NFTs");
        }
        const data = await response.json();
        setNumberNft(data);
      } catch (error) {
        console.error("Error fetching total NFTs: ", error);
      }
    }
    async function fetchTotalNftResetFromBackend() {
      try {
        const response = await fetch(
          `${process.env.SERVER}${process.env.ROUTE_GET_NFT_RESET}`
        );
        if (!response.ok) {
          throw new Error("Error fetching total reset NFTs");
        }
        const data = await response.json();
        setNumberNftReset(data);
      } catch (error) {
        console.error("Error fetching total reset NFTs: ", error);
      }
    }

    async function fetchMinimumStakeFromBackend() {
      try {
        const response = await fetch(
          `${process.env.SERVER}api/get-minimum-nft-stake`
        );
        if (!response.ok) {
          throw new Error("Error fetching minimum stake");
        }
        const data = await response.json();
        setNumberNftStakeMinimum(data);
      } catch (error) {
        console.error("Error fetching minimum stake: ", error);
      }
    }

    async function fetchFeesFromBackend() {
      try {
        const response = await fetch(`${process.env.SERVER}api/get-fees`);
        if (!response.ok) {
          throw new Error("Error fetching fees");
        }
        const data = await response.json();
        setFees(data);
      } catch (error) {
        console.error("Error fetching fees: ", error);
      }
    }

    async function fetchTotalNftStakeFromBackend() {
      try {
        const response = await fetch(
          `${process.env.SERVER}${process.env.ROUTE_GET_NFT_STAKE}`
        );
        if (!response.ok) {
          throw new Error("Error fetching total staked NFTs");
        }
        const data = await response.json();
        setNumberNftStake(data);
      } catch (error) {
        console.error("Error fetching holders: ", error);
      }
    }

    async function fetchHoldersFromBackend() {
      try {
        const response = await fetch(
          `${process.env.SERVER}${process.env.ROUTE_GET_HOLDER_ID}`
        );

        if (!response.ok) {
          throw new Error("Error fetching holders and tokenIds");
        }
        const data = await response.json();
        console.log("YOOOOOOOOOOOOOOOOOOo", data);

        setHolders(data);
      } catch (error) {
        console.error("Error fetching holders and tokenIds: ", error);
      }
    }

    fetchHoldersFromBackend();
    // Call the function to fetch holders from the backend
    fetchTotalNftFromBackend();
    fetchTotalNftStakeFromBackend();
    fetchMinimumStakeFromBackend();
    fetchFeesFromBackend();
    fetchTotalNftResetFromBackend();
  }, []);

  return (
    <div>
      <div className={styles.headerContainer}>
        <Link href="/">
          <button className={`${styles.backHome} center-left-button`}>
            Back Home
          </button>
        </Link>
      </div>
      <div className={styles.containerInfos}>
        <h1>Stats</h1>
        <h2>Owners of GeoSpace NFTs</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.tr}>
                <th className={styles.th}>Holder</th>
                <th className={styles.th}>Owned Ids</th>
                <th className={styles.th}>Staked Ids</th>
                <th className={styles.th}>Ids back in game</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {Object.keys(holders).map((address, index) => (
                <tr className={styles.tr} key={index}>
                  <td data-label="address" className={styles.td}>
                    {address === process.env.CONTRACT.toLowerCase()
                      ? "NFTGuessr smart contract"
                      : address}
                  </td>
                  <td data-label="nfts" className={styles.td}>
                    <div className={styles.fieldContainer}>
                      {holders[address].nfts.length > 0
                        ? holders[address].nfts.join(", ")
                        : "0"}
                    </div>
                  </td>
                  <td data-label="nftsStaked" className={styles.td}>
                    <div className={styles.fieldContainer}>
                      {holders[address].nftsStaked.length > 0
                        ? holders[address].nftsStaked.join(", ")
                        : "0"}
                    </div>
                  </td>
                  <td data-label="nftsReset" className={styles.td}>
                    <div className={styles.fieldContainer}>
                      {holders[address].nftsReset.length > 0
                        ? holders[address].nftsReset.join(", ")
                        : "0"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Game Statistics</h2>
        <div className={styles.statsContainer}>
          <p>NFTGuessr smart contract: {process.env.CONTRACT}</p>
          <p>fees NFTGuessr: {fees} ZAMA</p>

          <p>Total Number of NFTs: {numberNft}</p>
          <p>Total Number of NFTs staking: {numberNftStake}</p>
          <p>Total Number of NFTs back in game: {numberNftReset}</p>
          <p>Minimum stake access: {numberNftStakeMinimum}</p>
        </div>
      </div>
    </div>
  );
};

export default Ranking;
