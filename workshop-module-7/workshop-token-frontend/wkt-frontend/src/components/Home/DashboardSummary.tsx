import { Flex, Text, Card, Box,Heading } from "@radix-ui/themes";
import { FiUser, FiCreditCard, FiAward, FiCheckCircle, FiXCircle,FiPieChart } from "react-icons/fi";

// Dark theme color scheme
const colors = {
  primary: "#805ad5",
  primaryLight: "#9f7aea",
  success: "#48bb78",
  warning: "#ecc94b",
  error: "#f56565",
  background: "#1a202c",
  cardBackground: "#2d3748",
  textPrimary: "#e2e8f0",
  textSecondary: "#b5bec9ff",
  border: "#4a5568",
  accent1: "#0bc5ea",
  accent2: "#f56565",
};

// Card style
const cardStyle = {
  background: colors.cardBackground,
  padding: 28,
  borderRadius: 16,
  border: "1px solid",
  borderColor: colors.border,
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
  width: "100%",
  color: colors.textPrimary,
  transition: "all 0.3s ease",
};

// Status badge styles
const statusBadgeStyle = (status: boolean) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 20,
  fontSize: 14,
  fontWeight: 500,
  background: status ? "rgba(245, 101, 101, 0.15)" : "rgba(72, 187, 120, 0.15)",
  color: status ? colors.error : colors.success,
  border: status ? "1px solid rgba(245, 101, 101, 0.3)" : "1px solid rgba(72, 187, 120, 0.3)",
});

interface DashboardSummaryProps {
  account: any;
  totalBalance: bigint;
  badges: any[];
  hasClaimed: boolean;
  hasRedeemed: boolean;
}

