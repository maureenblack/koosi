const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
const { utils } = require("ethers");
require("@nomicfoundation/hardhat-chai-matchers");

describe("Koosi Contracts", function () {
  const ACCESS_TOKEN_ID = 1;
  const PREMIUM_TOKEN_ID = 2;
  const SPECIAL_CAPSULE_ID = 3;

  let koosiToken;
  let koosiBridge;
  let owner;
  let user;
  let oracle;

  async function deployFixture() {
    const [owner, user, oracle] = await ethers.getSigners();

    const KoosiToken = await ethers.getContractFactory("KoosiToken");
    const koosiToken = await KoosiToken.deploy();
    await koosiToken.deployed();
    const koosiTokenAddress = koosiToken.address;

    const KoosiBridge = await ethers.getContractFactory("KoosiBridge");
    const koosiBridge = await KoosiBridge.deploy(koosiTokenAddress);
    await koosiBridge.deployed();
    const koosiBridgeAddress = koosiBridge.address;

    const MINTER_ROLE = await koosiToken.MINTER_ROLE();
    const ORACLE_ROLE = await koosiBridge.ORACLE_ROLE();

    await koosiToken.grantRole(MINTER_ROLE, koosiBridgeAddress);
    await koosiBridge.grantRole(ORACLE_ROLE, oracle.address);

    return { koosiToken, koosiBridge, owner, user, oracle };
  }

  describe("KoosiToken", function () {

    beforeEach(async function () {
      const fixture = await loadFixture(deployFixture);
      koosiToken = fixture.koosiToken;
      koosiBridge = fixture.koosiBridge;
      owner = fixture.owner;
      user = fixture.user;
      oracle = fixture.oracle;
    });

    describe("Access Control", function () {
      it("Should allow minting by bridge", async function () {
        await expect(koosiToken.connect(user).mint(await user.getAddress(), ACCESS_TOKEN_ID, 1, []))
          .to.be.revertedWithCustomError(koosiToken, "AccessControlUnauthorizedAccount");

        await expect(koosiBridge.mint(await user.getAddress(), ACCESS_TOKEN_ID, 1, []))
          .to.not.be.reverted;

        expect(await koosiToken.balanceOf(await user.getAddress(), ACCESS_TOKEN_ID)).to.equal(1);
      });
    });

    describe("Token Operations", function () {
      it("Should mint premium tokens correctly", async function () {
        await koosiBridge.mint(await user.getAddress(), PREMIUM_TOKEN_ID, 1, []);
        expect(await koosiToken.balanceOf(await user.getAddress(), PREMIUM_TOKEN_ID)).to.equal(1);
      });

      it("Should mint special capsules correctly", async function () {
        await koosiBridge.mint(await user.getAddress(), SPECIAL_CAPSULE_ID, 1, []);
        expect(await koosiToken.balanceOf(await user.getAddress(), SPECIAL_CAPSULE_ID)).to.equal(1);
      });
    });

    describe("Bridge Integration", function () {
      it("Should bridge tokens correctly", async function () {
        // First mint a token to bridge
        await koosiBridge.mint(await user.getAddress(), ACCESS_TOKEN_ID, 1, []);
        
        // Approve bridge to transfer token
        await koosiToken.connect(user).setApprovalForAll(await koosiBridge.getAddress(), true);
        
        // Bridge the token
        await expect(koosiBridge.connect(user).bridgeToken(
          await user.getAddress(),
          ACCESS_TOKEN_ID,
          1,
          "cardano",
          "0x1234"
        )).to.emit(koosiBridge, "TokensBridged");

        // Check token was burned
        expect(await koosiToken.balanceOf(await user.getAddress(), ACCESS_TOKEN_ID)).to.equal(0);
      });

      it("Should release tokens correctly", async function () {
        const txId = "0x1234";
        const chainId = "cardano";

        await expect(koosiBridge.connect(oracle).releaseTokens(
          await user.getAddress(),
          ACCESS_TOKEN_ID,
          1,
          chainId,
          txId
        )).to.emit(koosiBridge, "TokensReleased");
      });
    });

    describe("Minting", function () {
      it("Should mint access tokens", async function () {
        const amount = 1;
        await koosiToken.mint(user.address, ACCESS_TOKEN_ID, amount, "0x");
        expect(await koosiToken.balanceOf(user.address, ACCESS_TOKEN_ID)).to.equal(amount);
      });

      it("Should mint premium tokens", async function () {
        const amount = 1;
        await koosiToken.mint(user.address, PREMIUM_TOKEN_ID, amount, "0x");
        expect(await koosiToken.balanceOf(user.address, PREMIUM_TOKEN_ID)).to.equal(amount);
      });
    });

    it("Should mint special capsule NFTs", async function () {
      const amount = 1;
      await koosiToken.mint(user.address, SPECIAL_CAPSULE_ID, amount, "0x");
      expect(await koosiToken.balanceOf(user.address, SPECIAL_CAPSULE_ID)).to.equal(amount);
    });

    it("Should not allow unauthorized minting", async function () {
      await expect(
        await koosiToken.connect(user).mint(await user.getAddress(), ACCESS_TOKEN_ID, 1, "0x")
      ).to.be.revertedWith(/AccessControl/);
    });
  });

  describe("KoosiBridge", function () {
    const cardanoAddress = utils.formatBytes32String("cardano_address");
    
    beforeEach(async function () {
      // Register Cardano address
      await koosiBridge.registerCardanoAddress(cardanoAddress);
      
      // Mint some tokens to user for testing
      await koosiToken.mint(await user.getAddress(), ACCESS_TOKEN_ID, 10, "0x");
    });

    it("Should initiate cross-chain transfer", async function () {
      const tokenIds = [ACCESS_TOKEN_ID];
      const amounts = [1];

      // Approve bridge to transfer tokens
      await koosiToken.connect(user).setApprovalForAll(koosiBridge.address, true);

      // Initiate transfer
      const tx = await koosiBridge.connect(user).initiateTransferToCardano(
        cardanoAddress,
        tokenIds,
        amounts
      );
      await expect(tx).to.emit(koosiBridge, "CrossChainTransferInitiated");
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "CrossChainTransferInitiated");
      expect(event?.args).to.not.be.undefined;
      expect(event?.args?.[1]).to.equal(await user.getAddress());
      expect(event?.args?.[2]).to.equal(cardanoAddress);
      expect(event?.args?.[3]).to.deep.equal(tokenIds);
      expect(event?.args?.[4]).to.deep.equal(amounts);
    });

    it("Should confirm Cardano transfer", async function () {
      const tokenIds = [ACCESS_TOKEN_ID];
      const amounts = [1];
      const cardanoTxHash = ethers.utils.formatBytes32String("cardano_tx");

      // Approve and initiate transfer
      await koosiToken.connect(user).setApprovalForAll(koosiBridge.address, true);
      const tx = await koosiBridge.connect(user).initiateTransferToCardano(
        cardanoAddress,
        tokenIds,
        amounts
      );
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "CrossChainTransferInitiated");
      const txHash = event?.args?.[0];

      // Confirm transfer
      await expect(
        koosiBridge.connect(oracle).confirmCardanoTransfer(txHash, cardanoTxHash)
      ).to.emit(koosiBridge, "CrossChainTransferCompleted")
        .withArgs(txHash, cardanoTxHash);
    });
  });
});
