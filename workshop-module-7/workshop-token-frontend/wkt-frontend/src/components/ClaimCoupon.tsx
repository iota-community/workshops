import { useState } from "react";
import { Flex, Card, Text, Box } from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import Button from "./molecules/Button";
import { Link } from "react-router-dom";
import { FiGift, FiAlertCircle, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import Tooltip from "./molecules/Tooltip";

export default function ClaimCoupon() {
  const { account, claimWithCoupon, checkCouponValidity } = useWKTContract();
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleClaim = async () => {
    if (!account || !couponCode) return;

    setLoading(true);
    setMessage("");
    try {
      const isValid = await checkCouponValidity(couponCode, account.address);
      if (!isValid) {
        setMessage("⚠️ Invalid or already used coupon code.");
        setLoading(false);
        return;
      }

      await claimWithCoupon(couponCode);
      setMessage("🎉 Successfully claimed tokens with coupon!");
      setCouponCode("");
    } catch (error) {
      console.error("Failed to claim with coupon:", error);
      setMessage("⚠️ Failed to claim with coupon. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" align="center" gap="6" style={{ padding: 24, minHeight: "100vh" }}>
      <Card
        style={{
          padding: 32,
          background: "#1a1a1a",
          minWidth: 320,
          maxWidth: 460,
          borderRadius: 12,
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
        }}
        aria-live="polite"
      >
        <Flex justify="center" align="center" gap="12" style={{ marginBottom: 24 }}>
          <FiGift size={32} color="#805ad5" />
          <Text size="7" weight="bold" style={{ color: "#805ad5", margin: 0 }}>
            Claim with Coupon
          </Text>
        </Flex>

        <Text
          size="4"
          style={{
            marginBottom: 28,
            color: "#a0aec0",
            lineHeight: 1.5,
            maxWidth: 350,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Enter a valid coupon code to claim 10 WKT tokens. Each coupon can only be used once per user.
        </Text>

        <input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          style={{
            backgroundColor: "#2a2a2a",
            color: "white",
            borderRadius: 8,
            fontSize: 16,
            padding: "12px 16px",
            border: "1px solid #444",
            width: "100%",
            boxSizing: "border-box",
            marginBottom: 24,
          }}
          aria-label="Coupon code input"
          disabled={loading}
        />

        <Tooltip content="Redeem a coupon code to claim additional WKT tokens">
          <div>
          <Button
            onClick={handleClaim}
            disabled={loading || !account || !couponCode}
            style={{ width: "100%", fontWeight: 600, fontSize: 18, padding: "14px 0" }}
            aria-busy={loading}
            aria-disabled={loading || !account || !couponCode}
          >
            {loading ? "Claiming..." : "Claim with Coupon"}
          </Button>
          </div>
        </Tooltip>

        {message && (
          <Flex
            justify="center"
            align="center"
            gap="8"
            style={{ marginTop: 20 }}
            role="alert"
            aria-live="assertive"
          >
            {message.toLowerCase().includes("success") ? (
              <FiCheckCircle size={20} color="#48bb78" />
            ) : (
              <FiAlertCircle size={20} color="#f56565" />
            )}
            <Text
              size="4"
              color={message.toLowerCase().includes("success") ? "green" : "red"}
              weight="medium"
              style={{ margin: 0 }}
            >
              {message}
            </Text>
          </Flex>
        )}

        <Box style={{ marginTop: 40 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <Tooltip content="Return to the main dashboard">
              <div>
              <Button
                style={{
                  width: 180,
                  fontWeight: 600,
                  fontSize: 16,
                  padding: "12px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <FiArrowLeft size={20} />
                Back to Dashboard
              </Button>
              </div>
            </Tooltip>
          </Link>
        </Box>
      </Card>
    </Flex>
  );
}