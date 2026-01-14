import { NotarizationClient, NotarizationClientReadOnly, TimeLock, State } from "@iota/notarization/node";
import { WalletService } from "./walletService";

export class NotarizationService {
  private walletService: WalletService;
  private notarizationClient: NotarizationClient | null = null;
  private notarizationReadOnly: NotarizationClientReadOnly | null = null;

  constructor() {
    this.walletService = new WalletService();
  }

  private async initializeClients(): Promise<void> {
    /**
     * TODO:
     * 1) If this.notarizationClient already exists -> return
     * 2) Read packageId from env: IOTA_NOTARIZATION_PKG_ID
     * 3) Create readOnly client using:
     *    NotarizationClientReadOnly.createWithPkgId(iotaClient, packageId)
     * 4) Create writable client using:
     *    NotarizationClient.create(readOnlyClient, signer)
     * 5) Store them in class properties
     */
  }

  private async getClient(): Promise<NotarizationClient> {
    if (!this.notarizationClient) {
      await this.initializeClients();
    }
    if (!this.notarizationClient) {
      throw new Error("Notarization client not initialized");
    }
    return this.notarizationClient;
  }

  private getReadOnly(): NotarizationClientReadOnly {
    if (!this.notarizationClient) {
      throw new Error("Notarization client not initialized");
    }
    return this.notarizationClient.readOnly();
  }

  // Create Dynamic Notarization
  async createDynamicNotarization(
    content: string,
    metadata: string,
    description?: string,
    transferLock?: { unlockAt?: number; untilDestroyed?: boolean }
  ): Promise<any> {
    /**
     * TODO :
     * 1) const client = await this.getClient()
     * 2) Create builder:
     *    client.createDynamic().withStringState(content, metadata)
     * 3) If description -> builder.withImmutableDescription(description)
     * 4) If transferLock.unlockAt -> builder.withTransferLock(TimeLock.withUnlockAt(...))
     *    Else if transferLock.untilDestroyed -> builder.withTransferLock(TimeLock.withUntilDestroyed())
     * 5) Execute:
     *    builder.finish().buildAndExecute(client)
     * 6) Return notarizationId + transactionDigest
     */
  }

  // Create Locked Notarization
async createLockedNotarization(
  content: string,
  metadata: string,
  description?: string,
  deleteLock?: { unlockAt?: number}
): Promise<any> {
    /**
     * TODO :
     * 1) const client = await this.getClient()
     * 2) Create builder:
     *    client.createLocked().withStringState(content, metadata)
     * 3) If description -> builder.withImmutableDescription(description)
     * 4) If deleteLock.unlockAt:
     *    - validate it's future timestamp
     *    - builder.withDeleteLock(TimeLock.withUnlockAt(deleteLock.unlockAt))
     *    Else -> builder.withDeleteLock(TimeLock.withNone())
     * 5) Execute and return notarizationId + transactionDigest
     */
}

// Update State - Add locked notarization check
async updateState(notarizationId: string, content: string, metadata: string): Promise<any> {
  const client = await this.getClient();
  
  // Check if notarization is locked before attempting update
  const details = await this.getNotarizationDetails(notarizationId);
  if (details.method === "Locked") {
    throw new Error("Cannot update state of a locked notarization - it is immutable");
  }

  const state = State.fromString(content, metadata);
  const result = await client
    .updateState(state, notarizationId)
    .buildAndExecute(client);

  return {
    transactionDigest: result.response.digest,
    timestamp: new Date()
  };
}

// Update Metadata - Add locked notarization check
async updateMetadata(notarizationId: string, metadata: string | undefined): Promise<any> {
  const client = await this.getClient();
  
  // Check if notarization is locked before attempting update
  const details = await this.getNotarizationDetails(notarizationId);
  if (details.method === "Locked") {
    throw new Error("Cannot update metadata of a locked notarization - it is immutable");
  }

  const result = await client
    .updateMetadata(metadata, notarizationId)
    .buildAndExecute(client);

  return {
    transactionDigest: result.response.digest,
    timestamp: new Date()
  };
}

// Transfer Notarization - Add locked notarization check
async transferNotarization(notarizationId: string, recipientAddress: string): Promise<any> {
  /**
   * TODO:
   * 1) const client = await this.getClient()
   * 2) Fetch notarization details:
   *    const details = await this.getNotarizationDetails(notarizationId)
   *
   * Coding Challenge:
   * 3) If details.method === "Locked" -> throw error (non-transferable)
   *
   * 4) Execute transfer:
   *    client.transferNotarization(notarizationId, recipientAddress).buildAndExecute(client)
   *
   * 5) Return transactionDigest + timestamp
   */
}

// Check if destruction is allowed before attempting to destroy
async canDestroyNotarization(notarizationId: string): Promise<boolean> {
  const readOnly = this.getReadOnly();
  return await readOnly.isDestroyAllowed(notarizationId);
}

// Destroy Notarization - Add pre-check
async destroyNotarization(notarizationId: string): Promise<any> {
  const client = await this.getClient();
  
  // Optional: Check if destruction is allowed first
  const canDestroy = await this.canDestroyNotarization(notarizationId);
  if (!canDestroy) {
    throw new Error("Cannot destroy notarization - it may be locked or have active delete locks");
  }

  const result = await client
    .destroy(notarizationId)
    .buildAndExecute(client);

  return {
    transactionDigest: result.response.digest,
    timestamp: new Date()
  };
}

