import { useEffect, useState } from "react";
import { Flex, Card, Text, Box } from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import Button from "./molecules/Button";
import { WorkshopBadge } from "../types";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import Tooltip from "./molecules/Tooltip";

export default function RedeemBadge() {
  const { account, redeemBadge, getWorkshopBadges, checkHasRedeemedBadge } =
    useWKTContract();
  const [badges, setBadges] = useState<WorkshopBadge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [hasRedeemed, setHasRedeemed] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (account?.address) {
        try {
          const [userBadges, redeemedStatus] = await Promise.all([
            getWorkshopBadges(account.address),
            checkHasRedeemedBadge(account.address),
          ]);
          setBadges(userBadges);
          setHasRedeemed(redeemedStatus);
        } catch (error) {
          console.error("Failed to load badge data:", error);
        }
      }
    };
    fetchData();
  }, [account?.address]);

  const handleRedeem = async () => {
    if (!account || !selectedBadge) return;

    setLoading(true);
    setMessage("");
    try {
      await redeemBadge(selectedBadge);
      setMessage("🎉 Badge redeemed successfully! You received 30 WKT tokens.");
      setSelectedBadge("");
      setHasRedeemed(true);

      // Refresh badges
      const userBadges = await getWorkshopBadges(account.address);
      setBadges(userBadges);
    } catch (error) {
      console.error("Failed to redeem badge:", error);
      setMessage("⚠️ Failed to redeem badge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Early returns for states with clear user instructions:
  if (hasRedeemed) {
    return (
      <Flex direction="column" align="center" gap="6" style={{ padding: 20 }}>
        <Card
          style={{
            padding: 24,
            background: "#1a1a1a",
            maxWidth: 420,
            textAlign: "center",
            borderRadius: 12,
          }}
        >
          <FiCheckCircle
            size={48}
            color="#48bb78"
            style={{ marginBottom: 12 }}
          />
          <Text
            size="5"
            weight="bold"
            style={{ marginBottom: 16, display: "block" }}
          >
            You have already redeemed a badge.
          </Text>
          <Text
            size="4"
            style={{ marginBottom: 20, color: "#a0aec0", display: "block" }}
          >
            Each badge can only be redeemed once. Continue exploring your badge
            gallery or dashboard.
          </Text>
          <Link to="/">
            <Button style={{ width: "100%", fontWeight: "600" }}>
              <FiArrowLeft style={{ marginRight: 8 }} /> Back to Dashboard
            </Button>
          </Link>
        </Card>
      </Flex>
    );
  }

  if (!badges.length) {
    return (
      <Flex direction="column" align="center" gap="6" style={{ padding: 20 }}>
        <Card
          style={{
            padding: 24,
            background: "#1a1a1a",
            maxWidth: 420,
            textAlign: "center",
            borderRadius: 12,
          }}
        >
          <FiAlertCircle
            size={48}
            color="#f56565"
            style={{ marginBottom: 12 }}
          />
          <Text
            size="5"
            weight="bold"
            style={{ marginBottom: 16, display: "block" }}
          >
            No Badges to Redeem
          </Text>
          <Text
            size="4"
            style={{ marginBottom: 20, color: "#a0aec0", display: "block" }}
          >
            You currently do not own any workshop badges. Earn badges by
            participating in workshops to redeem tokens.
          </Text>
          <Link to="/">
            <Button style={{ width: "100%", fontWeight: "600" }}>
              <FiArrowLeft style={{ marginRight: 8 }} /> Back to Dashboard
            </Button>
          </Link>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex direction="column" align="center" gap="6" style={{ padding: 20 }}>
      <Card
        style={{
          padding: 24,
          background: "#1a1a1a",
          minWidth: 320,
          maxWidth: 460,
          borderRadius: 12,
        }}
      >
        <Flex align="center" gap="12" style={{ marginBottom: 20 }}>
          <FiShield size={32} color="#805ad5" />
          <Text size="6" weight="bold" style={{ color: "#e2e8f0" }}>
            Redeem Your Badge
          </Text>
        </Flex>

        <Text
          size="4"
          style={{ marginBottom: 24, color: "#a0aec0", lineHeight: 1.5 }}
        >
          Select one of your earned workshop badges from the dropdown and redeem
          it for 30 WKT tokens. Each badge can only be redeemed once.
        </Text>

        <select
          value={selectedBadge}
          onChange={(e) => setSelectedBadge(e.target.value)}
          style={{
            marginBottom: 24,
            marginTop: 18,
            padding: "12px 14px",
            background: "#2a2a2a",
            color: "white",
            borderRadius: 8,
            width: "100%",
            fontSize: 16,
            border: "1px solid #444",
            transition: "border-color 0.2s ease",
          }}
          aria-label="Select badge to redeem"
        >
          <option value="">-- Select a badge to redeem --</option>
          {badges.map((badge) => (
            <option key={badge.id} value={badge.id}>
              Badge ID: {badge.workshop_id}
            </option>
          ))}
        </select>

        <Tooltip
          content={
            badges.length === 0
              ? "You don't have any badges to redeem. Participate in workshops to earn badges"
              : "Redeem a workshop badge for 30 WKT tokens"
          }
        >
          <div>
            <Button
              onClick={handleRedeem}
              disabled={loading || !account || !selectedBadge}
              style={{ width: "100%", fontWeight: "600" }}
              aria-busy={loading}
              aria-disabled={loading || !account || !selectedBadge}
            >
              {loading ? "Redeeming..." : "Redeem for 30 WKT"}
            </Button>
          </div>
        </Tooltip>

        {message && (
          <Text
            color={message.toLowerCase().includes("success") ? "green" : "red"}
            size="3"
            style={{ marginTop: 20, fontWeight: 600 }}
            role="alert"
          >
            {message}
          </Text>
        )}

        <Box style={{ marginTop: 32, textAlign: "center" }}>
          <Link to="/">
            <Button style={{ fontWeight: "600", width: 260 }}>
              <FiArrowLeft style={{ marginRight: 8 }} />
              Back to Dashboard
            </Button>
          </Link>
        </Box>
      </Card>
    </Flex>
  );
}
