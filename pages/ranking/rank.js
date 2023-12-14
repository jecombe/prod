import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./ranking.module.css";
import Loading from "../loading/loading";

const Ranking = () => {
  const [holders, setHolders] = useState([]);
  const [numberNft, setNumberNft] = useState([]);
  const [feesCreation, setFeesCreation] = useState(0);
  const [rewardUser, setRewardUser] = useState(0);
  const [rewardUsers, setRewardUsers] = useState(0);

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
            `${process.env.SERVER}${process.env.ROUTE_GET_FEES_CREATION}`,
            setFeesCreation,
            "fees creation"
          ),
          fetchData(
            `${process.env.SERVER}${process.env.ROUTE_GET_REWARD_WINNER}`,
            setRewardUser,
            "reward winner"
          ),
          fetchData(
            `${process.env.SERVER}${process.env.ROUTE_GET_REWARD_USERS}`,
            setRewardUsers,
            "reward staker"
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
        <div>
          <table>
            <thead>
              <tr>
                <th>Holder</th>
                <th>GeoSpace Owned</th>
                <th>GeoSpace Staked</th>
                <th>GeoSpace Back in game</th>
                <th>GeoSpace creation</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(holders).map((address, index) => (
                <tr key={index}>
                  <td data-label="Hoooolder">
                    <p>
                      {address.toLowerCase() ===
                      process.env.CONTRACT.toLowerCase()
                        ? "NFTGuessr smart contract"
                        : `${address.substring(0, 10)}...`}
                    </p>
                  </td>
                  <td data-label="GeoSpace Owned">
                    <p>
                      {holders[address].nfts.length > 0
                        ? holders[address].nfts.join(", ")
                        : []}
                    </p>
                  </td>
                  <td data-label="GeoSpace Staked">
                    <p>
                      {holders[address].nftsStake.length > 0
                        ? holders[address].nftsStake.join(", ")
                        : []}
                    </p>
                  </td>
                  <td data-label="GeoSpace Back in game">
                    <p>{createList(holders[address]?.nftsReset || [])}</p>
                  </td>
                  <td data-label="GeoSpace Creations">
                    <p>{createList(holders[address]?.nftsCreation || [])}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Game Statistics</h2>
        <div className={styles.contractInfo}>
          <h3>NFTGuessr contract:</h3>
          <p>{process.env.CONTRACT}</p>
        </div>
        <div className={styles.contractInfo}>
          <h3>SpaceCoin contract:</h3>
          <p>{process.env.TOKEN}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fees Guess</th>
              <th>Fees Creation NFTs GeoSpace</th>
              <th>Reward winner</th>
              <th>Reward staker</th>
              <th>Total Number of NFTs</th>
              <th>Minimum stake GeoSpace to access creation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-label="Fees Guess">
                <p>{fees} ZAMA</p>
              </td>
              <td data-label="Fees Creation NFTs GeoSpace<">
                <p>{feesCreation} SPC</p>
              </td>
              <td data-label="Reward winner">
                <p>{rewardUser} SPC</p>
              </td>
              <td data-label="Reward staker">
                <p>{rewardUsers} SPC</p>
              </td>
              <td data-label="Total number of NFTs">
                <p>{numberNft}</p>
              </td>
              <td data-label="Minimum stake GeoSpace to access creation">
                <p>{numberNftStakeMinimum}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ranking;
