const { expect } = require("chai");
const { ethers } = require("hardhat");

let owner,
  lzAppA,
  LzAppB,
  chainIdSrc,
  chainIdDst,
  tokenA,
  tokenB,
  layerZeroEndpointMockSrc,
  layerZeroEndpointMockDst;

describe("bridgeToken", function () {
  beforeEach(async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];

    // use this chainId
    chainIdSrc = 1;
    chainIdDst = 2;

    // create a LayerZero Endpoint mock for testing
    const LZEndpointMock = await ethers.getContractFactory("LZEndpointMock");
    layerZeroEndpointMockSrc = await LZEndpointMock.deploy(chainIdSrc);
    layerZeroEndpointMockDst = await LZEndpointMock.deploy(chainIdDst);

    const TokenMock = await ethers.getContractFactory("Token");
    tokenA = await TokenMock.deploy("Demo1", "D1", "100000000000000000000");
    tokenB = await TokenMock.deploy("Demo1", "D1", 0);

    // create two LzApp instances
    const LzApp = await ethers.getContractFactory("LzApp");

    lzAppA = await LzApp.deploy(
      layerZeroEndpointMockSrc.address,
      tokenA.address
    );

    LzAppB = await LzApp.deploy(
      layerZeroEndpointMockDst.address,
      tokenB.address
    );

    await layerZeroEndpointMockSrc.setDestLzEndpoint(
      LzAppB.address,
      layerZeroEndpointMockDst.address
    );
    await layerZeroEndpointMockDst.setDestLzEndpoint(
      lzAppA.address,
      layerZeroEndpointMockSrc.address
    );

    // set each contracts source address so it can send to each other
    await lzAppA.setTrustedRemote(
      chainIdDst,
      ethers.utils.solidityPack(
        ["address", "address"],
        [LzAppB.address, lzAppA.address]
      )
    ); // for A, set B

    await LzAppB.setTrustedRemote(
      chainIdSrc,
      ethers.utils.solidityPack(
        ["address", "address"],
        [lzAppA.address, LzAppB.address]
      )
    ); // for B, set A
  });

  it("should revert if contract is paused", async function () {
    await lzAppA.enable(true);
    await expect(lzAppA.bridgeToken(chainIdDst, 10000)).to.revertedWith(
      "Pausable: paused"
    );
  });

  it("should revert if message fee is low", async function () {
    await lzAppA.setMinDstGasLookup(chainIdDst, 35000);

    await expect(
      lzAppA.bridgeToken(chainIdDst, 10000, {
        value: ethers.utils.parseEther("0.001"),
      })
    ).to.revertedWithCustomError(lzAppA, `LzApp_MessageFeeLow`);
  });

  it("should fail and save data if distination gas is low", async function () {
    await lzAppA.setMinDstGasLookup(chainIdDst, 35000);

    const tokenABalanceBeforeTx = await tokenA.balanceOf(owner.address);
    const tokenBBalanceBeforeTx = await tokenB.balanceOf(owner.address);

    let tx = await lzAppA.bridgeToken(chainIdDst, "10000000000000000000", {
      value: ethers.utils.parseEther("0.5"),
    });

    let receipt = await tx.wait();
    let txPayload = await receipt.events[2].args[5];
    let hashedPayload = ethers.utils.keccak256(txPayload);

    const tokenABalanceAfterTx = await tokenA.balanceOf(owner.address);
    const tokenBBalanceAfterTx = await tokenB.balanceOf(owner.address);

    const path = await layerZeroEndpointMockDst.path();
    const storedPayload = await layerZeroEndpointMockDst.storedPayload(
      chainIdSrc,
      path
    );

    expect(tokenABalanceBeforeTx).to.equal("100000000000000000000");
    expect(tokenABalanceAfterTx).to.equal("90000000000000000000");

    expect(storedPayload[1]).to.equal(LzAppB.address);
    expect(storedPayload[2]).to.equal(hashedPayload);

    expect(tokenBBalanceBeforeTx).to.equal("0");
    expect(tokenBBalanceAfterTx).to.equal("0");
  });

  it("should retry payload", async function () {
    await lzAppA.setMinDstGasLookup(chainIdDst, 35000);
    const tokenBBalanceBeforeTx = await tokenB.balanceOf(owner.address);

    let tx = await lzAppA.bridgeToken(chainIdDst, "10000000000000000000", {
      value: ethers.utils.parseEther("0.5"),
    });

    let receipt = await tx.wait();
    let txPayload = await receipt.events[2].args[5];
    let hashedPayload = ethers.utils.keccak256(txPayload);

    const path = await layerZeroEndpointMockDst.path();
    const storedPayload = await layerZeroEndpointMockDst.storedPayload(
      chainIdSrc,
      path
    );

    await layerZeroEndpointMockDst.retryPayload(chainIdSrc, path, txPayload);
    const storedPayload1 = await layerZeroEndpointMockDst.storedPayload(
      chainIdSrc,
      path
    );

    const tokenBBalanceAfterTx = await tokenB.balanceOf(owner.address);
    expect(storedPayload1[2]).to.equal(ethers.constants.HashZero);

    expect(tokenBBalanceBeforeTx).to.equal("0");
    expect(tokenBBalanceAfterTx).to.equal("10000000000000000000");
  });

  it("should bridge a token", async function () {
    await lzAppA.setMinDstGasLookup(chainIdDst, 350000);

    const tokenABalanceBeforeTx = await tokenA.balanceOf(owner.address);
    const tokenBBalanceBeforeTx = await tokenB.balanceOf(owner.address);

    let tx = await lzAppA.bridgeToken(chainIdDst, "10000000000000000000", {
      value: ethers.utils.parseEther("0.5"),
    });

    const tokenABalanceAfterTx = await tokenA.balanceOf(owner.address);
    const tokenBBalanceAfterTx = await tokenB.balanceOf(owner.address);

    expect(tokenABalanceBeforeTx).to.equal("100000000000000000000");
    expect(tokenABalanceAfterTx).to.equal("90000000000000000000");

    expect(tokenBBalanceBeforeTx).to.equal("0");
    expect(tokenBBalanceAfterTx).to.equal("10000000000000000000");
  });

  it("bridge token to and fro", async function () {
    await lzAppA.setMinDstGasLookup(chainIdDst, 350000);
    await LzAppB.setMinDstGasLookup(chainIdSrc, 350000);

    const tokenABalanceBeforeTx = await tokenA.balanceOf(owner.address);
    const tokenBBalanceBeforeTx = await tokenB.balanceOf(owner.address);

    await lzAppA.bridgeToken(chainIdDst, "10000000000000000000", {
      value: ethers.utils.parseEther("0.5"),
    });

    await LzAppB.bridgeToken(chainIdSrc, "10000000000000000000", {
      value: ethers.utils.parseEther("0.5"),
    });

    const tokenABalanceAfterTx = await tokenA.balanceOf(owner.address);
    const tokenBBalanceAfterTx = await tokenB.balanceOf(owner.address);

    expect(tokenABalanceBeforeTx).to.equal(tokenABalanceAfterTx);
    expect(tokenBBalanceBeforeTx).to.equal(tokenBBalanceAfterTx);
  });
});
