// metamaskActions.js
export const setAddress = (address) => {
  return {
    type: "SET_ADDRESS",
    payload: address,
  };
};

export const setBalance = (balance) => {
  return {
    type: "SET_BALANCE",
    payload: balance,
  };
};
