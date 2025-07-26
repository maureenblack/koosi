import { FireFly } from '@hyperledger/firefly-sdk';
import { CardanoService } from '../services/CardanoService';
import { EthereumService } from '../services/EthereumService';
import { Logger } from '../utils/logger';

export class ContractEventHandler {
  private firefly: FireFly;
  private cardano: CardanoService;
  private ethereum: EthereumService;
  private logger: Logger;

  constructor() {
    this.firefly = new FireFly({
      url: process.env.FIREFLY_API || 'http://localhost:5000'
    });
    this.cardano = new CardanoService();
    this.ethereum = new EthereumService();
    this.logger = new Logger('ContractEventHandler');
  }

  async processCrossChainTransfer(event: any): Promise<void> {
    try {
      const { txHash, from, cardanoAddress, tokenIds, amounts } = event.data;
      this.logger.info(`Processing cross-chain transfer ${txHash}`);

      // Create a batch for atomic operations
      const batch = await this.firefly.createBatch({
        type: 'cross_chain_transfer',
        metadata: {
          txHash,
          from,
          cardanoAddress,
          tokenIds,
          amounts
        }
      });

      // Verify Ethereum transaction
      const ethTxVerified = await this.ethereum.verifyTransaction(txHash);
      if (!ethTxVerified) {
        throw new Error(`Invalid Ethereum transaction: ${txHash}`);
      }

      // Mint tokens on Cardano
      const cardanoTx = await this.cardano.mintTokens({
        ethTxHash: txHash,
        address: cardanoAddress,
        tokenIds,
        amounts
      });

      // Wait for Cardano transaction confirmation
      await this.cardano.waitForConfirmation(cardanoTx.hash);

      // Confirm the cross-chain transfer
      await this.ethereum.confirmTransfer(txHash, cardanoTx.hash);

      // Complete the batch
      await this.firefly.completeBatch(batch.id);

      this.logger.info(`Completed cross-chain transfer ${txHash}`);
    } catch (error) {
      this.logger.error(`Error processing cross-chain transfer: ${error}`);
      throw error;
    }
  }

  async processTokenMint(event: any): Promise<void> {
    try {
      const { to, id, amount } = event.data;
      this.logger.info(`Processing token mint: ${id} to ${to}`);

      // Update token pool balance
      await this.firefly.updateTokenBalance({
        pool: `token_${id}`,
        address: to,
        amount: amount.toString()
      });

      this.logger.info(`Token mint processed: ${id}`);
    } catch (error) {
      this.logger.error(`Error processing token mint: ${error}`);
      throw error;
    }
  }

  async finalizeCrossChainTransfer(event: any): Promise<void> {
    try {
      const { txHash, cardanoTxHash } = event.data;
      this.logger.info(`Finalizing cross-chain transfer ${txHash}`);

      // Verify Cardano transaction
      const cardanoTxVerified = await this.cardano.verifyTransaction(cardanoTxHash);
      if (!cardanoTxVerified) {
        throw new Error(`Invalid Cardano transaction: ${cardanoTxHash}`);
      }

      // Update transfer status in FireFly
      await this.firefly.updateTransferStatus(txHash, 'completed');

      this.logger.info(`Finalized cross-chain transfer ${txHash}`);
    } catch (error) {
      this.logger.error(`Error finalizing cross-chain transfer: ${error}`);
      throw error;
    }
  }
}
