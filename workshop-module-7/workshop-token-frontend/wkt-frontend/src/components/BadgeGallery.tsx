import { Flex, Card, Text} from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import { useEffect, useState } from "react";
import { WorkshopBadge } from "../types";
import Loading from "./molecules/Loading";

export default function BadgeGallery() {
  const { account, getWorkshopBadges } = useWKTContract();
  const [badges, setBadges] = useState<WorkshopBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (account?.address) {
        const userBadges = await getWorkshopBadges(account.address);
        setBadges(userBadges);
      }
      setLoading(false);
    };
    fetchBadges();
  }, [account?.address]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Flex direction="column" align="center" gap="4" style={{ padding: "20px" }}>
      <Text size="6" weight="bold">Your Workshop Badges</Text>
      
      {badges.length === 0 ? (
        <Card style={{ padding: "20px", background: "#1a1a1a" }}>
          <Text>You don't have any workshop badges yet.</Text>
        </Card>
      ) : (
        <Flex wrap="wrap" gap="6" justify="center">
  {badges.map(badge => (
    <Card
      key={badge.id}
      style={{
        padding: "20px",
        background: "#1a1a1a",
        width: "250px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px" // consistent spacing between elements
      }}
    >
      <img
        src={badge.url}
        alt={badge.workshop_id}
        style={{
          width: "100%",
          height: "150px",
          objectFit: "contain",
          borderRadius: "8px",
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://via.placeholder.com/150";
        }}
      />
      <Text size="4" weight="bold" align="center">
        Workshop: {badge.workshop_id}
      </Text>
      <Text size="3" align="center">
        Minted on: {new Date(parseInt(badge.minted_at)).toLocaleDateString()}
      </Text>
      <Text size="2" style={{ wordBreak: "break-all" }} align="center">
        ID: {badge.id.slice(0, 8)}...{badge.id.slice(-8)}
      </Text>
    </Card>
  ))}
</Flex>

      )}
    </Flex>
  );
}