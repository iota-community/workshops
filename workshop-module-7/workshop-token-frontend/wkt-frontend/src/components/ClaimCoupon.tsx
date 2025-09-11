import { Flex, Card, Text, TextField } from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import Button from "./molecules/Button";
import { useState } from "react";

export default function ClaimCoupon() {
  const { account, claimWithCoupon, checkCouponValidity } = useWKTContract();
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleClaim = async () => {
    if (!account || !couponCode) return;
    
    setLoading(true);
    try {
      const isValid = await checkCouponValidity(couponCode, account.address);
      if (!isValid) {
        setMessage("Invalid coupon code");
        return;
      }
      
      await claimWithCoupon(couponCode);
      setMessage("Successfully claimed tokens with coupon!");
      setCouponCode("");
    } catch (error) {
      console.error("Failed to claim with coupon:", error);
      setMessage("Failed to claim with coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" align="center" gap="4" style={{ padding: "20px" }}>
      <Card style={{ padding: "20px", background: "#1a1a1a", minWidth: "300px" }}>
        <Text size="4" weight="bold">Claim with Coupon</Text>
        <Text size="2">Enter a valid coupon code to claim 10 WKT tokens</Text>
        
        <TextField.Root
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          style={{ margin: "15px 0" }}
        />
        
        <Button 
          onClick={handleClaim} 
          disabled={loading || !account || !couponCode}
        >
          {loading ? "Claiming..." : "Claim with Coupon"}
        </Button>
        
        {message && (
          <Text color={message.includes("Success") ? "green" : "red"} style={{ marginTop: "10px" }}>
            {message}
          </Text>
        )}
      </Card>
    </Flex>
  );
}