export default function DashboardSummary({
  account,
  totalBalance,
  badges,
  hasClaimed,
  hasRedeemed
}: DashboardSummaryProps) {
  if (!account) {
    return (
      <Card
        style={{
          padding: 40,
          width: "100%",
          maxWidth: 600,
          textAlign: "center",
          borderRadius: 12,
          background: "linear-gradient(135deg, #1a1f2d 0%, #131722 100%)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
          border: "1px solid #2d3748",
          color: "#a0aec0",
        }}
      >
        <FiUser size={40} style={{ margin: "0 auto 16px", color: "#4a5568" }} />
        <Text size="6" weight="medium" style={{ display: "block", marginBottom: 8, color: "#e2e8f0" }}>
          Welcome to WKT Dashboard
        </Text>
        <Text size="4" style={{ color: "#718096" }}>
          Please connect your wallet to get started
        </Text>
      </Card>
    );
  }

  return (
    <Card style={{ ...cardStyle, position: "relative", overflow: "hidden" }}>

        <Flex direction="column" align="center" gap="2">
        <Box style={{ 
          background: "linear-gradient(135deg, #805ad5 0%, #9f7aea 100%)", 
          padding: 12, 
          borderRadius: 12,
          marginBottom: 8,
          boxShadow: "0 0 20px rgba(159, 122, 234, 0.4)"
        }}>
          <FiPieChart size={32} color="white" />
        </Box>
        <Heading
          size="7"
          style={{
            color: colors.textPrimary,
            fontWeight: 700,
            textAlign: "center",
            background: "linear-gradient(90deg, #9f7aea, #0bc5ea)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          WKT Token Dashboard
        </Heading>
        <Text size="4" style={{ color: colors.textSecondary, textAlign: "center" }}>
          Manage your tokens, badges, and rewards
        </Text>
      </Flex>

      <Box 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "linear-gradient(90deg, #805ad5 0%, #9f7aea 50%, #0bc5ea 100%)"
        }}
      />
      <Flex direction="column" gap="4">
        <Text size="5" weight="bold" style={{ color: colors.textPrimary, marginTop: 4 }}>
          Account Summary
        </Text>
        
        <Flex gap="4" align="center" style={{ padding: "12px 16px", background: "#2a3142", borderRadius: 12 }}>
          <FiUser size={20} color={colors.primaryLight} />
          <Text size="3" style={{ color: colors.textSecondary, fontFamily: "monospace" }}>
            {account.address.slice(0, 8)}...{account.address.slice(-6)}
          </Text>
        </Flex>
        
        <Flex gap="4" wrap="wrap" style={{ marginTop: 8 }}>
          <Flex 
            direction="column" 
            style={{ 
              flex: 1, 
              minWidth: 200, 
              padding: 16, 
              background: "linear-gradient(135deg, #2d3748 0%, #322659 100%)", 
              borderRadius: 12,
              border: "1px solid #44337a"
            }}
            gap="2"
          >
            <Flex gap="2" align="center">
              <Box style={{ padding: 6, background: "rgba(128, 90, 213, 0.2)", borderRadius: 6 }}>
                <FiCreditCard size={16} color={colors.primaryLight} />
              </Box>
              <Text size="2" weight="medium" style={{ color: colors.textSecondary }}>
                Total Balance
              </Text>
            </Flex>
            <Text size="5" weight="bold" style={{ color: colors.primaryLight }}>
              {totalBalance.toString()} WKT
            </Text>
          </Flex>
          
          <Flex 
            direction="column" 
            style={{ 
              flex: 1, 
              minWidth: 200, 
              padding: 16, 
              background: "linear-gradient(135deg, #2d3748 0%, #22543d 100%)", 
              borderRadius: 12,
              border: "1px solid #2f855a"
            }}
            gap="2"
          >
            <Flex gap="2" align="center">
              <Box style={{ padding: 6, background: "rgba(72, 187, 120, 0.2)", borderRadius: 6 }}>
                <FiAward size={16} color={colors.success} />
              </Box>
              <Text size="2" weight="medium" style={{ color: colors.textSecondary }}>
                Badges Earned
              </Text>
            </Flex>
            <Text size="5" weight="bold" style={{ color: colors.success }}>
              {badges.length}
            </Text>
          </Flex>
        </Flex>
        
        <Flex gap="4" wrap="wrap">
          <Flex align="center" gap="2" style={{ flex: 1, minWidth: 200, padding: "12px 16px", background: "#2a3142", borderRadius: 12 }}>
            <Box style={{ padding: 8, background: hasClaimed ? "rgba(245, 101, 101, 0.2)" : "rgba(72, 187, 120, 0.2)", borderRadius: 6 }}>
              {hasClaimed ? <FiXCircle size={18} color={colors.error} /> : <FiCheckCircle size={18} color={colors.success} />}
            </Box>
            <Flex direction="column">
              <Text size="2" weight="medium" style={{ color: colors.textSecondary }}>
                Daily Claim
              </Text>
              <span style={statusBadgeStyle(hasClaimed)}>
                {hasClaimed ? (
                  <>
                    <FiXCircle size={14} />
                    Already claimed
                  </>
                ) : (
                  <>
                    <FiCheckCircle size={14} />
                    Available
                  </>
                )}
              </span>
            </Flex>
          </Flex>
          
          <Flex align="center" gap="2" style={{ flex: 1, minWidth: 200, padding: "12px 16px", background: "#2a3142", borderRadius: 12 }}>
            <Box style={{ padding: 8, background: hasRedeemed ? "rgba(245, 101, 101, 0.2)" : "rgba(72, 187, 120, 0.2)", borderRadius: 6 }}>
              {hasRedeemed ? <FiXCircle size={18} color={colors.error} /> : <FiCheckCircle size={18} color={colors.success} />}
            </Box>
            <Flex direction="column">
              <Text size="2" weight="medium" style={{ color: colors.textSecondary }}>
                Badge Redemption
              </Text>
              <span style={statusBadgeStyle(hasRedeemed)}>
                {hasRedeemed ? (
                  <>
                    <FiXCircle size={14} />
                    Already Redeemed
                  </>
                ) : (
                  <>
                    <FiCheckCircle size={14} />
                    Available
                  </>
                )}
              </span>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}