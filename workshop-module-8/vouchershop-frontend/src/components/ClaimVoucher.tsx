import { useState, useEffect } from "react";
import { useVoucherShop } from "../hooks/useVoucherShop";
import Button from "./molecules/Button";
import { VoucherShopError } from "../utils/errorHandling";
import { useCelebration } from "../contexts/CelebrationContext";
import Tooltip from "./molecules/Tooltip";

export default function ClaimVoucher() {
  const { claimVoucher, validateClaimVoucher, checkVoucherStatus, account } = useVoucherShop();
  const { triggerCelebration } = useCelebration();
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<VoucherShopError | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<VoucherShopError | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  // Pre-validate on component mount
  useEffect(() => {
    const validate = async () => {
      setIsValidating(true);
      try {
        const validation = await validateClaimVoucher();
        if (!validation.canProceed && validation.error) {
          setValidationError(validation.error);
        } else {
          setValidationError(null);
        }
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

    if (account?.address) {
      validate();
    }
  }, [account?.address]);

  const handleClaim = async () => {
    setIsClaiming(true);
    setError(null);
    setSuccess(false);
    
    try {
      const validation = await validateClaimVoucher();
      if (!validation.canProceed && validation.error) {
        setError(validation.error);
        return;
      }

      await claimVoucher();
      setSuccess(true);
      
      // Trigger celebration
      triggerCelebration({
        title: "🎉 Voucher Claimed! 🎉",
        message: "Congratulations! You've successfully claimed your voucher. You can now redeem it for an exclusive NFT.",
      });

      // Refresh voucher status after claiming
      if (account?.address) {
        await checkVoucherStatus(account.address);
      }
    } catch (err) {
      const voucherError = err as VoucherShopError;
      setError(voucherError);
    } finally {
      setIsClaiming(false);
    }
  };

  if (isValidating) {
    return (
      <div style={{ padding: "1rem", textAlign: "center", color: "#a0aec0" }}>
        ⏳ Checking if you can claim a voucher...
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
          ⚠️ Cannot Claim Voucher
        </h4>
        <p style={{ color: "#ff6b6b", margin: "0 0 1rem 0" }}>{validationError.userFriendlyMessage}</p>
        {validationError.suggestions && validationError.suggestions.length > 0 && (
          <div>
            <strong style={{ color: "#f5f10bff" }}>💡 Suggestions:</strong>
    <ul style={{ color: "#f5e90bdb", marginTop: "0.25rem", paddingLeft: "1rem" }}>
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
      <Tooltip content="Claim your exclusive voucher to redeem for limited edition NFTs">
        <div>
          <Button 
            onClick={handleClaim} 
            disabled={isClaiming}
            loading={isClaiming}
            style={{ 
              background: "linear-gradient(135deg, #4dabf7 0%, #3b82f6 100%)",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600"
            }}
          >
            {isClaiming ? "Claiming..." : "🎁 Claim Your Voucher"}
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
            ✅ Voucher claimed successfully! You can now redeem it for an NFT.
          </p>
        </div>
      )}
    </div>
  );
}