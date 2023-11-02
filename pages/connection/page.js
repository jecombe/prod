import React from "react";

const MetaMaskButton = ({ onConnect }) => {
  return (
    <button onClick={onConnect} className="metamask-button">
      Connect with MetaMask
    </button>
  );
};

export default MetaMaskButton;
