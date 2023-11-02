// components/Navbar.js

"use client";
import { useState, useEffect } from "react";
import styles from "./navbar.module.css";
import Web3 from "web3";
import initMetaMask from "../../metamask";
import { createFhevmInstance, getInstance, init } from "../../fhevm";
const Navbar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(0);

  // Fonction pour mettre à jour la balance en fonction du compte sélectionné dans MetaMask
  const updateBalance = async (selectedAddress) => {
    if (window.ethereum && selectedAddress) {
      try {
        const balanceHex = await window.ethereum.request({
          method: "eth_getBalance",
          params: [selectedAddress],
        });

        const weiBalance = parseInt(balanceHex, 16);
        const etherBalance = weiBalance / 1e18;
        setBalance(etherBalance);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la balance :", error);
      }
    }
  };

  useEffect(() => {
    initMetaMask()
      .then(async (signer) => {
        await init();
        await createFhevmInstance();
        console.log(getInstance());
        setIsConnected(true);

        // Écoutez les changements de compte dans MetaMask
        window.ethereum.on("accountsChanged", (accounts) => {
          // Mettez à jour la balance lorsque l'utilisateur change de compte
          if (accounts.length > 0) {
            updateBalance(accounts[0]);
          } else {
            setBalance(0); // Aucun compte sélectionné
          }
        });

        // Mettez à jour la balance initiale
        if (signer.provider) {
          updateBalance(signer.provider.provider.selectedAddress);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'initialisation de MetaMask:", error);
      });
  }, []);

  const connectOrDisconnect = async () => {
    if (window.ethereum) {
      if (isConnected) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setIsConnected(false);
        setBalance(0);
      } else {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setIsConnected(true);
        updateBalance(window.ethereum.selectedAddress);
      }
    }
  };

  return (
    <nav className={styles.navbar}>
      <button onClick={connectOrDisconnect}>
        {isConnected ? "Se déconnecter" : "Se connecter à MetaMask"}
      </button>
      {isConnected && <span>Balance : {balance} ETH</span>}
    </nav>
  );
};

export default Navbar;
