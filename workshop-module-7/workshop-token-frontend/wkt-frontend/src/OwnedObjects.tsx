import { Flex, Card, Text } from "@radix-ui/themes";
import { useWKTContract } from "./hooks/useWKTContract";
import { useEffect, useState } from "react";
import { TokenBalance, WorkshopBadge } from "./types";
import Loading from "./components/molecules/Loading";

export default function OwnedObjects() {
  const { account, getWKTBalance, getWorkshopBadges } = useWKTContract();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [badges, setBadges] = useState<WorkshopBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (account?.address) {
        const [userBalances, userBadges] = await Promise.all([
          getWKTBalance(account.address),
          getWorkshopBadges(account.address)
        ]);
        setBalances(userBalances);
        setBadges(userBadges);
      }
      setLoading(false);
    };
    fetchData();
  }, [account?.address]);

  if (loading) {
    return <Loading />;
  }

  const totalBalance = balances.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0));

  return (
    <Flex direction="column" gap="4" style={{ width: "100%", maxWidth: "800px", marginTop: "20px" }}>
      <Card style={{ padding: "20px", background: "#1a1a1a" }}>
        <Text size="5" weight="bold">Your Assets</Text>
        
        <div>
        <Text size="4" style={{ marginTop: "15px" }}>WKT Tokens: {totalBalance.toString()}</Text>
        </div>
        {balances.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            <Text size="3">Coin Objects:</Text>
            {balances.map(coin => (
              <Text key={coin.coinObjectId} size="2" style={{ display: "block", wordBreak: "break-all" }}>
                {coin.coinObjectId.slice(0, 10)}...: {coin.balance} WKT
              </Text>
            ))}
          </div>
        )}
      </Card>
      
      <Card style={{ padding: "20px", background: "#1a1a1a" }}>
        <Text size="4" weight="bold">Workshop Badges: {badges.length}</Text>
        
        {badges.length > 0 ? (
          <div style={{ marginTop: "10px" }}>
            {badges.map(badge => (
              <div key={badge.id} style={{ marginBottom: "10px", padding: "10px", background: "#2a2a2a", borderRadius: "5px" }}>
                <Text size="3" weight="bold">Workshop: {badge.workshop_id}</Text>
                <Text size="2" style={{ display: "block", wordBreak: "break-all" }}>
                  ID: {badge.id.slice(0, 10)}...
                </Text>
                <Text size="2">Minted: {new Date(parseInt(badge.minted_at)).toLocaleDateString()}</Text>
                {badge.url && (
                  <img 
                    src={badge.url} 
                    alt={badge.workshop_id} 
                    style={{ width: "100px", height: "100px", objectFit: "cover", marginTop: "10px", borderRadius: "5px" }}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <Text size="2" style={{ marginTop: "10px" }}>No workshop badges yet</Text>
        )}
      </Card>
    </Flex>
  );
}