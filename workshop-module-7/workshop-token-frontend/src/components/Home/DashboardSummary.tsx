import { Flex, Text, Card, Box, Heading } from "@radix-ui/themes";
import { DashboardSummaryProps } from "../../types";
import {
  FiUser,
  FiCreditCard,
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiPieChart,
} from "react-icons/fi";

import "./HomeStyles.css";

export default function DashboardSummary({
  account,
  totalBalance,
  badges,
  hasClaimed,
  hasRedeemed,
}: DashboardSummaryProps) {
  if (!account) {
    return (
      <Card className="card-dashboard-empty">
        <FiUser size={40} style={{ margin: "0 auto 16px", color: "#4a5568" }} />
        <Text
          size="6"
          weight="medium"
          style={{
            display: "block",
            marginBottom: 8,
            color: "var(--text-primary)",
          }}
        >
          Welcome to WKT Dashboard
        </Text>
        <Text size="4" style={{ color: "#718096" }}>
          Please connect your wallet to get started
        </Text>
      </Card>
    );
  }

  return (
    <Card className="card-base">
      <Flex direction="column" align="center" gap="2">
        <Box className="box-gradient-bg">
          <FiPieChart size={32} color="white" />
        </Box>
        <Heading size="7" className="heading-gradient-text">
          WKT Token Dashboard
        </Heading>
        <Text
          size="4"
          style={{ color: "var(--text-secondary)", textAlign: "center" }}
        >
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
          background: "var(--background-gradient5)",
        }}
      />
      <Flex direction="column" gap="4">
        <Text
          size="5"
          weight="bold"
          style={{ color: "var(--text-primary)", marginTop: 4 }}
        >
          Account Summary
        </Text>

        <Flex className="flex-account-summary">
          <FiUser size={20} color="var(--primary-light)" />
          <Text
            size="3"
            style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}
          >
            {account.address.slice(0, 8)}...{account.address.slice(-6)}
          </Text>
        </Flex>

        <Flex gap="4" wrap="wrap" style={{ marginTop: 8 }}>
          <Flex className="card-detail card-detail-1" gap="2">
            <Flex gap="2" align="center">
              <Box
                style={{
                  padding: 6,
                  background: "rgba(128, 90, 213, 0.2)",
                  borderRadius: 6,
                }}
              >
                <FiCreditCard size={16} color="var(--primary-light)" />
              </Box>
              <Text
                size="2"
                weight="medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Total Balance
              </Text>
            </Flex>
            <Text
              size="5"
              weight="bold"
              style={{ color: "var(--primary-light)" }}
            >
              {totalBalance.toString()} WKT
            </Text>
          </Flex>

          <Flex className="card-detail card-detail-2" gap="2">
            <Flex gap="2" align="center">
              <Box
                style={{
                  padding: 6,
                  background: "rgba(72, 187, 120, 0.2)",
                  borderRadius: 6,
                }}
              >
                <FiAward size={16} color="var(--success)" />
              </Box>
              <Text
                size="2"
                weight="medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Badges Earned
              </Text>
            </Flex>
            <Text size="5" weight="bold" style={{ color: "var(--success)" }}>
              {badges.length}
            </Text>
          </Flex>
        </Flex>

        <Flex gap="4" wrap="wrap">
          <Flex
            align="center"
            gap="2"
            style={{
              flex: 1,
              minWidth: 200,
              padding: "12px 16px",
              borderRadius: 12,
              backgroundColor: "var(--background-alt1)",
            }}
          >
            <Box
              className={
                hasClaimed
                  ? "status-badge status-badge-error"
                  : "status-badge status-badge-success"
              }
            >
              {hasClaimed ? (
                <FiXCircle size={18} color="var(--error)" />
              ) : (
                <FiCheckCircle size={18} color="var(--success)" />
              )}
            </Box>
            <Flex direction="column">
              <Text
                size="2"
                weight="medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Daily Claim
              </Text>
              <span
                className={
                  hasClaimed
                    ? "status-badge status-badge-error"
                    : "status-badge status-badge-success"
                }
              >
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

          <Flex
            align="center"
            gap="2"
            style={{
              flex: 1,
              minWidth: 200,
              padding: "12px 16px",
              backgroundColor: "var(--background-alt1)",
              borderRadius: 12,
            }}
          >
            <Box
              className={
                hasRedeemed
                  ? "status-badge status-badge-error"
                  : "status-badge status-badge-success"
              }
            >
              {hasRedeemed ? (
                <FiXCircle size={18} color="var(--error)" />
              ) : (
                <FiCheckCircle size={18} color="var(--success)" />
              )}
            </Box>
            <Flex direction="column">
              <Text
                size="2"
                weight="medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Badge Redemption
              </Text>
              <span
                className={
                  hasRedeemed
                    ? "status-badge status-badge-error"
                    : "status-badge status-badge-success"
                }
              >
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
