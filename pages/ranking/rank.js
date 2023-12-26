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
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const [chain, setChain] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionSelect = async (option) => {
    // Faites quelque chose avec l'option sélectionnée (Inco Network ou Zama)
    console.log(`Option sélectionnée: ${option}`);
    setChain(option);
    await fetchAllData(option);
  };

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
  const fetchAllData = async (chainOption) => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchData(
          `${process.env.SERVER}${process.env.ROUTE_GET_NFT}?chain=${chainOption}`,
          setNumberNft,
          "total NFTs"
        ),
        fetchData(
          `${process.env.SERVER}${process.env.ROUTE_GET_FEES_CREATION}?chain=${chainOption}`,
          setFeesCreation,
          "fees creation"
        ),
        fetchData(
          `${process.env.SERVER}${process.env.ROUTE_GET_REWARD_WINNER}?chain=${chainOption}`,
          setRewardUser,
          "reward winner"
        ),
        fetchData(
          `${process.env.SERVER}${process.env.ROUTE_GET_REWARD_USERS}?chain=${chainOption}`,
          setRewardUsers,
          "reward staker"
        ),
        fetchData(
          `${process.env.SERVER}${process.env.ROUTE_NFT_MINI_STAKE}?chain=${chainOption}`,
          setNumberNftStakeMinimum,
          "minimum stake"
        ),
        fetchData(
          `${process.env.SERVER}${process.env.ROUTE_NFT_GET_FEES}?chain=${chainOption}`,
          setFees,
          "fees"
        ),
        fetchData(
          `${process.env.SERVER}${process.env.ROUTE_GET_HOLDER_ID}?chain=${chainOption}`,
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

  // useEffect(() => {
  //   //fetchAllData();
  // }, [chain]);

  //if (isLoading) return <Loading />;

  const createList = (nftsArray) => {
    return nftsArray.map((id, index) => (
      <li key={index}>{`id: ${id.id}, fees: ${id.fee}`}</li>
    ));
  };

  const getOptionPrint = (address) => {
    if (chain === "inco") {
      return address.toLowerCase() === process.env.CONTRACT_INCO.toLowerCase()
        ? "NFTGuessr smart contract"
        : `${address.substring(0, 10)}...`;
    } else if (chain === "zama")
      return address.toLowerCase() === process.env.CONTRACT.toLowerCase()
        ? "NFTGuessr smart contract"
        : `${address.substring(0, 10)}...`;
    else if (chain === "fhenix")
      return address.toLowerCase() === process.env.CONTRACT_FHENIX.toLowerCase()
        ? "NFTGuessr smart contract"
        : `${address.substring(0, 10)}...`;
  };

  if (isLoading) return <Loading />;

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
        <div className={styles.dropdownContainer}>
          <button className={`${styles.dropdownButton}`}>
            {!chain ? "Choose Network" : chain}
          </button>
          <div className={styles.dropdownContent}>
            <button onClick={() => handleOptionSelect("inco")}>
              Inco Network
            </button>
            <button onClick={() => handleOptionSelect("zama")}>Zama</button>
            {/* <button onClick={() => handleOptionSelect("fhenix")}>Fhenix</button> */}
          </div>
        </div>
        {chain ? (
          <div>
            <div>
              <h1>Stats</h1>
              <h2>Owners of GeoSpace NFTs</h2>
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
                      <td data-label="Holder">
                        <p>{getOptionPrint(address)}</p>
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
                        <p>
                          {createList(holders[address]?.nftsCreation || [])}
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
              <p>
                {chain === "zama"
                  ? process.env.CONTRACT
                  : process.env.CONTRACT_INCO}
              </p>
            </div>
            <div className={styles.contractInfo}>
              <h3>SpaceCoin contract</h3>
              <p>
                {chain === "zama" ? process.env.TOKEN : process.env.TOKEN_INCO}
              </p>
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
                  <td data-label="Fees Creation NFTs GeoSpace">
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
        ) : (
          <p>Please select network</p>
        )}
      </div>
    </div>
  );
};

export default Ranking;
