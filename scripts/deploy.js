// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Endpoint = "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675";
  const token = "0xc3fA4890C42066F12d0A1cc44093C1Bf7E5aBB64";

  // const Token = await hre.ethers.getContractFactory("Token");
  // const token = await Token.deploy("DEMO", "D1", "0");
  // await token.deployed();

  const LzApp = await hre.ethers.getContractFactory("LzApp");
  const lzApp = await LzApp.deploy(Endpoint, token);

  await lzApp.deployed();

  console.log(`lzApp: ${lzApp.address}`);
}
// npx hardhat run --network mainnet scripts/deploy.js
// npx hardhat verify --network mainnet 0x41A4C92EF6Bc520357639B5e69C251B8E101b85d 0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675 0xc3fA4890C42066F12d0A1cc44093C1Bf7E5aBB64
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
// 7YNIM4192HFF7NXSK1SWWBIN3ZI2EYAQCK 2JPE8TQQUB3R2KUPHN3QXWID3XBV9ID1D7
