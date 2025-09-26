import { Flex, Text, Card } from "@radix-ui/themes";
import * as Tabs from "@radix-ui/react-tabs";
import { Link } from "react-router-dom";
import Button from "../molecules/Button";
import { FiArrowDown, FiGift, FiCreditCard, FiAward } from "react-icons/fi";
import Tooltip from "../molecules/Tooltip";
import { ActionTabsProps } from "../../types";
import "./HomeStyles.css";

export default function ActionTabs({
  selectedTab,
  setSelectedTab,
  hasClaimed,
  hasRedeemed,
  totalBalance,
  badges,
}: ActionTabsProps) {
  return (
    <Tabs.Root
      value={selectedTab}
      onValueChange={(value) => setSelectedTab(value as "tab1" | "tab2")}
      style={{ width: "100%" }}
    >
      <Tabs.List className="tabs-list">
        <Tabs.Trigger
          value="tab1"
          className={`tab-trigger ${selectedTab === "tab1" ? "active" : ""}`}
        >
          <FiArrowDown size={18} />
          Tokens & Payments
        </Tabs.Trigger>

        <Tabs.Trigger
          value="tab2"
          className={`tab-trigger ${selectedTab === "tab2" ? "active" : ""}`}
        >
          <FiGift size={18} />
          Badges & Rewards
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="tab1" style={{ position: "relative" }}>
        <Card className="card-base">
          <Flex direction="column" gap="4">
            <Text
              size="5"
              weight="bold"
              style={{ color: "var(--text-primary)" }}
            >
              Token Claims & Payments
            </Text>
            <Text
              size="3"
              style={{ lineHeight: 1.5, color: "var(--text-secondary-alt)" }}
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
                    className={`tab-button ${hasClaimed ? "disabled" : "primary-gradient"}`}
                  >
                    <FiArrowDown style={{ marginRight: 8 }} />
                    Claim Daily Tokens
                  </Button>
                </Link>
              </Tooltip>

              <Tooltip content="Redeem a coupon code to claim additional WKT tokens">
                <Link to="/claim-coupon" style={{ textDecoration: "none" }}>
                  <Button className="tab-button accent-gradient">
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
                    className={`tab-button ${totalBalance === BigInt(0) ? "disabled" : "primary-gradient"}`}
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
        <Card className="card-base">
          <Flex direction="column" gap="4">
            <Text
              size="5"
              weight="bold"
              style={{ color: "var(--text-primary)" }}
            >
              Badges & Rewards
            </Text>
            <Text
              size="3"
              style={{ lineHeight: 1.5, color: "var(--text-secondary-alt)" }}
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
                    className={`tab-button ${badges.length === 0 || hasRedeemed ? "disabled" : "primary-gradient"}`}
                  >
                    <FiGift style={{ marginRight: 8 }} />
                    Redeem Badge
                  </Button>
                </Link>
              </Tooltip>

              <Tooltip content="View all the workshop badges you've earned">
                <Link to="/badge-gallery" style={{ textDecoration: "none" }}>
                  <Button className="tab-button accent-gradient">
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
