// src/components/RedeemVoucher.tsx
import { useState, useEffect } from "react";
import { useVoucherShop } from "../hooks/useVoucherShop";
import Button from "./molecules/Button";
import { VoucherShopError } from "../utils/errorHandling";

export default function RedeemVoucher({ nftId }: { nftId: number }) {
  const { redeemVoucher, validateRedeemVoucher, checkVoucherStatus, account } = useVoucherShop();
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState<VoucherShopError | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<VoucherShopError | null>(null);
  const [isValidating, setIsValidating] = useState(true);

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
      // Double-check validation before proceeding
      const validation = await validateRedeemVoucher(nftId);
      if (!validation.canProceed && validation.error) {
        setError(validation.error);
        return;
      }

      await redeemVoucher(nftId);
      setSuccess(true);

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
    return <div>Checking if you can redeem NFT #{nftId}...</div>;
  }

  if (validationError) {
    return (
      <div style={{ padding: "1rem", border: "1px solid #ff6b6b", borderRadius: "8px", backgroundColor: "#ffe0e0" }}>
        <h4 style={{ color: "#d63031", margin: "0 0 0.5rem 0" }}>Cannot Redeem Voucher</h4>
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
      <Button onClick={handleRedeem} disabled={isRedeeming}>
        {isRedeeming ? "Redeeming..." : `Redeem Voucher for NFT #${nftId}`}
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
            ✅ NFT redeemed successfully! Check your wallet for the new NFT.
          </p>
        </div>
      )}
    </div>
  );
}