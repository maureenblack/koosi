import { ethers } from 'ethers';
import { Logger } from '../utils/logger';

export class EthereumService {
  private provider: ethers.providers.JsonRpcProvider;
  private koosiBridge: ethers.Contract;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('EthereumService');
    this.init();
  }

  private async init() {
    try {
      this.provider = new ethers.providers.JsonRpcProvider(
        process.env.ETH_RPC_URL
      );

      const bridgeAbi = require('../../contracts/ethereum/artifacts/contracts/KoosiBridge.sol/KoosiBridge.json').abi;
      this.koosiBridge = new ethers.Contract(
        process.env.BRIDGE_ADDRESS!,
        bridgeAbi,
        new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY!, this.provider)
      );

      this.logger.info('EthereumService initialized');
    } catch (error) {
      this.logger.error(`Error initializing EthereumService: ${error}`);
      throw error;
    }
  }

  async verifyTransaction(txHash: string): Promise<boolean> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      if (!tx) return false;

      // Wait for confirmations
      const confirmations = await tx.wait(process.env.ETH_CONFIRMATIONS ? 
        parseInt(process.env.ETH_CONFIRMATIONS) : 12);
      
      return confirmations !== null;
    } catch (error) {
      this.logger.error(`Error verifying transaction: ${error}`);
      return false;
    }
  }

  async confirmTransfer(txHash: string, cardanoTxHash: string): Promise<void> {
    try {
      const tx = await this.koosiBridge.confirmCardanoTransfer(
        txHash,
        cardanoTxHash,
        {
          gasLimit: 200000
        }
      );
      await tx.wait();
      this.logger.info(`Confirmed transfer ${txHash} with Cardano tx ${cardanoTxHash}`);
    } catch (error) {
      this.logger.error(`Error confirming transfer: ${error}`);
      throw error;
    }
  }

  async getTransferStatus(txHash: string): Promise<string> {
    try {
      const tx = await this.koosiBridge.crossChainTxs(txHash);
      return tx.completed ? 'completed' : 'pending';
    } catch (error) {
      this.logger.error(`Error getting transfer status: ${error}`);
      throw error;
    }
  }

  async estimateGas(
    method: string,
    params: any[]
  ): Promise<ethers.BigNumber> {
    try {
      return await this.koosiBridge.estimateGas[method](...params);
    } catch (error) {
      this.logger.error(`Error estimating gas: ${error}`);
      throw error;
    }
  }
}
