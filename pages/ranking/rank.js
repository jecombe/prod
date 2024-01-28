import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./ranking.module.css";
import Loading from "../loading/loading";
import ErrorMetamask from "../errorPage/metamask";

const Ranking = () => {
  const [holders, setHolders] = useState([]);
  const [numberNft, setNumberNft] = useState([]);
  const [dataStat, setDataStats] = useState([]);

  const [feesCreation, setFeesCreation] = useState(0);
  const [rewardUser, setRewardUser] = useState(0);
  const [rewardUsers, setRewardUsers] = useState(0);

  const [fees, setFees] = useState(0);
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
            `${process.env.SERVER}api/get-statGame`,
            setDataStats,
            "total NFTs"
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

  // if (isLoading) return <Loading />;

  const createList = (nftsArray) => {
    return nftsArray.map((id, index) => (
      <li key={index}>{`${id.id} | ${2 + id.feesWin} Zama`}</li>
    ));
  };

  return (
    <div>
      {console.log(dataStat)}
      <div className={styles.headerContainer}>
        <Link href="/" legacyBehavior>
          <button className={`${styles.backHome} center-left-button`}>
            Back Home
          </button>
        </Link>
      </div>
      <div className={styles.containerInfos}>
        <h1>Stats</h1>
        <h2>Owners of GeoSpace NFTs</h2>
        <div>
          <table>
            <thead>
              <tr>
                <th>Holder</th>
                <th>GeoSpace in game</th>
                <th>GeoSpace creation</th>
              </tr>
            </thead>
            <tbody>
              {holders.map((address, index) => (
                <tr key={index}>
                  <td data-label="Holder">
                    <p>
                      {Object.keys(address)[0].toLowerCase() ===
                      process.env.OWNER.toLowerCase()
                        ? "NFTGuessr smart contract"
                        : `${Object.keys(address)[0].substring(0, 10)}...`}
                    </p>
                  </td>
                  <td data-label="GeoSpace in game">
                    <p>
                      {createList(address[Object.keys(address)[0]].tokenReset)}
                    </p>
                  </td>
                  <td data-label="GeoSpace Creations">
                    <p>
                      {address[Object.keys(address)[0]].tokenIdCreated.join(
                        ","
                      )}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Game Statistics</h2>
        <div className={styles.contractInfo}>
          <h3>NFTGuessr contract</h3>
          <p>{process.env.CONTRACT}</p>
        </div>
        <div className={styles.contractInfo}>
          <h3>SpaceCoin contract</h3>
          <p>{process.env.TOKEN}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fees Guess</th>
              <th>Fees Mint GeoSpace</th>
              <th>Reward winner</th>
              <th>Reward creators</th>
              <th>Reward stakers</th>
              <th>Total Number of NFTs</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="Fees Guess">
                <p>{dataStat.feesGuess} ZAMA</p>
              </td>
              <td data-label="Fees Creation NFTs GeoSpace">
                <p>{dataStat.feesMint} SPC</p>
              </td>
              <td data-label="Reward winner">
                <p>{dataStat.rewardWinner} SPC</p>
              </td>
              <td data-label="Reward stakers">
                <p>{dataStat.rewardStakers} ZAMA</p>
              </td>
              <td data-label="Reward creators">
                <p>{dataStat.rewardCreators} SPC</p>
              </td>
              <td data-label="Total number of NFTs">
                <p>{dataStat.totalNft}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ranking;
