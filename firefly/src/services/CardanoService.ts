import { Lucid, Blockfrost, TxHash, Address } from 'lucid-cardano';
import { Logger } from '../utils/logger';

export class CardanoService {
  private lucid: Lucid;
  private logger: Logger;
  private validatorAddress: string;
  private policyId: string;

  constructor() {
    this.logger = new Logger('CardanoService');
    this.init();
  }

  private async init() {
    try {
      this.lucid = await Lucid.new(
        new Blockfrost(
          process.env.BLOCKFROST_URL!,
          process.env.BLOCKFROST_PROJECT_ID!
        ),
        process.env.CARDANO_NETWORK || 'Testnet'
      );

      this.validatorAddress = process.env.VALIDATOR_ADDRESS!;
      this.policyId = process.env.POLICY_ID!;

      this.logger.info('CardanoService initialized');
    } catch (error) {
      this.logger.error(`Error initializing CardanoService: ${error}`);
      throw error;
    }
  }

  async mintTokens(params: {
    ethTxHash: string;
    address: string;
    tokenIds: number[];
    amounts: number[];
  }): Promise<{ hash: string }> {
    try {
      const { ethTxHash, address, tokenIds, amounts } = params;

      // Prepare token minting
      const assets = tokenIds.reduce((acc, id, index) => {
        const assetName = Buffer.from(`KOOSI_${id}`).toString('hex');
        acc[`${this.policyId}${assetName}`] = BigInt(amounts[index]);
        return acc;
      }, {} as Record<string, bigint>);

      // Create transaction
      const tx = await this.lucid
        .newTx()
        .mintAssets(assets)
        .payToAddress(address as Address, assets)
        .attachMetadata(0, { eth_tx_hash: ethTxHash })
        .validFrom(Date.now())
        .validTo(Date.now() + 1800000) // 30 minutes
        .complete();

      // Sign and submit
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      this.logger.info(`Minted tokens with tx: ${txHash}`);
      return { hash: txHash };
    } catch (error) {
      this.logger.error(`Error minting tokens: ${error}`);
      throw error;
    }
  }

  async verifyTransaction(txHash: string): Promise<boolean> {
    try {
      const tx = await this.lucid.provider.getTransaction(txHash as TxHash);
      return tx !== null;
    } catch (error) {
      this.logger.error(`Error verifying transaction: ${error}`);
      return false;
    }
  }

  async waitForConfirmation(txHash: string): Promise<void> {
    try {
      await this.lucid.awaitTx(txHash as TxHash);
      this.logger.info(`Transaction ${txHash} confirmed`);
    } catch (error) {
      this.logger.error(`Error waiting for confirmation: ${error}`);
      throw error;
    }
  }

  async burnTokens(params: {
    tokenIds: number[];
    amounts: number[];
    ethAddress: string;
  }): Promise<{ hash: string }> {
    try {
      const { tokenIds, amounts, ethAddress } = params;

      // Prepare token burning
      const assets = tokenIds.reduce((acc, id, index) => {
        const assetName = Buffer.from(`KOOSI_${id}`).toString('hex');
        acc[`${this.policyId}${assetName}`] = BigInt(-amounts[index]);
        return acc;
      }, {} as Record<string, bigint>);

      // Create transaction
      const tx = await this.lucid
        .newTx()
        .mintAssets(assets) // Negative values for burning
        .attachMetadata(1, { eth_address: ethAddress })
        .validFrom(Date.now())
        .validTo(Date.now() + 1800000)
        .complete();

      // Sign and submit
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      this.logger.info(`Burned tokens with tx: ${txHash}`);
      return { hash: txHash };
    } catch (error) {
      this.logger.error(`Error burning tokens: ${error}`);
      throw error;
    }
  }
}
