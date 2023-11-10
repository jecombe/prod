// actions/socketActions.js
export const receiveSocketMessage = (message) => {
  return {
    type: "RECEIVE_SOCKET_MESSAGE",
    payload: message,
  };
};
