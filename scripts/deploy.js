// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const Endpoint = "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675";

  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy("DEMO", "D1", "0");
  await token.deployed();

  const LzApp = await hre.ethers.getContractFactory("LzApp");
  const lzApp = await LzApp.deploy(Endpoint, token.address);

  await lzApp.deployed();

  console.log(`Token: ${token.address} lzApp: ${lzApp.address}`);
}
// npx hardhat run --network mainnet scripts/deploy.js
// npx hardhat verify --network mainnet 0x76affB7e75D59b7D816C19a5E5ad6F75A66eBE54 0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675 0xe647107D2891a97A485f56FB404f1229c8251B3F
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
