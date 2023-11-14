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
          `${process.env.SERVER}${process.env.ROUTE_NFT_MINI_STAKE}`
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
        const response = await fetch(
          `${process.env.SERVER}${process.env.ROUTE_NFT_GET_FEES}`
        );
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
                <th className={styles.th}>GeoSpace Owned</th>
                <th className={styles.th}>GeoSpace Staked</th>
                <th className={styles.th}>GeoSpace Back in game</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {Object.keys(holders).map((address, index) => (
                <tr className={styles.tr} key={index}>
                  <td data-label="Holder" className={styles.td}>
                    <p>
                      {address === process.env.CONTRACT.toLowerCase()
                        ? "NFTGuessr smart contract"
                        : address}
                    </p>
                  </td>
                  <td data-label="GeoSpace Owned" className={styles.td}>
                    <div className={styles.fieldContainer}>
                      <p>
                        {holders[address].nfts.length > 0
                          ? holders[address].nfts.join(", ")
                          : "0"}
                      </p>
                    </div>
                  </td>
                  <td data-label="GeoSpace Staked" className={styles.td}>
                    <div className={styles.fieldContainer}>
                      <p>
                        {holders[address].nftsStaked.length > 0
                          ? holders[address].nftsStaked.join(", ")
                          : "0"}
                      </p>
                    </div>
                  </td>
                  <td data-label="GeoSpace Back in game" className={styles.td}>
                    <div className={styles.fieldContainer}>
                      <p>
                        {holders[address].nftsReset.length > 0
                          ? holders[address].nftsReset.join(", ")
                          : "0"}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Game Statistics</h2>
        <div className={styles.statsContainer}>
          <p className={styles.contract}>
            NFTGuessr smart contract:{" "}
            <span className={styles.dynamicValue}>{process.env.CONTRACT}</span>
          </p>
          <p className={styles.fees}>
            fees NFTGuessr:{" "}
            <span className={styles.dynamicValue}>{fees} ZAMA</span>
          </p>
          <p className={styles.totalNft}>
            Total Number of NFTs:{" "}
            <span className={styles.dynamicValue}>{numberNft}</span>
          </p>
          <p className={styles.totalStake}>
            Total Number of NFTs staking:{" "}
            <span className={styles.dynamicValue}>{numberNftStake}</span>
          </p>
          <p className={styles.totalReset}>
            Total Number of NFTs back in game:{" "}
            <span className={styles.dynamicValue}>{numberNftReset}</span>
          </p>
          <p className={styles.minimumStake}>
            Minimum stake access:{" "}
            <span className={styles.dynamicValue}>{numberNftStakeMinimum}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Ranking;
