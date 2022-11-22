require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/429eb57532b54560b1d4cc4201724bf0`,
      accounts: [
        "0x4d35d875115d8255e79ebfb37d65fe080f7c1f311668524c88f75ade0a747b32",
      ],
    },
    arbitrum_testnet: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      network_id: 421613,
      accounts: [
        "0x4d35d875115d8255e79ebfb37d65fe080f7c1f311668524c88f75ade0a747b32",
      ],
    },
    avalanche_testnet: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      network_id: 43113,
      accounts: [
        "0x4d35d875115d8255e79ebfb37d65fe080f7c1f311668524c88f75ade0a747b32",
      ],
    },
  },
  etherscan: {
    apiKey: "U772ATWP1Z8J3MNMFUXXFPYD213PEVEXAZ",
  },
};
//7YNIM4192HFF7NXSK1SWWBIN3ZI2EYAQCK U772ATWP1Z8J3MNMFUXXFPYD213PEVEXAZ
