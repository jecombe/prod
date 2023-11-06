require("dotenv").config;

module.exports = {
  reactStrictMode: true,
  env: {
    OWNER: process.env.OWNER,
    API_MAP: process.env.API_MAP,
    SERVER: process.env.SERVER,
    CONTRACT: process.env.CONTRACT,
    ROUTE: process.env.ROUTE,
    PROVIDER: process.env.PROVIDER,
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
