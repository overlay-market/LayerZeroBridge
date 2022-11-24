require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/429eb57532b54560b1d4cc4201724bf0`,
      accounts: [
        process.env.MAINNET_PRIVATE_KEY,
      ],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/429eb57532b54560b1d4cc4201724bf0`,
      accounts: [
        process.env.TESTNET_PRIVATE_KEY,
      ],
    },
    arbitrum_testnet: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      network_id: 421613,
      accounts: [
        process.env.TESTNET_PRIVATE_KEY,
      ],
    },
    arbitrum_mainnet: {
      url: "https://arb1.arbitrum.io/rpc",
      network_id: 42161,
      accounts: [
        process.env.MAINNET_PRIVATE_KEY,
      ],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

