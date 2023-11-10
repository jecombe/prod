import React from "react";

const MetamaskHeader = ({ balance, address }) => {
  return (
    <div className="header">
      <div className="header-item">
        <strong>Balance:</strong> {balance} ETH
      </div>
      <div className="header-item">
        <strong>Address:</strong> {address}
      </div>
    </div>
  );
};

export default MetamaskHeader;
