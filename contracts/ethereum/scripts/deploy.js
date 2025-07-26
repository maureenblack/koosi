const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy KoosiToken
  const KoosiToken = await hre.ethers.getContractFactory("KoosiToken");
  const koosiToken = await KoosiToken.deploy();
  await koosiToken.deployed();
  console.log("KoosiToken deployed to:", koosiToken.address);

  // Deploy KoosiBridge
  const KoosiBridge = await hre.ethers.getContractFactory("KoosiBridge");
  const koosiBridge = await KoosiBridge.deploy(koosiToken.address);
  await koosiBridge.deployed();
  console.log("KoosiBridge deployed to:", koosiBridge.address);

  // Grant BRIDGE_ROLE to KoosiBridge contract
  const BRIDGE_ROLE = await koosiToken.BRIDGE_ROLE();
  await koosiToken.grantRole(BRIDGE_ROLE, koosiBridge.address);
  console.log("Granted BRIDGE_ROLE to KoosiBridge");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    koosiToken: koosiToken.address,
    koosiBridge: koosiBridge.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(__dirname, `../deployments/${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Generate Firefly contract configuration
  const fireflyConfig = {
    contracts: {
      ethereum: {
        KoosiToken: {
          address: koosiToken.address,
          chain: network.name
        },
        KoosiBridge: {
          address: koosiBridge.address,
          chain: network.name
        }
      }
    }
  };

  fs.writeFileSync(
    path.join(__dirname, `../../../firefly/config/deployments.${network.name}.yml`),
    JSON.stringify(fireflyConfig, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
