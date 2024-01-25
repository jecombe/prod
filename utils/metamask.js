import { ethers } from "ethers";

async function initMetaMask() {
  // Vérifiez si MetaMask est disponible dans la fenêtre
  if (window.ethereum) {
    try {
      console.log("OOOOOOOOOOOK");
      // Demandez à l'utilisateur l'autorisation d'accéder à son compte Ethereum
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Initialisez un fournisseur Web3Provider à partir de MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Obtenez un objet Signer pour signer les transactions
      const signer = provider.getSigner();
      console.log("OOOOOOOOOOOK");

      return signer;
    } catch (error) {
      console.error("Erreur lors de l'initialisation de MetaMask :", error);
      throw error;
    }
  } else {
    // alert("please install metamask");
    throw new Error("MetaMask n'a pas été détecté dans la fenêtre.");
  }
}

export default initMetaMask;
