import FireFly from '@hyperledger/firefly-sdk';
import { CardanoService } from '../services/CardanoService';
import { EthereumService } from '../services/EthereumService';
import { Logger } from '../utils/logger';

interface CrossChainEvent {
  data: {
    tokenId: string;
    amount: string;
    cardanoAddress?: string;
    ethereumAddress?: string;
    txHash?: string;
    cardanoTxHash?: string;
  };
}

interface TokenMintEvent {
  data: {
    to: string;
    id: string;
    amount: string;
  };
}

export class ContractEventHandler {
  private readonly firefly: FireFly;
  private readonly cardano: CardanoService;
  private readonly ethereum: EthereumService;
  private readonly logger: Logger;

  constructor(
    firefly: FireFly,
    cardano: CardanoService,
    ethereum: EthereumService,
    logger: Logger
  ) {
    this.firefly = firefly;
    this.cardano = cardano;
    this.ethereum = ethereum;
    this.logger = logger;
  }

  async processCrossChainTransfer(event: CrossChainEvent): Promise<void> {
    try {
      this.logger.info('Processing cross-chain transfer event');

      const { tokenId, amount, cardanoAddress } = event.data;

      // Validate event data
      if (!tokenId || !amount || !cardanoAddress) {
        throw new Error('Missing required event data');
      }

      // Call Cardano service to initiate transfer
      await this.cardano.transfer({
        tokenId: BigInt(tokenId),
        amount: BigInt(amount),
        address: cardanoAddress
      });

      this.logger.info('Successfully initiated Cardano transfer');
    } catch (error) {
      this.logger.error('Failed to process cross-chain transfer');
      throw error;
    }
  }

  async processCardanoConfirmation(event: CrossChainEvent): Promise<void> {
    try {
      this.logger.info('Processing Cardano confirmation event');

      const { tokenId, amount, ethereumAddress, txHash, cardanoTxHash } = event.data;

      // Validate event data
      if (!tokenId || !amount || !ethereumAddress || !txHash || !cardanoTxHash) {
        throw new Error('Missing required event data');
      }

      // Call Ethereum service to confirm transfer
      await this.ethereum.confirmTransfer(txHash, cardanoTxHash);

      this.logger.info('Successfully confirmed Ethereum transfer');
    } catch (error) {
      this.logger.error('Failed to process Cardano confirmation');
      throw error;
    }
  }

  async processTokenMint(event: TokenMintEvent): Promise<void> {
    try {
      this.logger.info('Processing token mint event');

      const { to, id, amount } = event.data;

      // Validate event data
      if (!to || !id || !amount) {
        throw new Error('Missing required event data');
      }

      // Process token mint using Ethereum service
      await this.ethereum.mintToken({
        to,
        tokenId: BigInt(id),
        amount: BigInt(amount)
      });

      this.logger.info('Successfully processed token mint');
    } catch (error) {
      this.logger.error('Failed to process token mint');
      throw error;
    }
  }

}
