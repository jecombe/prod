// reducers/socketReducer.js
const initialState = {
  socket: null, // L'instance Socket.io
  messages: [], // Les messages reçus
};

const socketReducer = (state = initialState, action) => {
  switch (action.type) {
    case "RECEIVE_SOCKET_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    default:
      return state;
  }
};

export default socketReducer;
