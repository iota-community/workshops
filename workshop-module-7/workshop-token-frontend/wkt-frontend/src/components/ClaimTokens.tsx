import { Flex, Card, Text } from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import Button from "./molecules/Button";
import { useState } from "react";

export default function ClaimTokens() {
  const { account, claimTokens, checkHasClaimed } = useWKTContract();
  const [loading, setLoading] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [message, setMessage] = useState("");

  const handleClaim = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const claimedStatus = await checkHasClaimed(account.address);
      if (claimedStatus) {
        setHasClaimed(true);
        setMessage("You've already claimed your tokens today");
        return;
      }
      
      await claimTokens();
      setHasClaimed(true);
      setMessage("Successfully claimed 10 WKT tokens!");
    } catch (error) {
      console.error("Failed to claim tokens:", error);
      setMessage("Failed to claim tokens");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" align="center" gap="4" style={{ padding: "20px" }}>
      <Card style={{ padding: "20px", background: "#1a1a1a", minWidth: "300px" }}>
        <Text size="4" weight="bold">Claim Daily Tokens</Text>
        <Text size="2">Get 10 WKT tokens daily (once per day)</Text>
        
        {hasClaimed ? (
          <Text color="green" style={{ marginTop: "10px" }}>
            {message}
          </Text>
        ) : (
          <Button 
            onClick={handleClaim} 
            disabled={loading || !account}
            style={{ marginTop: "15px" }}
          >
            {loading ? "Claiming..." : "Claim 10 WKT"}
          </Button>
        )}
        
        {message && !hasClaimed && (
          <Text color="red" style={{ marginTop: "10px" }}>
            {message}
          </Text>
        )}
      </Card>
    </Flex>
  );
}