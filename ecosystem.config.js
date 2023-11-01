module.exports = {
  apps: [
    {
      script: "pages/index.js",
      watch: ".",
    },
    {
      script: "./service-worker/",
      watch: ["./service-worker"],
    },
  ],

  deploy: {
    production: {
      user: "ubuntu",
      host: "91.134.90.80",
      ref: "main",
      repo: "git@github.com:jecombe/prod.git",
      path: "/home/ubuntu",
      "pre-deploy-local": "", // Commande pré-déploiement locale
      "post-deploy":
        "source ~/.nvm/nvm.sh && npm install && npm run build && pm2 reload ecosystem.config.js --env production", // Commandes post-déploiement
      "pre-setup": "", // Commande pré-config du serveur
      ssh_options: "PasswordAuthentication=yes", // Option pour autoriser l'authentification par mot de passe
      key: "~/.ssh/id_rsa", // Chemin vers votre clé RSA privée
      ssh_port: 22, // Port SSH
    },
  },
};
