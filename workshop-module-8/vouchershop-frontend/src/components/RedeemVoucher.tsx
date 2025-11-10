import { useState, useEffect } from "react";
import { useVoucherShop } from "../hooks/useVoucherShop";
import Button from "./molecules/Button";
import { VoucherShopError } from "../utils/errorHandling";
import { useCelebration } from "../contexts/CelebrationContext";
import Tooltip from "./molecules/Tooltip";

export default function RedeemVoucher({ nftId }: { nftId: number }) {
  const { redeemVoucher, validateRedeemVoucher, checkVoucherStatus, account, getAvailableNFTs } = useVoucherShop();
  const { triggerCelebration } = useCelebration();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState<VoucherShopError | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<VoucherShopError | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [nftMetadata, setNftMetadata] = useState<any>(null);

  // Pre-validate on component mount and when nftId changes
  useEffect(() => {
    const validate = async () => {
      setIsValidating(true);
      try {
        const validation = await validateRedeemVoucher(nftId);
        if (!validation.canProceed && validation.error) {
          setValidationError(validation.error);
        } else {
          setValidationError(null);
        }

        // Get NFT metadata for celebration
        const nfts = await getAvailableNFTs();
        const selectedNft = nfts.find(nft => nft.id === nftId);
        setNftMetadata(selectedNft);
      } catch (err) {
        console.error('Validation error:', err);
        setValidationError({
          code: 0,
          message: "Validation failed",
          userFriendlyMessage: "Unable to validate transaction. Please try again.",
          suggestions: ["Refresh the page", "Check your internet connection"]
        });
      } finally {
        setIsValidating(false);
      }
    };

    if (account?.address && nftId) {
      validate();
    }
  }, [account?.address, nftId]);

  const handleRedeem = async () => {
    setIsRedeeming(true);
    setError(null);
    setSuccess(false);
    
    try {
      const validation = await validateRedeemVoucher(nftId);
      if (!validation.canProceed && validation.error) {
        setError(validation.error);
        return;
      }

      await redeemVoucher(nftId);
      setSuccess(true);

      // Trigger celebration with NFT details
      triggerCelebration({
        title: "🎊 NFT Redeemed! 🎊",
        message: "Amazing! You've successfully redeemed your voucher and received an exclusive NFT. Check your wallet!",
        badge: nftMetadata ? {
          id: nftMetadata.id,
          name: nftMetadata.name,
          image_uri: nftMetadata.image_uri,
          description: nftMetadata.description
        } : undefined
      });

      // Refresh voucher status after redeem
      if (account?.address) {
        await checkVoucherStatus(account.address);
      }
    } catch (err) {
      const voucherError = err as VoucherShopError;
      setError(voucherError);
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isValidating) {
    return (
      <div style={{ padding: "1rem", textAlign: "center", color: "#a0aec0" }}>
        ⏳ Validating redemption for NFT #{nftId}...
      </div>
    );
  }

  if (validationError) {
    return (
      <div style={{ 
        padding: "1rem", 
        border: "1px solid #ff6b6b", 
        borderRadius: "12px", 
        backgroundColor: "rgba(255, 107, 107, 0.1)",
        maxWidth: "400px"
      }}>
        <h4 style={{ color: "#ff6b6b", margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ⚠️ Cannot Redeem Voucher
        </h4>
        <p style={{ color: "#ff6b6b", margin: "0 0 1rem 0" }}>{validationError.userFriendlyMessage}</p>
        {validationError.suggestions && validationError.suggestions.length > 0 && (
          <div>
            <strong style={{ color: "#ff6b6b" }}>Suggestions:</strong>
            <ul style={{ color: "#ff6b6b", marginTop: "0.25rem", paddingLeft: "1rem" }}>
              {validationError.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <Tooltip content={`Redeem your voucher to receive NFT Template #${nftId}`}>
        <div>
          <Button 
            onClick={handleRedeem} 
            disabled={isRedeeming}
            loading={isRedeeming}
            style={{ 
              background: "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600"
            }}
          >
            {isRedeeming ? "Redeeming..." : `🎨 Redeem for NFT #${nftId}`}
          </Button>
        </div>
      </Tooltip>
      
      {error && (
        <div style={{ 
          marginTop: "1rem", 
          padding: "1rem", 
          border: "1px solid #ff6b6b", 
          borderRadius: "12px", 
          backgroundColor: "rgba(255, 107, 107, 0.1)",
          maxWidth: "400px"
        }}>
          <h4 style={{ color: "#ff6b6b", margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            ⚠️ Error {error.code > 0 ? `(Code: ${error.code})` : ''}
          </h4>
          <p style={{ color: "#ff6b6b", margin: "0 0 1rem 0" }}>{error.userFriendlyMessage}</p>
          {error.suggestions && error.suggestions.length > 0 && (
            <div>
              <strong style={{ color: "#ff6b6b" }}>What you can do:</strong>
              <ul style={{ color: "#ff6b6b", marginTop: "0.25rem", paddingLeft: "1rem" }}>
                {error.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {success && (
        <div style={{ 
          marginTop: "1rem", 
          padding: "1rem", 
          border: "1px solid #51cf66", 
          borderRadius: "12px", 
          backgroundColor: "rgba(81, 207, 102, 0.1)",
          maxWidth: "400px"
        }}>
          <p style={{ color: "#51cf66", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
            ✅ NFT redeemed successfully! Check your wallet for the new NFT.
          </p>
        </div>
      )}
    </div>
  );
}