  // Get Notarization Details
  async getNotarizationDetails(notarizationId: string): Promise<any> {
    const readOnly = this.getReadOnly();

    const [
      state,
      versionCount,
      description,
      metadata,
      createdAt,
      method,
      isTransferLocked,
      isUpdateLocked,
      isDestroyAllowed
    ] = await Promise.all([
      readOnly.state(notarizationId),
      readOnly.stateVersionCount(notarizationId),
      readOnly.description(notarizationId),
      readOnly.updatableMetadata(notarizationId),
      readOnly.createdAtTs(notarizationId),
      readOnly.notarizationMethod(notarizationId),
      readOnly.isTransferLocked(notarizationId),
      readOnly.isUpdateLocked(notarizationId),
      readOnly.isDestroyAllowed(notarizationId)
    ]);

    return {
      notarizationId,
      state: {
        content: state.data.toString(),
        metadata: state.metadata
      },
      versionCount: Number(versionCount),
      description,
      metadata,
      createdAt: new Date(Number(createdAt) * 1000).toISOString(),
      method,
      locks: {
        transferLocked: isTransferLocked,
        updateLocked: isUpdateLocked,
        destroyAllowed: isDestroyAllowed
      }
    };
  }

// Verify Notarization (Coding Challenge)
  // Verify Notarization
  async verifyNotarization(notarizationId: string, expectedContent: string): Promise<any> {
    /**
     * Challenge:
     * 1) const readOnly = this.getReadOnly()
     * 2) Fetch state: await readOnly.state(notarizationId)
     * 3) actualContent = state.data.toString()
     * 4) Compare with expectedContent
     * 5) Return verified result
     * 6) Catch errors and return { verified:false, error:"Notarization not found or inaccessible" }
     */
  }

  // Get Wallet Info
  async getWalletInfo(): Promise<any> {
    const balance = await this.walletService.getBalance();
    
    return {
      address: this.walletService.getAddress(),
      balance,
      network: "testnet",
      hasPrivateKey: !!process.env.PRIVATE_KEY
    };
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const walletInfo = await this.getWalletInfo();
      return {
        success: true,
        status: "healthy",
        wallet: {
          address: walletInfo.address,
          balance: walletInfo.balance,
          hasPrivateKey: walletInfo.hasPrivateKey
        },
        network: "testnet",
        packageId: process.env.IOTA_NOTARIZATION_PKG_ID,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      };
    }
  }
}