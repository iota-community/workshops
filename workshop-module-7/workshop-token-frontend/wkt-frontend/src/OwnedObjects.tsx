import { useEffect, useState } from "react";
import { Flex, Card, Text, Box, Badge } from "@radix-ui/themes";
import { useWKTContract } from "./hooks/useWKTContract";
import { TokenBalance, WorkshopBadge } from "./types";
import Loading from "./components/molecules/Loading";
import { FiDollarSign, FiAward, FiCalendar, FiHash } from "react-icons/fi";
import { Link } from "react-router-dom";


// Color scheme matching the dark theme
const colors = {
  primary: "#805ad5",
  success: "#48bb78",
  background: "#1a202c",
  cardBackground: "#2d3748",
  textPrimary: "#e2e8f0",
  textSecondary: "#a0aec0",
  border: "#4a5568",
};

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
          getWorkshopBadges(account.address),
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
    <Flex direction="column" gap="5" style={{ width: "100%", maxWidth: 800, marginTop: 40 }}>
      {/* Header */}
      <Text size="6" weight="bold" style={{ color: colors.textPrimary, marginBottom: 8 }}>
        Your Assets
      </Text>
      
      {/* Token Summary Card */}
      <Card
        style={{
          padding: 24,
          background: colors.cardBackground,
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Flex align="center" gap="3" style={{ marginBottom: 16 }}>
          <FiDollarSign size={24} color={colors.primary} />
          <Text size="4" weight="bold" style={{ color: colors.textPrimary }}>
            WKT Tokens
          </Text>
        </Flex>
        
        <Flex align="center" gap="3" style={{ marginBottom: 16 }}>
          <Text size="6" weight="bold" style={{ color: colors.primary }}>
            {totalBalance.toString()}
          </Text>
          <Text size="4" style={{ color: colors.textSecondary }}>
            WKT
          </Text>
        </Flex>
      </Card>

      {/* Badges Card */}
      <Card
        style={{
          padding: 24,
          background: colors.cardBackground,
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Flex align="center" gap="3" style={{ marginBottom: 16 }}>
          <FiAward size={24} color={colors.success} />
          <Text size="4" weight="bold" style={{ color: colors.textPrimary }}>
            Workshop Badges
          </Text>
          <Badge color="green" variant="soft" style={{ marginLeft: "auto" }}>
            {badges.length} earned
          </Badge>
        </Flex>

        {badges.length > 0 ? (
          <Flex wrap="wrap" gap="4">
            {badges.map((badge) => (

              <Link to="/redeem-badge" key={badge.id} style={{ textDecoration: 'none', width: "calc(50% - 8px)", minWidth: 240 }}>
  <Card
    style={{
      padding: 16,
      background: "#1a202c",
      borderRadius: 12,
      border: `1px solid ${colors.border}`,
      width: '100%',
      transition: "transform 0.2s ease, box-shadow 0.2s ease", // Enhanced transition
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
                <Flex direction="column" gap="3">
                  {badge.url ? (
                    <img
                      src={badge.url}
                      alt={badge.workshop_id}
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <Box
                      style={{
                        width: "100%",
                        height: 120,
                        backgroundColor: colors.border,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <FiAward size={32} color={colors.textSecondary} />
                    </Box>
                  )}
                  
                  <Flex direction="column" gap="2">
                    <Flex align="center" gap="2">
                      <FiHash size={14} color={colors.textSecondary} />
                      <Text size="2" weight="medium" style={{ color: colors.textPrimary }}>
                        Workshop #{badge.workshop_id}
                      </Text>
                    </Flex>
                    
                    <Flex align="center" gap="2">
                      <FiCalendar size={14} color={colors.textSecondary} />
                      <Text size="1" style={{ color: colors.textSecondary }}>
                        {new Date(parseInt(badge.minted_at)).toLocaleDateString()}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Card>
</Link>
            ))}
          </Flex>
        ) : (
          <Flex direction="column" align="center" gap="3" style={{ padding: "20px 0" }}>
            <Box
              style={{
                padding: 16,
                background: "rgba(160, 174, 192, 0.1)",
                borderRadius: 12
              }}
            >
              <FiAward size={24} color={colors.textSecondary} />
            </Box>
            <Text size="2" style={{ color: colors.textSecondary, textAlign: "center" }}>
              No workshop badges yet. Participate in workshops to earn badges!
            </Text>
          </Flex>
        )}
      </Card>
    </Flex>
  );
}