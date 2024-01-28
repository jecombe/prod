require("dotenv").config;

module.exports = {
  reactStrictMode: false,
  env: {
    OWNER: process.env.OWNER,
    API_MAP: process.env.API_MAP,
    SERVER: process.env.SERVER,
    CONTRACT: process.env.CONTRACT,
    ROUTE: process.env.ROUTE,
    PROVIDER: process.env.PROVIDER,
    ROUTE_GET_NFT: process.env.ROUTE_GET_NFT,
    ROUTE_GET_HOLDER_ID: process.env.ROUTE_GET_HOLDER_ID,
    ROUTE_GET_FEES_CREATION: process.env.ROUTE_GET_FEES_CREATION,
    ROUTE_GET_REWARD_WINNER: process.env.ROUTE_GET_REWARD_WINNER,
    ROUTE_GET_REWARD_USERS: process.env.ROUTE_GET_REWARD_USERS,
    KEY: process.env.KEY,
    ROUTE_GET_NFT_RESET: process.env.ROUTE_GET_NFT_RESET,
    ROUTE_NFT_RESET: process.env.ROUTE_NFT_RESET,
    ROUTE_NFT_RESET: process.env.ROUTE_NFT_RESET,
    ROUTE_NFT_GET_FEES: process.env.ROUTE_NFT_GET_FEES,
    ROUTE_NFT_MINI_STAKE: process.env.ROUTE_NFT_MINI_STAKE,
    ROUTE_PROFIL_NEW_GPS: process.env.ROUTE_PROFIL_NEW_GPS,
    ROUTE_PROFIL_CHECK_NEW_GPS: process.env.ROUTE_PROFIL_CHECK_NEW_GPS,
    ROUTE_REMOVE_GPS: process.env.ROUTE_REMOVE_GPS,
    CHANNEL_GOVERNANCE: process.env.CHANNEL_GOVERNANCE,
    ROUTE_TELEGRAM: process.env.ROUTE_TELEGRAM,
    API_KEY: process.env.API_KEY,
    TOKEN: process.env.TOKEN,
    AIRDROP: process.env.AIRDROP,
    GAME: process.env.GAME,
  },
  webpack: (config) => {
    // Ajoutez ici la configuration de résolution pour 'tfhe_bg.wasm'
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "tfhe_bg.wasm": require.resolve("tfhe/tfhe_bg.wasm"),
    };

    return config;
  },
};
