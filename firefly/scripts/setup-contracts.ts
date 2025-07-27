import axios from 'axios';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';

interface ContractConfig {
  address: string;
  chain: string;
  interface: Record<string, any>[];
}

interface ContractConfigs {
  ethereum: {
    KoosiToken: ContractConfig;
    KoosiBridge: ContractConfig;
  };
}

interface DeploymentConfig {
  network: string;
  koosiToken: string;
  koosiBridge: string;
  timestamp: string;
}

async function main() {
  try {
    const firefly = axios.create({
      baseURL: process.env.FIREFLY_API || 'http://localhost:5000',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Load contract configurations
    let contractsConfig: { contracts: ContractConfigs };
    try {
      const configPath = join(__dirname, '../config/contracts.yml');
      const configContent = readFileSync(configPath, 'utf8');
      contractsConfig = yaml.load(configContent) as { contracts: ContractConfigs };
    } catch (error) {
      throw new Error(`Failed to load contracts.yml: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Load deployment addresses
    let ethDeployments: DeploymentConfig;
    try {
      const network = process.env.NETWORK || 'localhost';
      const deployPath = join(__dirname, `../../contracts/ethereum/deployments/${network}.json`);
      const deployContent = readFileSync(deployPath, 'utf8');
      ethDeployments = JSON.parse(deployContent) as DeploymentConfig;

      // Validate deployment addresses
      if (!ethDeployments.koosiToken || !ethDeployments.koosiBridge) {
        throw new Error('Missing contract addresses in deployment file');
      }
    } catch (error) {
      throw new Error(`Failed to load deployment config: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Set environment variables for contract addresses
    process.env.KOOSI_TOKEN_ADDRESS = ethDeployments.koosiToken;
    process.env.KOOSI_BRIDGE_ADDRESS = ethDeployments.koosiBridge;

    // Load and validate contract configuration
    const contracts = contractsConfig.contracts;
    if (!contracts?.ethereum?.KoosiToken || !contracts?.ethereum?.KoosiBridge) {
      throw new Error('Missing contract configurations in contracts.yml');
    }

    // Validate contract interfaces
    const validateInterface = (contractName: string, abi: Record<string, any>[]) => {
      if (!Array.isArray(abi) || abi.length === 0) {
        throw new Error(`Invalid ABI for ${contractName}: ABI must be a non-empty array`);
      }
      
      // Check for required function signatures
      const requiredFunctions = {
        KoosiToken: ['mint', 'balanceOf', 'grantRole'],
        KoosiBridge: ['registerCardanoAddress', 'initiateCrossChainTransfer']
      };
      
      const functions = abi
        .filter(item => item.type === 'function')
        .map(item => item.name);
      
      const missing = requiredFunctions[contractName as keyof typeof requiredFunctions]
        ?.filter(fn => !functions.includes(fn));
      
      if (missing && missing.length > 0) {
        throw new Error(`Missing required functions in ${contractName} ABI: ${missing.join(', ')}`);
      }
    };

    validateInterface('KoosiToken', contracts.ethereum.KoosiToken.interface);
    validateInterface('KoosiBridge', contracts.ethereum.KoosiBridge.interface);

    // Register contract interfaces with FireFly
    const registerContract = async (name: string, address: string, abi: Record<string, any>[]) => {
      try {
        await firefly.post('/api/v1/namespaces/default/contracts', {
          name,
          address,
          abi
        });

        console.log(`Successfully registered ${name} contract`);
      } catch (error) {
        throw new Error(`Failed to register ${name} contract: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    await registerContract(
      'KoosiToken',
      ethDeployments.koosiToken,
      contractsConfig.contracts.ethereum.KoosiToken.interface
    );

    await registerContract(
      'KoosiBridge',
      ethDeployments.koosiBridge,
      contractsConfig.contracts.ethereum.KoosiBridge.interface
    );

    console.log('Successfully registered all contracts with FireFly');
  } catch (error) {
    console.error('Failed to setup contracts:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error setting up contracts:', error);
    process.exit(1);
  });
