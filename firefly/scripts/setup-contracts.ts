import { FireFly } from '@hyperledger/firefly-sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';

async function main() {
  const firefly = new FireFly({
    url: process.env.FIREFLY_API || 'http://localhost:5000'
  });

  // Load contract configurations
  const contractsConfig = yaml.load(
    readFileSync(join(__dirname, '../config/contracts.yml'), 'utf8')
  );

  // Load deployment addresses
  const ethDeployments = JSON.parse(
    readFileSync(join(__dirname, '../../contracts/ethereum/deployments/ethereum.json'), 'utf8')
  );
  
  const cardanoDeployments = yaml.load(
    readFileSync(join(__dirname, '../config/deployments.cardano.yml'), 'utf8')
  );

  // Create contract interfaces
  for (const [chain, contracts] of Object.entries(contractsConfig.contracts)) {
    for (const [name, contract] of Object.entries(contracts)) {
      console.log(`Creating contract interface for ${chain}/${name}`);
      
      // Get deployment address
      const address = chain === 'ethereum' 
        ? ethDeployments[name.toLowerCase()]
        : cardanoDeployments.contracts.cardano[name].address;

      await firefly.createContractInterface({
        name: `${chain}_${name}`,
        version: '1.0.0',
        chain: chain,
        address: address,
        interface: contract.interface
      });
    }
  }

  // Create token pools
  for (const pool of contractsConfig.tokens.pools) {
    console.log(`Creating token pool: ${pool.name}`);
    await firefly.createTokenPool({
      name: pool.name,
      type: pool.type,
      symbol: pool.symbol,
      decimals: pool.decimals || 0,
      contract: `${pool.contract}`,
      index: pool.index
    });
  }

  // Create event subscriptions
  for (const sub of contractsConfig.events.subscriptions) {
    console.log(`Creating event subscription: ${sub.event}`);
    await firefly.createEventSubscription({
      name: `${sub.contract}_${sub.event}`,
      event: sub.event,
      contract: sub.contract,
      handler: sub.handler,
      filters: sub.filters
    });
  }

  console.log('Contract setup completed successfully');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error setting up contracts:', error);
    process.exit(1);
  });
