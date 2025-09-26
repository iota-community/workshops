import { useEffect, useState } from "react";
import { Flex, Card, Text } from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import { WorkshopBadge } from "../types";
import Loading from "./molecules/Loading";
import Tooltip from "./molecules/Tooltip";
import { FiArrowLeft, FiGift } from "react-icons/fi";
import Button from "./molecules/Button";
import { Link } from "react-router-dom";

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
    <Flex
      direction="column"
      align="center"
      gap="6"
      style={{ padding: 20, minHeight: "100vh" }}
    >
      <Text
        size="7"
        weight="bold"
        style={{ marginBottom: 24, textAlign: "center", color: "#51cf66" }}
      >
        Your Workshop Badges
      </Text>

      {badges.length === 0 ? (
        <Card
          style={{
            padding: 24,
            background: "#1a1a1a",
            maxWidth: 420,
            borderRadius: 12,
            textAlign: "center",
            color: "#a0aec0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          <Text
            size="5"
            weight="medium"
            style={{ marginBottom: 16, display: "block" }}
          >
            You don't have any workshop badges yet.
          </Text>
          <Text size="4" style={{ lineHeight: 1.5, display: "block" }}>
            Earn badges by participating in workshops and redeem them for
            tokens.
          </Text>
        </Card>
      ) : (
        <Flex
          wrap="wrap"
          gap="8"
          justify="center"
          style={{ width: "100%", maxWidth: 880 }}
        >
          {badges.map((badge) => (
            <Card
              key={badge.id}
              style={{
                padding: 20,
                background: "#1a1a1a",
                width: 260,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                color: "#d1d5db",
                userSelect: "none",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                const button = e.currentTarget.querySelector(
                  ".redeem-button-container",
                );
                if (button) (button as HTMLElement).style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                const button = e.currentTarget.querySelector(
                  ".redeem-button-container",
                );
                if (button) (button as HTMLElement).style.opacity = "0";
              }}
            >
              <img
                src={badge.url}
                alt={`Badge for ${badge.workshop_id}`}
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "contain",
                  borderRadius: 10,
                  backgroundColor: "#222",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/160?text=No+Image";
                }}
              />
              <Text
                size="5"
                weight="bold"
                align="center"
                style={{ color: "#cfd8dcff" }}
              >
                Workshop ID: {badge.workshop_id}
              </Text>
              <Text size="4" align="center" style={{ color: "#9ca3af" }}>
                Minted on:{" "}
                {new Date(parseInt(badge.minted_at)).toLocaleDateString()}
              </Text>
              <Text
                size="3"
                align="center"
                style={{
                  wordBreak: "break-all",
                  color: "#6b7280",
                  fontFamily: "monospace",
                }}
              >
                Badge ID: {badge.id.slice(0, 8)}...{badge.id.slice(-8)}
              </Text>
              <div
                className="redeem-button-container"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "20px",
                  background:
                    "linear-gradient(to top, rgba(26, 26, 26, 0.9) 30%, transparent)",
                  display: "flex",
                  justifyContent: "center",
                  opacity: 0, // Initially hidden
                  transition: "opacity 0.3s ease-in-out",
                }}
              >
                <Link to="/redeem-badge" style={{ textDecoration: "none" }}>
                  <Button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#805ad5", // Purple color for prominence
                      fontWeight: 600,
                    }}
                  >
                    <FiGift />
                    Redeem
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </Flex>
      )}
      <Tooltip content="Return to the main dashboard">
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button
            style={{
              width: 180,
              fontWeight: 600,
              fontSize: 16,
              padding: "12px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <FiArrowLeft size={20} />
            Back to Dashboard
          </Button>
        </Link>
      </Tooltip>
    </Flex>
  );
}
