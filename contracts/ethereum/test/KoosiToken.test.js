const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { loadFixture } = waffle;

describe("Koosi Contracts", function () {
  const ACCESS_TOKEN_ID = 1;
  const PREMIUM_TOKEN_ID = 2;
  const SPECIAL_CAPSULE_ID = 3;
  const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
  const BRIDGE_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BRIDGE_ROLE"));
  const ORACLE_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_ROLE"));
  const FIREFLY_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FIREFLY_ROLE"));

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

    const KoosiBridge = await ethers.getContractFactory("KoosiBridge");
    const koosiBridge = await KoosiBridge.deploy(koosiToken.address);
    await koosiBridge.deployed();

    // Grant roles
    await koosiToken.grantRole(BRIDGE_ROLE, koosiBridge.address);
    await koosiToken.grantRole(MINTER_ROLE, owner.address);
    await koosiBridge.grantRole(ORACLE_ROLE, oracle.address);
    await koosiBridge.grantRole(FIREFLY_ROLE, owner.address);

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
      it("Should mint special capsule NFTs", async function () {
        await expect(
          koosiToken.mint(await user.getAddress(), SPECIAL_CAPSULE_ID, 1, "0x")
        ).to.emit(koosiToken, "TokenMinted");
      });

      it("Should not allow unauthorized minting", async function () {
        await expect(
          koosiToken.connect(user).mint(await user.getAddress(), ACCESS_TOKEN_ID, 1, "0x")
        ).to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6");
      });

      it("Should allow minting by owner", async function () {
        await expect(
          koosiToken.mint(await user.getAddress(), ACCESS_TOKEN_ID, 1, "0x")
        ).to.emit(koosiToken, "TokenMinted");
      });
    });

    describe("Token Operations", function () {
      it("Should mint premium tokens correctly", async function () {
        await koosiToken.mint(await user.getAddress(), PREMIUM_TOKEN_ID, 1, "0x");
        expect(await koosiToken.balanceOf(await user.getAddress(), PREMIUM_TOKEN_ID)).to.equal(1);
      });

      it("Should mint special capsules correctly", async function () {
        await koosiToken.mint(await user.getAddress(), SPECIAL_CAPSULE_ID, 1, "0x");
        expect(await koosiToken.balanceOf(await user.getAddress(), SPECIAL_CAPSULE_ID)).to.equal(1);
      });
    });

    describe("Bridge Integration", function () {
      beforeEach(async function () {
        await koosiToken.mint(await user.getAddress(), ACCESS_TOKEN_ID, 10, "0x");
      });

      it("Should bridge tokens correctly", async function () {
        const userAddress = await user.getAddress();
        const cardanoAddress = "0x" + Buffer.from("cardano_address").toString("hex").padEnd(64, "0");
        await koosiBridge.registerCardanoAddress(cardanoAddress);

        await expect(
          koosiBridge.connect(user).initiateTransferToCardano(
            cardanoAddress,
            [ACCESS_TOKEN_ID],
            [5]
          )
        ).to.emit(koosiBridge, "CrossChainTransferInitiated");

        expect(await koosiToken.balanceOf(userAddress, ACCESS_TOKEN_ID)).to.equal(5);
      });

      it("Should confirm Cardano transfer", async function () {
        const cardanoAddress = "0x" + Buffer.from("cardano_address").toString("hex").padEnd(64, "0");
        await koosiBridge.registerCardanoAddress(cardanoAddress);

        const tx = await koosiBridge.connect(user).initiateTransferToCardano(
          cardanoAddress,
          [ACCESS_TOKEN_ID],
          [5]
        );
        const receipt = await tx.wait();
        const event = receipt.events.find(e => e.event === "CrossChainTransferInitiated");
        const txHash = event.args.txHash;

        await expect(
          koosiBridge.connect(oracle).confirmCardanoTransfer(
            txHash,
            ethers.utils.formatBytes32String("cardano_tx_hash")
          )
        ).to.emit(koosiBridge, "CrossChainTransferCompleted");
      });
    });

    describe("Minting", function () {
      it("Should mint access tokens", async function () {
        await koosiToken.mint(await user.getAddress(), ACCESS_TOKEN_ID, 1, "0x");
        expect(await koosiToken.balanceOf(await user.getAddress(), ACCESS_TOKEN_ID)).to.equal(1);
      });

      it("Should mint premium tokens", async function () {
        await koosiToken.mint(await user.getAddress(), PREMIUM_TOKEN_ID, 1, "0x");
        expect(await koosiToken.balanceOf(await user.getAddress(), PREMIUM_TOKEN_ID)).to.equal(1);
      });
    });

    it("Should mint special capsule NFTs", async function () {
      const amount = 1;
      await koosiToken.mint(await user.getAddress(), SPECIAL_CAPSULE_ID, amount, "0x");
      expect(await koosiToken.balanceOf(await user.getAddress(), SPECIAL_CAPSULE_ID)).to.equal(amount);
    });
  });

  describe("KoosiBridge", function () {
    const cardanoAddress = "0x" + Buffer.from("cardano_address").toString("hex").padEnd(64, "0");
    
    beforeEach(async function () {
      const fixture = await loadFixture(deployFixture);
      koosiToken = fixture.koosiToken;
      koosiBridge = fixture.koosiBridge;
      owner = fixture.owner;
      user = fixture.user;
      oracle = fixture.oracle;

      // Register Cardano address
      await koosiBridge.registerCardanoAddress(cardanoAddress);
      
      // Mint some tokens to user for testing
      await koosiToken.mint(await user.getAddress(), ACCESS_TOKEN_ID, 10, "0x");
    });

    it("Should initiate cross-chain transfer", async function () {
      const tokenIds = [ACCESS_TOKEN_ID];
      const amounts = [1];

      await expect(
        koosiBridge.connect(user).initiateTransferToCardano(
          cardanoAddress,
          tokenIds,
          amounts
        )
      ).to.emit(koosiBridge, "CrossChainTransferInitiated");
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
