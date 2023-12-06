import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./ranking.module.css";
import Loading from "../loading/loading";

const Ranking = () => {
  const [holders, setHolders] = useState([]);
  const [numberNft, setNumberNft] = useState([]);
  const [numberNftStake, setNumberNftStake] = useState(0);
  const [fees, setFees] = useState(0);
  const [numberNftStakeMinimum, setNumberNftStakeMinimum] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // New state for loading

  const fetchData = async (url, setter, errorMessage) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching ${errorMessage}`);
      }
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.error(`Error fetching ${errorMessage}: `, error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchData(
            `${process.env.SERVER}${process.env.ROUTE_GET_NFT}`,
            setNumberNft,
            "total NFTs"
          ),
          fetchData(
            `${process.env.SERVER}${process.env.ROUTE_GET_NFT_STAKE}`,
            setNumberNftStake,
            "total staked NFTs"
          ),
          fetchData(
            `${process.env.SERVER}${process.env.ROUTE_NFT_MINI_STAKE}`,
            setNumberNftStakeMinimum,
            "minimum stake"
          ),
          fetchData(
            `${process.env.SERVER}${process.env.ROUTE_NFT_GET_FEES}`,
            setFees,
            "fees"
          ),
          fetchData(
            `${process.env.SERVER}${process.env.ROUTE_GET_HOLDER_ID}`,
            setHolders,
            "holders and tokenIds"
          ),
        ]);

        setIsLoading(false); // Set loading to false once all data is fetched
      } catch (error) {
        console.error("Error fetching data: ", error);
        setIsLoading(false); // Set loading to false in case of an error
      }
    };
    fetchAllData();
  }, []);

  if (isLoading) return <Loading />;

  const createList = (nftsArray) => {
    return nftsArray.map((id, index) => (
      <li key={index}>{`id: ${id.id}, fees: ${id.fee}`}</li>
    ));
  };

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
                <th className={styles.th}>GeoSpace creation</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {Object.keys(holders).map((address, index) => (
                <tr className={styles.tr} key={index}>
                  <td data-label="Holder">
                    <div className={styles.fieldContainer}>
                      <p>
                        {address.toLowerCase() ===
                        process.env.CONTRACT.toLowerCase()
                          ? "NFTGuessr smart contract"
                          : address}
                      </p>
                    </div>
                  </td>
                  <td data-label="GeoSpace Owned" className={styles.td}>
                    <div className={styles.fieldContainer}>
                      <p>
                        {holders[address].nfts.length > 0
                          ? holders[address].nfts.join(", ")
                          : []}
                      </p>
                    </div>
                  </td>
                  <td data-label="GeoSpace Staked" className={styles.td}>
                    <div className={styles.fieldContainer}>
                      <p>
                        {holders[address].nftsStake.length > 0
                          ? holders[address].nftsStake.join(", ")
                          : []}
                      </p>
                    </div>
                  </td>
                  <td data-label="GeoSpace Back in game" className={styles.td}>
                    <div className={styles.fieldContainer}>
                      <p>{createList(holders[address]?.nftsReset || [])}</p>
                    </div>
                  </td>
                  <td data-label="GeoSpace Creations" className={styles.td}>
                    <div className={styles.fieldContainer}>
                      <p>{createList(holders[address]?.nftsCreation || [])}</p>
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
