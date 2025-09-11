import { Flex, Card, Text } from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import Button from "./molecules/Button";
import { useState, useEffect } from "react";
import { WorkshopBadge } from "../types";

export default function RedeemBadge() {
  const { account, redeemBadge, getWorkshopBadges, checkHasRedeemedBadge } = useWKTContract();
  const [badges, setBadges] = useState<WorkshopBadge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasRedeemed, setHasRedeemed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (account?.address) {
        const [userBadges, redeemedStatus] = await Promise.all([
          getWorkshopBadges(account.address),
          checkHasRedeemedBadge(account.address)
        ]);
        setBadges(userBadges);
        setHasRedeemed(redeemedStatus);
      }
    };
    fetchData();
  }, [account?.address]);

  const handleRedeem = async () => {
    if (!account || !selectedBadge) return;
    
    setLoading(true);
    try {
      await redeemBadge(selectedBadge);
      setMessage("Badge redeemed successfully! Received 30 WKT tokens.");
      setSelectedBadge("");
      setHasRedeemed(true);
      
      // Refresh badges
      const userBadges = await getWorkshopBadges(account.address);
      setBadges(userBadges);
    } catch (error) {
      console.error("Failed to redeem badge:", error);
      setMessage("Failed to redeem badge");
    } finally {
      setLoading(false);
    }
  };

  if (hasRedeemed) {
    return (
      <Card style={{ padding: "20px", background: "#1a1a1a", margin: "20px" }}>
        <Text>You have already redeemed a badge.</Text>
      </Card>
    );
  }

  if (badges.length === 0) {
    return (
      <Card style={{ padding: "20px", background: "#1a1a1a", margin: "20px" }}>
        <Text>You don't have any badges to redeem.</Text>
      </Card>
    );
  }

  return (
    <Flex direction="column" align="center" gap="4" style={{ padding: "20px" }}>
      <Card style={{ padding: "20px", background: "#1a1a1a", minWidth: "300px" }}>
        <Text size="4" weight="bold">Redeem Badge</Text>
        <Text size="2">Redeem a workshop badge for 30 WKT tokens</Text>
        
        <select 
          value={selectedBadge} 
          onChange={(e) => setSelectedBadge(e.target.value)}
          style={{ margin: "15px 0", padding: "8px", background: "#2a2a2a", color: "white", border: "none", borderRadius: "4px" }}
        >
          <option value="">Select a badge</option>
          {badges.map(badge => (
            <option key={badge.id} value={badge.id}>
              {badge.workshop_id} Badge
            </option>
          ))}
        </select>
        
        <Button 
          onClick={handleRedeem} 
          disabled={loading || !account || !selectedBadge}
        >
          {loading ? "Redeeming..." : "Redeem for 30 WKT"}
        </Button>
        
        {message && (
          <Text color={message.includes("success") ? "green" : "red"} style={{ marginTop: "10px" }}>
            {message}
          </Text>
        )}
      </Card>
    </Flex>
  );
}