import { useState } from "react";
import { Flex, Card, Text, Box } from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import Button from "./molecules/Button";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import Tooltip from "./molecules/Tooltip";

export default function ClaimTokens() {
  const { account, claimTokens, checkHasClaimed } = useWKTContract();
  const [loading, setLoading] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [message, setMessage] = useState("");

  const handleClaim = async () => {
    if (!account) return;

    setLoading(true);
    setMessage("");
    try {
      const claimedStatus = await checkHasClaimed(account.address);

      if (claimedStatus) {
        setHasClaimed(true);
        setMessage("You've already claimed your tokens today.");
        setLoading(false);
        return;
      }

      await claimTokens();
      setHasClaimed(true);
      setMessage("🎉 Successfully claimed 10 WKT tokens!");
    } catch (error) {
      console.error("Failed to claim tokens:", error);
      setMessage("⚠️ Failed to claim tokens. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" align="center" gap="6" style={{ padding: 20, minHeight: "100vh" }}>
      <Card
        style={{
          padding: 32,
          background: "#1a1a1a",
          minWidth: 320,
          maxWidth: 460,
          borderRadius: 12,
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
        }}
        aria-live="polite"
      >
        <Flex justify="center" align="center" gap="3" style={{ marginBottom: 24 }}>
          <FiCheckCircle size={36} color="#51cf66" />
          <Text size="7" weight="bold" style={{ color: "#51cf66", margin: 0 }}>
            Claim Daily Tokens
          </Text>
        </Flex>

        <Text
          size="4"
          style={{
            marginBottom: 32,
            color: "#a0aec0",
            lineHeight: 1.6,
            maxWidth: 350,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Claim 10 Workshop Tokens (WKT) once every 24 hours. Use tokens for payments and redeeming badges.
        </Text>

        <Tooltip 
          content={hasClaimed 
            ? "You've already claimed tokens today. Come back tomorrow!" 
            : "Claim 10 WKT tokens daily. Available once every 24 hours."}
        >
          <div>
            <Button
              onClick={handleClaim}
              disabled={loading || !account}
              style={{ width: "100%", fontWeight: 600, fontSize: 18, padding: "14px 0" }}
              aria-busy={loading}
              aria-disabled={loading || !account}
            >
              {loading ? "Claiming..." : "Claim 10 WKT"}
            </Button>
          </div>
        </Tooltip>

        {/* ==================== CORRECTED MESSAGE BLOCK ==================== */}
        {message && (
          <Flex 
            justify="center" 
            align="center" 
            gap="2" 
            style={{ marginTop: 20 }}
          >
            {message.includes("Successfully") ? (
              <FiCheckCircle size={20} color="#51cf66" />
            ) : (
              <FiAlertCircle size={20} color="#f56565" />
            )}
            <Text 
              size="3" 
              weight="medium" 
              role="alert" 
              style={{
                color: message.includes("Successfully") ? "#51cf66" : "#f56565",
              }}
            >
              {message}
            </Text>
          </Flex>
        )}
        {/* =============================================================== */}

        <Box style={{ marginTop: 40 }}>
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
        </Box>
      </Card>
    </Flex>
  );
}