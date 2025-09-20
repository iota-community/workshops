import { useNetworkVariable } from "../networkConfig";
import { useCurrentAccount, useSignAndExecuteTransaction, useIotaClient } from "@iota/dapp-kit";
import { Transaction } from "@iota/iota-sdk/transactions";
import { useState } from "react";
import { parseWKTError, WKTError } from "../utils/errorHandling";
import { WorkshopBadge, TokenBalance } from "../types";

export const useWKTContract = () => {
  const packageId = useNetworkVariable("packageId");
  const faucetObject = useNetworkVariable("faucetObject");
  const account = useCurrentAccount();
  const client = useIotaClient();
  
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [loading, setLoading] = useState(false);

  // Check if user is admin
  const checkIsAdmin = async (address: string): Promise<boolean> => {
    if (!address) return false;

    try {
      const faucetData = await client.getObject({
        id: faucetObject,
        options: { showContent: true }
      });

      if (faucetData.data?.content && faucetData.data.content.dataType === 'moveObject') {
        const fields = (faucetData.data.content as any).fields;
        return fields.admin === address;
      }
      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

// Check if user has claimed today
const checkHasClaimed = async (address: string): Promise<boolean> => {
    if (!address) return false;

    try {
        const tx = new Transaction();
        tx.moveCall({
            target: `${packageId}::wkt::view_claim_status`,
            arguments: [tx.object(faucetObject)],
        });

        const result = await client.devInspectTransactionBlock({
            transactionBlock: tx,
            sender: address,
        });

        console.log("view_claim_status simulation result:", result);

        if (result.events && result.events.length > 0) {
            const claimStatusEvent = result.events.find(e =>
                e.type.endsWith('::wkt::ClaimStatus')
            );

            if (claimStatusEvent) {
                const hasClaimed = (claimStatusEvent.parsedJson as any)?.has_claimed_today || false;
                console.log("User has claimed today (from event):", hasClaimed);
                return hasClaimed;
            }
        }

        return false;
    } catch (error) {
        console.error("Error checking claim status:", error);
        return false;
    }
};



  // Check if user has redeemed badge
  const checkHasRedeemedBadge = async (address: string): Promise<boolean> => {
    if (!address) return false;

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::wkt::has_redeemed_badge`,
        arguments: [tx.object(faucetObject), tx.pure.address(address)]
      });

      const result = await client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: address
      });

      if (result.results && result.results.length > 0) {
        const returnValues = result.results[0]?.returnValues;
        if (returnValues && returnValues.length > 0) {
          return returnValues[0][0][0] === 1;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking badge redemption status:", error);
      return false;
    }
  };

  // Check if coupon is valid for user
  const checkCouponValidity = async (code: string, address: string): Promise<boolean> => {
    if (!address || !code) return false;

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::wkt::is_valid_coupon_for_user`,
        arguments: [tx.object(faucetObject), tx.pure.string(code), tx.pure.address(address)]
      });

      const result = await client.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: address
      });

      if (result.results && result.results.length > 0) {
        const returnValues = result.results[0]?.returnValues;
        if (returnValues && returnValues.length > 0) {
          return returnValues[0][0][0] === 1;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking coupon validity:", error);
      return false;
    }
  };

  // Get user's WKT balance
  const getWKTBalance = async (address: string): Promise<TokenBalance[]> => {
    if (!address) return [];

    try {
      const coins = await client.getCoins({
        owner: address,
        coinType: `${packageId}::wkt::WKT`
      });

      return coins.data.map(coin => ({
        coinObjectId: coin.coinObjectId,
        balance: coin.balance
      }));
    } catch (error) {
      console.error("Error getting WKT balance:", error);
      return [];
    }
  };

  // Get user's workshop badges
  const getWorkshopBadges = async (address: string): Promise<WorkshopBadge[]> => {
    if (!address) return [];

    try {
      const objects = await client.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${packageId}::wkt::WorkshopBadge`
        },
        options: {
          showContent: true
        }
      });

      return objects.data.map(obj => {
        const fields = (obj.data?.content as any)?.fields;
        return {
          id: fields?.id?.id || '',
          recipient: fields?.recipient || '',
          minted_at: fields?.minted_at || '',
          workshop_id: fields?.workshop_id || '',
          url: fields?.url || ''
        };
      }).filter(badge => badge.id);
    } catch (error) {
      console.error("Error getting workshop badges:", error);
      return [];
    }
  };

  // Get available coupon codes (from faucet state)
  const getAvailableCoupons = async (): Promise<string[]> => {
    try {
      const faucetData = await client.getObject({
        id: faucetObject,
        options: { showContent: true }
      });

      if (faucetData.data?.content && faucetData.data.content.dataType === 'moveObject') {
        const fields = (faucetData.data.content as any).fields;
        const couponCodes = fields.coupon_codes?.fields?.contents || [];
        return couponCodes.map((entry: any) => entry.fields.key);
      }
      return [];
    } catch (error) {
      console.error("Error getting available coupons:", error);
      return [];
    }
  };

  // Claim daily tokens
  const claimTokens = (): Promise<any | WKTError> => {
    if (!account) {
      return Promise.reject(parseWKTError(new Error("No account connected")));
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::wkt::claim_tokens`,
      arguments: [tx.object(faucetObject)]
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Tokens claimed successfully', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('Failed to claim tokens', error);
            const parsedError = parseWKTError(error);
            reject(parsedError);
          }
        }
      );
    });
  };

  // Claim with coupon
  const claimWithCoupon = (code: string) => {
    if (!account) {
      return Promise.reject(parseWKTError(new Error("No account connected")));
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::wkt::claim_with_coupon`,
      arguments: [tx.object(faucetObject), tx.pure.string(code)]
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Claimed with coupon successfully', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('Failed to claim with coupon', error);
            const parsedError = parseWKTError(error);
            reject(parsedError);
          }
        }
      );
    });
  };

  // Make payment
  const makePayment = (coinId: string, recipient: string, amount: string) => {
    if (!account) {
      return Promise.reject(parseWKTError(new Error("No account connected")));
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::wkt::make_payment`,
      arguments: [
        tx.object(faucetObject),
        tx.object(coinId),
        tx.pure.address(recipient),
        tx.pure.u64(amount)
      ]
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Payment made successfully', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('Failed to make payment', error);
            const parsedError = parseWKTError(error);
            reject(parsedError);
          }
        }
      );
    });
  };

  // Redeem badge for tokens
  const redeemBadge = (badgeId: string) => {
    if (!account) {
      return Promise.reject(parseWKTError(new Error("No account connected")));
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::wkt::redeem_badge`,
      arguments: [tx.object(faucetObject), tx.object(badgeId)]
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Badge redeemed successfully', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('Failed to redeem badge', error);
            const parsedError = parseWKTError(error);
            reject(parsedError);
          }
        }
      );
    });
  };

  // Admin functions
  const addCouponCode = (code: string) => {
    if (!account) {
      return Promise.reject(parseWKTError(new Error("No account connected")));
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::wkt::add_coupon_code`,
      arguments: [tx.object(faucetObject), tx.pure.string(code)]
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Coupon code added successfully', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('Failed to add coupon code', error);
            const parsedError = parseWKTError(error);
            reject(parsedError);
          }
        }
      );
    });
  };

  const removeCouponCode = (code: string) => {
    if (!account) {
      return Promise.reject(parseWKTError(new Error("No account connected")));
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::wkt::remove_coupon_code`,
      arguments: [tx.object(faucetObject), tx.pure.string(code)]
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Coupon code removed successfully', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('Failed to remove coupon code', error);
            const parsedError = parseWKTError(error);
            reject(parsedError);
          }
        }
      );
    });
  };

  const setAutoBadgeConfig = (workshopId: string, url: string) => {
    if (!account) {
      return Promise.reject(parseWKTError(new Error("No account connected")));
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::wkt::set_auto_badge_config`,
      arguments: [tx.object(faucetObject), tx.pure.string(workshopId), tx.pure.string(url)]
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Auto badge config set successfully', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('Failed to set auto badge config', error);
            const parsedError = parseWKTError(error);
            reject(parsedError);
          }
        }
      );
    });
  };

  const mintBadge = (recipient: string, workshopId: string, url: string) => {
    if (!account) {
      return Promise.reject(parseWKTError(new Error("No account connected")));
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::wkt::mint_badge`,
      arguments: [
        tx.object(faucetObject),
        tx.pure.address(recipient),
        tx.pure.string(workshopId),
        tx.pure.string(url)
      ]
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Badge minted successfully', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('Failed to mint badge', error);
            const parsedError = parseWKTError(error);
            reject(parsedError);
          }
        }
      );
    });
  };

  return {
    account,
    packageId,
    faucetObject,
    client,
    loading,
    setLoading,
    checkIsAdmin,
    checkHasClaimed,
    checkHasRedeemedBadge,
    checkCouponValidity,
    getWKTBalance,
    getWorkshopBadges,
    getAvailableCoupons,
    claimTokens,
    claimWithCoupon,
    makePayment,
    redeemBadge,
    addCouponCode,
    removeCouponCode,
    setAutoBadgeConfig,
    mintBadge
  };
};