// src/components/ClaimVoucher.tsx
import { useState, useEffect } from "react";
import { useVoucherShop } from "../hooks/useVoucherShop";
import Button from "./molecules/Button";
import { VoucherShopError } from "../utils/errorHandling";

export default function ClaimVoucher() {
  const { claimVoucher, validateClaimVoucher, checkVoucherStatus, account } = useVoucherShop();
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
      // Double-check validation before proceeding
      const validation = await validateClaimVoucher();
      if (!validation.canProceed && validation.error) {
        setError(validation.error);
        return;
      }

      await claimVoucher();
      setSuccess(true);

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
    return <div>Checking if you can claim a voucher...</div>;
  }

  if (validationError) {
    return (
      <div style={{ padding: "1rem", border: "1px solid #ff6b6b", borderRadius: "8px", backgroundColor: "#ffe0e0" }}>
        <h4 style={{ color: "#d63031", margin: "0 0 0.5rem 0" }}>Cannot Claim Voucher</h4>
        <p style={{ color: "#d63031", margin: "0 0 1rem 0" }}>{validationError.userFriendlyMessage}</p>
        {validationError.suggestions && validationError.suggestions.length > 0 && (
          <div>
            <strong style={{ color: "#d63031" }}>Suggestions:</strong>
            <ul style={{ color: "#d63031", marginTop: "0.25rem" }}>
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
    <div>
      <Button onClick={handleClaim} disabled={isClaiming}>
        {isClaiming ? "Claiming..." : "Confirm Claim"}
      </Button>
      
      {error && (
        <div style={{ 
          marginTop: "1rem", 
          padding: "1rem", 
          border: "1px solid #ff6b6b", 
          borderRadius: "8px", 
          backgroundColor: "#ffe0e0" 
        }}>
          <h4 style={{ color: "#d63031", margin: "0 0 0.5rem 0" }}>
            Error {error.code > 0 ? `(Code: ${error.code})` : ''}
          </h4>
          <p style={{ color: "#d63031", margin: "0 0 1rem 0" }}>{error.userFriendlyMessage}</p>
          {error.suggestions && error.suggestions.length > 0 && (
            <div>
              <strong style={{ color: "#d63031" }}>What you can do:</strong>
              <ul style={{ color: "#d63031", marginTop: "0.25rem" }}>
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
          border: "1px solid #27ae60", 
          borderRadius: "8px", 
          backgroundColor: "#d5f4e6" 
        }}>
          <p style={{ color: "#27ae60", margin: 0 }}>
            ✅ Voucher claimed successfully! You can now redeem it for an NFT.
          </p>
        </div>
      )}
    </div>
  );
}