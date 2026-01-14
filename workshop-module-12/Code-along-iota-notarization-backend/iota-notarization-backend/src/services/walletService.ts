import { Ed25519Keypair } from "@iota/iota-sdk/keypairs/ed25519";
import { Ed25519KeypairSigner } from "@iota/iota-interaction-ts/node/test_utils";
import { IotaClient, getFullnodeUrl } from "@iota/iota-sdk/client";
import { getFaucetHost, requestIotaFromFaucetV0 } from "@iota/iota-sdk/faucet";
import { decodeIotaPrivateKey} from "@iota/iota-sdk/cryptography";
import dotenv from "dotenv";

dotenv.config();

export class WalletService {
  private keypair: Ed25519Keypair;
  private signer: Ed25519KeypairSigner;
  private iotaClient: IotaClient;

  constructor() {
    /**
     * TODO :
     * 1. Read PRIVATE_KEY from .env
     * 2. If present:
     *    - If bech32 (starts with iotaprivkey1): decode using decodeIotaPrivateKey()
     *    - Else treat as base64 and load secret key
     * 3. If missing or invalid -> generate a new keypair
     * 4. Create signer from keypair
     * 5. Create IotaClient using NETWORK_URL (fallback: testnet)
     */
  }

    /**
   * Generates a new wallet keypair (ED25519)
   * Prints important details so the user can save the private key.
   */
  private generateNewKeypair(): Ed25519Keypair {
 /**
     * TODO :
     * - Generate Ed25519Keypair
     * - Print:
     *   - Private Key (bech32)
     *   - Address
     *   - Optional base64 secret key
     * - Return keypair
     */
  }

// Getters used by NotarizationService
  getKeypair(): Ed25519Keypair {
       /**
     * TODO :
     * return this.keypair
     */
  }

  getSigner(): Ed25519KeypairSigner {
        /**
     * TODO :
     * return this.signer
     */
  }

  getIotaClient(): IotaClient {
        /**
     * TODO :
     * return this.iotaClient
     */

  }

  getAddress(): string {
      /**
     * TODO :
     * return this.keypair.toIotaAddress()
     */
  }

  async ensureFunds(): Promise<void> {
     /**
     * TODO :
     * - Check balance using client.getBalance()
     * - If 0 -> requestIotaFromFaucetV0()
     * - Wait 5 seconds
     * - Print updated balance
     */
  }

  async getBalance(): Promise<string> {
    /**
     * TODO :
     * - Return totalBalance from client.getBalance()
     */
  }

  getPrivateKeyBase64(): string {
  // TODO: Coding challenge
  // 1) Get bech32 key: this.keypair.getSecretKey()
  // 2) Decode it: decodeIotaPrivateKey(bech32Key)
  // 3) Convert secretKey -> base64
  // 4) Return base64 string

  throw new Error("getPrivateKeyBase64 not implemented");
  }

  getPrivateKeyBech32(): string {
    /**
     * TODO :
     * return this.keypair.getSecretKey()
     */
  }
}