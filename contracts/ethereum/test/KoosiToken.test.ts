import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { KoosiToken, KoosiBridge } from "../typechain-types";

describe("Koosi Contracts", function () {
  let koosiToken: KoosiToken;
  let koosiBridge: KoosiBridge;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let oracle: SignerWithAddress;

  const ACCESS_TOKEN_ID = 1;
  const PREMIUM_TOKEN_ID = 2;
  const SPECIAL_CAPSULE_ID = 3;

  beforeEach(async function () {
    [owner, user, oracle] = await ethers.getSigners();

    // Deploy KoosiToken
    const KoosiToken = await ethers.getContractFactory("KoosiToken");
    koosiToken = await KoosiToken.deploy();
    await koosiToken.deployed();

    // Deploy KoosiBridge
    const KoosiBridge = await ethers.getContractFactory("KoosiBridge");
    koosiBridge = await KoosiBridge.deploy(koosiToken.address);
    await koosiBridge.deployed();

    // Setup roles
    const BRIDGE_ROLE = await koosiToken.BRIDGE_ROLE();
    const ORACLE_ROLE = await koosiBridge.ORACLE_ROLE();
    
    await koosiToken.grantRole(BRIDGE_ROLE, koosiBridge.address);
    await koosiBridge.grantRole(ORACLE_ROLE, oracle.address);
  });

  describe("KoosiToken", function () {
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

    it("Should mint special capsule NFTs", async function () {
      const amount = 1;
      await koosiToken.mint(user.address, SPECIAL_CAPSULE_ID, amount, "0x");
      expect(await koosiToken.balanceOf(user.address, SPECIAL_CAPSULE_ID)).to.equal(amount);
    });

    it("Should not allow unauthorized minting", async function () {
      await expect(
        koosiToken.connect(user).mint(user.address, ACCESS_TOKEN_ID, 1, "0x")
      ).to.be.revertedWith(/AccessControl/);
    });
  });

  describe("KoosiBridge", function () {
    const cardanoAddress = ethers.utils.formatBytes32String("cardano_address");
    
    beforeEach(async function () {
      // Register Cardano address
      await koosiBridge.registerCardanoAddress(cardanoAddress);
      
      // Mint some tokens to user for testing
      await koosiToken.mint(user.address, ACCESS_TOKEN_ID, 10, "0x");
    });

    it("Should initiate cross-chain transfer", async function () {
      const tokenIds = [ACCESS_TOKEN_ID];
      const amounts = [1];

      // Approve bridge to transfer tokens
      await koosiToken.connect(user).setApprovalForAll(koosiBridge.address, true);

      // Initiate transfer
      await expect(
        koosiBridge.connect(user).initiateTransferToCardano(
          cardanoAddress,
          tokenIds,
          amounts
        )
      ).to.emit(koosiBridge, "CrossChainTransferInitiated")
        .withArgs(
          expect.any(String), // txHash
          user.address,
          cardanoAddress,
          tokenIds,
          amounts
        );
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
