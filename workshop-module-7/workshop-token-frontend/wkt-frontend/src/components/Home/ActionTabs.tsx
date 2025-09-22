import { Flex, Text, Card } from "@radix-ui/themes";
import * as Tabs from "@radix-ui/react-tabs";
import { Link } from "react-router-dom";
import Button from "../molecules/Button";
import { FiArrowDown, FiGift, FiCreditCard, FiAward } from "react-icons/fi";
import Tooltip from "../molecules/Tooltip";
import { ActionTabsProps } from "../../types";

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
  textSecondary: "#a0aec0",
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
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
  width: "100%",
  color: colors.textPrimary,
  transition: "all 0.3s ease",
};

// Tab styles
const tabButtonBaseStyle = {
  flex: 1,
  padding: "16px 0",
  background: "transparent",
  border: "none",
  color: colors.textSecondary,
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "center" as const,
  fontSize: 16,
  borderBottom: "2px solid transparent",
  transition: "all 0.3s ease",
  userSelect: "none" as const,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

export default function ActionTabs({
  selectedTab,
  setSelectedTab,
  hasClaimed,
  hasRedeemed,
  totalBalance,
  badges,
}: ActionTabsProps) {
  const getTabStyle = (tab: "tab1" | "tab2") => ({
    ...tabButtonBaseStyle,
    color: selectedTab === tab ? colors.primaryLight : colors.textSecondary,
    borderBottom:
      selectedTab === tab
        ? `2px solid ${colors.primaryLight}`
        : "2px solid transparent",
    fontWeight: selectedTab === tab ? 700 : 600,
    background: selectedTab === tab ? "rgba(123, 97, 255, 0.1)" : "transparent",
  });

  return (
    <Tabs.Root
      value={selectedTab}
      onValueChange={(value) => setSelectedTab(value as "tab1" | "tab2")}
      style={{ width: "100%" }}
    >
      <Tabs.List
        aria-label="Dashboard Sections"
        style={{
          display: "flex",
          gap: 0,
          borderBottom: `1px solid ${colors.border}`,
          marginBottom: 24,
          userSelect: "none",
          background: colors.cardBackground,
          borderRadius: "12px 12px 0 0",
          padding: "0 8px",
        }}
      >
        <Tabs.Trigger value="tab1" style={getTabStyle("tab1")}>
          <FiArrowDown size={18} />
          Tokens & Payments
        </Tabs.Trigger>

        <Tabs.Trigger value="tab2" style={getTabStyle("tab2")}>
          <FiGift size={18} />
          Badges & Rewards
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="tab1" style={{ position: "relative" }}>
        <Card style={cardStyle}>
          <Flex direction="column" gap="4">
            <Text size="5" weight="bold" style={{ color: colors.textPrimary }}>
              Token Claims & Payments
            </Text>
            <Text
              size="3"
              style={{ lineHeight: 1.5, color: colors.textSecondary }}
            >
              Claim your daily tokens, redeem bonus tokens using coupons, or
              send tokens to others within the network.
            </Text>

            <Flex gap="4" wrap="wrap" justify="start" style={{ marginTop: 16 }}>
              <Tooltip
                content={
                  hasClaimed
                    ? "You've already claimed tokens today. Come back tomorrow!"
                    : "Claim 10 WKT tokens daily. Available once every 24 hours."
                }
              >
                <Link to="/claim-tokens" style={{ textDecoration: "none" }}>
                  <Button
                    disabled={hasClaimed}
                    style={{
                      color: "white",
                      minWidth: 180,
                      padding: "14px 20px",
                      fontSize: 16,
                      background: hasClaimed
                        ? colors.textSecondary
                        : "linear-gradient(135deg, #805ad5 0%, #9f7aea 100%)",
                      opacity: hasClaimed ? 0.6 : 1,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FiArrowDown style={{ marginRight: 8 }} />
                    Claim Daily Tokens
                  </Button>
                </Link>
              </Tooltip>

              <Tooltip content="Redeem a coupon code to claim additional WKT tokens">
                <Link to="/claim-coupon" style={{ textDecoration: "none" }}>
                  <Button
                    style={{
                      minWidth: 180,
                      padding: "14px 20px",
                      fontSize: 16,
                      background:
                        "linear-gradient(135deg, #0bc5ea 0%, #00b5d8 100%)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FiGift style={{ marginRight: 8 }} />
                    Claim with Coupon
                  </Button>
                </Link>
              </Tooltip>

              <Tooltip
                content={
                  totalBalance === BigInt(0)
                    ? "You need WKT tokens in your wallet to make payments"
                    : "Send WKT tokens to another wallet address"
                }
              >
                <Link to="/make-payment" style={{ textDecoration: "none" }}>
                  <Button
                    disabled={totalBalance === BigInt(0)}
                    style={{
                      color: "white",
                      minWidth: 180,
                      padding: "14px 20px",
                      fontSize: 16,
                      background:
                        totalBalance === BigInt(0)
                          ? colors.textSecondary
                          : "linear-gradient(135deg, #805ad5 0%, #9f7aea 100%)",
                      opacity: totalBalance === BigInt(0) ? 0.6 : 1,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FiCreditCard style={{ marginRight: 8 }} />
                    Make Payment
                  </Button>
                </Link>
              </Tooltip>
            </Flex>
          </Flex>
        </Card>
      </Tabs.Content>

      <Tabs.Content value="tab2">
        <Card style={cardStyle}>
          <Flex direction="column" gap="4">
            <Text size="5" weight="bold" style={{ color: colors.textPrimary }}>
              Badges & Rewards
            </Text>
            <Text
              size="3"
              style={{ lineHeight: 1.5, color: colors.textSecondary }}
            >
              Redeem your earned badges for bonus tokens or explore your badge
              gallery to track your workshop achievements.
            </Text>

            <Flex gap="4" wrap="wrap" justify="start" style={{ marginTop: 16 }}>
              <Tooltip
                content={
                  hasRedeemed
                    ? "You've already redeemed a badge. Each badge can only be redeemed once"
                    : badges.length === 0
                      ? "You don't have any badges to redeem. Participate in workshops to earn badges"
                      : "Redeem a workshop badge for 30 WKT tokens"
                }
              >
                <Link to="/redeem-badge" style={{ textDecoration: "none" }}>
                  <Button
                    disabled={badges.length === 0 || hasRedeemed}
                    style={{
                      color: "white",
                      minWidth: 180,
                      padding: "14px 20px",
                      fontSize: 16,
                      background:
                        badges.length === 0 || hasRedeemed
                          ? colors.textSecondary
                          : "linear-gradient(135deg, #805ad5 0%, #9f7aea 100%)",
                      opacity: badges.length === 0 || hasRedeemed ? 0.6 : 1,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FiGift style={{ marginRight: 8 }} />
                    Redeem Badge
                  </Button>
                </Link>
              </Tooltip>

              <Tooltip content="View all the workshop badges you've earned">
                <Link to="/badge-gallery" style={{ textDecoration: "none" }}>
                  <Button
                    style={{
                      minWidth: 180,
                      padding: "14px 20px",
                      fontSize: 16,
                      background:
                        "linear-gradient(135deg, #0bc5ea 0%, #00b5d8 100%)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FiAward style={{ marginRight: 8 }} />
                    View Gallery
                  </Button>
                </Link>
              </Tooltip>
            </Flex>
          </Flex>
        </Card>
      </Tabs.Content>
    </Tabs.Root>
  );
}
