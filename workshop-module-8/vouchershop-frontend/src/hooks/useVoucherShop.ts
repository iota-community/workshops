import { useNetworkVariable } from "../network/config";
import { useCurrentAccount, useSignAndExecuteTransaction, useIotaClient } from "@iota/dapp-kit";
import { Transaction } from "@iota/iota-sdk/transactions";
import { useState } from "react";
import { NFTMetadata } from "../types";
import { parseVoucherShopError, VoucherShopError } from "../utils/errorHandling";

export const useVoucherShop = () => {
  const packageId = useNetworkVariable("packageId");
  const voucherShopObject = useNetworkVariable("voucherShopObject");
  const account = useCurrentAccount();
  const client = useIotaClient();
  
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [selectedNft, setSelectedNft] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const checkVoucherStatus = async (address: string) => {
    if (!address) return { hasVoucher: false, isVoucherUsed: false };

    try {
      // Check if has voucher
      const hasVoucherTx = new Transaction();
      hasVoucherTx.moveCall({
        target: `${packageId}::voucher_shop::has_voucher`,
        arguments: [hasVoucherTx.object(voucherShopObject), hasVoucherTx.pure.address(address)]
      });

      const hasVoucherResult = await client.devInspectTransactionBlock({
        transactionBlock: hasVoucherTx,
        sender: address
      });

      let hasVoucher = false;
      if (hasVoucherResult.results && hasVoucherResult.results.length > 0) {
        const returnValues = hasVoucherResult.results[0]?.returnValues;
        if (returnValues && returnValues.length > 0) {
          hasVoucher = returnValues[0][0][0] === 1;
        }
      }

      let isVoucherUsed = false;
      if (hasVoucher) {
        const isUsedTx = new Transaction();
        isUsedTx.moveCall({
          target: `${packageId}::voucher_shop::is_voucher_used`,
          arguments: [isUsedTx.object(voucherShopObject), isUsedTx.pure.address(address)]
        });

        const isUsedResult = await client.devInspectTransactionBlock({
          transactionBlock: isUsedTx,
          sender: address
        });

        if (isUsedResult.results && isUsedResult.results.length > 0) {
          const returnValues = isUsedResult.results[0]?.returnValues;
          if (returnValues && returnValues.length > 0) {
            isVoucherUsed = returnValues[0][0][0] === 1;
          }
        }
      }

      return { hasVoucher, isVoucherUsed };
    } catch (error) {
      console.error("Error checking voucher status:", error);
      const parsedError = parseVoucherShopError(error);
      throw parsedError;
    }
  };

  // Pre-validate actions before executing transactions
  const validateClaimVoucher = async (): Promise<{ canProceed: boolean; error?: VoucherShopError }> => {
    if (!account?.address) {
      return {
        canProceed: false,
        error: {
          code: -1,
          message: "No wallet connected",
          userFriendlyMessage: "Please connect your wallet first",
          suggestions: ["Click the Connect Wallet button"]
        }
      };
    }

    try {
      const status = await checkVoucherStatus(account.address);
      if (status.hasVoucher) {
        return {
          canProceed: false,
          error: {
            code: 1,
            message: "Already claimed",
            userFriendlyMessage: "You have already claimed a voucher",
            suggestions: ["You can redeem your existing voucher for an NFT"]
          }
        };
      }
      return { canProceed: true };
    } catch (error) {
      return {
        canProceed: false,
        error: parseVoucherShopError(error)
      };
    }
  };

  const validateRedeemVoucher = async (nftId: number): Promise<{ canProceed: boolean; error?: VoucherShopError }> => {
    if (!account?.address) {
      return {
        canProceed: false,
        error: {
          code: -1,
          message: "No wallet connected",
          userFriendlyMessage: "Please connect your wallet first",
          suggestions: ["Click the Connect Wallet button"]
        }
      };
    }

    try {
      const status = await checkVoucherStatus(account.address);
      
      if (!status.hasVoucher) {
        return {
          canProceed: false,
          error: {
            code: 2,
            message: "No voucher",
            userFriendlyMessage: "You don't have a voucher to redeem",
            suggestions: ["Claim a voucher first"]
          }
        };
      }

      if (status.isVoucherUsed) {
        return {
          canProceed: false,
          error: {
            code: 3,
            message: "Voucher already used",
            userFriendlyMessage: "Your voucher has already been redeemed",
            suggestions: ["Check your NFT collection to see what you redeemed"]
          }
        };
      }

      // Check if NFT template exists
      const availableNFTs = await getAvailableNFTs();
      const nftExists = availableNFTs.some(
        nft => String(nft.id) === String(nftId)
      );
      
      if (!nftExists) {
        return {
          canProceed: false,
          error: {
            code: 4,
            message: "Invalid NFT template",
            userFriendlyMessage: "The selected NFT template is not available",
            suggestions: ["Choose a different NFT from the available options"]
          }
        };
      }

      return { canProceed: true };
    } catch (error) {
      return {
        canProceed: false,
        error: parseVoucherShopError(error)
      };
    }
  };

  const getAvailableNFTs = async (): Promise<NFTMetadata[]> => {
    try {
      const shopObject = await client.getObject({
        id: voucherShopObject,
        options: { showContent: true }
      });

      if (!shopObject.data?.content || shopObject.data.content.dataType !== 'moveObject') {
        throw new Error('Invalid shop object');
      }

      const fields = (shopObject.data.content as any).fields;
      const nftIds = fields.nft_ids || [];

      if (nftIds.length === 0) {
        throw {
          code: 7,
          message: "No NFT templates available"
        };
      }

      // Rest of your existing getAvailableNFTs implementation...
      const fallbackNfts: NFTMetadata[] = [];
      
      for (const nftId of nftIds) {
      fallbackNfts.push({
        id: nftId,
        name: `NFT Template ${nftId}`,
        image_uri: `https://example.com/nft${nftId}.png`,
        description: `NFT Template with ID ${nftId}`
      });
    }
      
      return fallbackNfts;

    } catch (error) {
      console.error("Error getting available NFTs:", error);
      throw parseVoucherShopError(error);
    }
  };

  const claimVoucher = () => {
    if (!account) {
      return Promise.reject(parseVoucherShopError(new Error("No account connected")));
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::voucher_shop::claim_voucher`,
      arguments: [tx.object(voucherShopObject)]
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Voucher claimed successfully', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('Failed to claim voucher', error);
            const parsedError = parseVoucherShopError(error);
            reject(parsedError);
          }
        }
      );
    });
  };

  const redeemVoucher = (nftId: number) => {
    if (!account) {
      return Promise.reject(parseVoucherShopError(new Error("No account connected")));
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::voucher_shop::redeem_voucher`,
      arguments: [tx.object(voucherShopObject), tx.pure.u64(nftId)]
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Voucher redeemed successfully', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('Failed to redeem voucher', error);
            const parsedError = parseVoucherShopError(error);
            reject(parsedError);
          }
        }
      );
    });
  };

  return {
    account,
    packageId,
    voucherShopObject,
    client,
    selectedNft,
    setSelectedNft,
    loading,
    setLoading,
    checkVoucherStatus,
    validateClaimVoucher,
    validateRedeemVoucher,
    getAvailableNFTs,
    claimVoucher,
    redeemVoucher
  };
};
