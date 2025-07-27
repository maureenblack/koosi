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
      // Validate required environment variables
      if (!process.env.BLOCKFROST_URL) throw new Error('Missing BLOCKFROST_URL');
      if (!process.env.BLOCKFROST_PROJECT_ID) throw new Error('Missing BLOCKFROST_PROJECT_ID');
      if (!process.env.VALIDATOR_ADDRESS) throw new Error('Missing VALIDATOR_ADDRESS');
      if (!process.env.POLICY_ID) throw new Error('Missing POLICY_ID');
      if (!process.env.CARDANO_PRIVATE_KEY) throw new Error('Missing CARDANO_PRIVATE_KEY');

      // Initialize Blockfrost provider
      const provider = new Blockfrost(
        process.env.BLOCKFROST_URL,
        process.env.BLOCKFROST_PROJECT_ID
      );

      // Initialize Lucid with correct network
      const networkStr = process.env.CARDANO_NETWORK || 'Testnet';
      if (networkStr !== 'Mainnet' && networkStr !== 'Testnet' && networkStr !== 'Preview') {
        throw new Error('Invalid CARDANO_NETWORK value. Must be Mainnet, Testnet, or Preview');
      }
      // Initialize Lucid with network
      this.lucid = await Lucid.new(
        provider,
        networkStr === 'Mainnet' ? 'Mainnet' : networkStr === 'Preview' ? 'Preview' : undefined
      );
      if (!this.lucid.wallet) throw new Error('Failed to initialize Lucid');

      // Load wallet from private key
      await this.lucid.selectWalletFromPrivateKey(process.env.CARDANO_PRIVATE_KEY);

      // Set service variables
      this.validatorAddress = process.env.VALIDATOR_ADDRESS;
      this.policyId = process.env.POLICY_ID;

      this.logger.info('CardanoService initialized successfully');
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

  async transfer(params: {
    tokenId: bigint;
    amount: bigint;
    address: string;
  }): Promise<{ hash: string }> {
    try {
      const { tokenId, amount, address } = params;

      // Prepare token transfer
      const assetName = Buffer.from(`KOOSI_${tokenId}`).toString('hex');
      const assets = {
        [`${this.policyId}${assetName}`]: amount
      };

      // Create transaction
      const tx = await this.lucid
        .newTx()
        .payToAddress(address as Address, assets)
        .validFrom(Date.now())
        .validTo(Date.now() + 1800000) // 30 minutes
        .complete();

      // Sign and submit
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      this.logger.info(`Transferred tokens with tx: ${txHash}`);
      return { hash: txHash };
    } catch (error) {
      this.logger.error(`Error transferring tokens: ${error}`);
      throw error;
    }
  }

  async verifyTransaction(txHash: string): Promise<boolean> {
    try {
      // Use awaitTx with timeout 0 to check if transaction exists and is confirmed
      // If it throws, the transaction either doesn't exist or isn't confirmed
      await this.lucid.awaitTx(txHash as TxHash, 0);
      return true;
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
