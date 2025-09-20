import { useState, useEffect } from "react";
import { Flex, Card, Text, Box } from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import Button from "./molecules/Button";
import { Link } from "react-router-dom";
import { TokenBalance,WorkshopBadge } from "../types";
import Tooltip from "./molecules/Tooltip";
import CelebrationModal from "./CelebrationModal";

export default function MakePayment() {
  const { account, makePayment, getWKTBalance, getWorkshopBadges } = useWKTContract();
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [coinId, setCoinId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<TokenBalance[]>([]);
  const [message, setMessage] = useState<string>("");
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [newBadge, setNewBadge] = useState<WorkshopBadge | null>(null);

useEffect(() => {
    const fetchBalance = async () => {
      if (account?.address) {
        const userBalance = await getWKTBalance(account.address);
        setBalance(userBalance);
        if (userBalance.length > 0) {
          setCoinId(userBalance[0].coinObjectId);
        }
      }
    };
    fetchBalance();
  }, [account?.address, getWKTBalance]);

  const totalBalance = balance.reduce(
    (sum, coin) => sum + BigInt(coin.balance),
    BigInt(0)
  );

  const handlePayment = async () => {
    if (!account || !recipient || !amount || !coinId) return;

    setLoading(true);
    setMessage("");
    try {
      // 1. Get badge count before payment
      const badgesBefore = await getWorkshopBadges(account.address);

      await makePayment(coinId, recipient, amount);
      setMessage("🎉 Payment successful!");
      
      // 2. Fetch updated balances and badges after success
      const updatedBalance = await getWKTBalance(account.address);
      setBalance(updatedBalance);
      const badgesAfter = await getWorkshopBadges(account.address);
      
      // 3. Check if a new badge was minted
      if (badgesAfter.length > badgesBefore.length) {
        // Find the newly added badge
        const newlyMintedBadge = badgesAfter.find(
          (bAfter) => !badgesBefore.some((bBefore) => bBefore.id === bAfter.id)
        );

        if (newlyMintedBadge) {
          setNewBadge(newlyMintedBadge);
          setShowCelebration(true); // Trigger the celebration!
        }
      }

      setRecipient("");
      setAmount("");
    } catch (error) {
      console.error("Failed to make payment:", error);
      setMessage("⚠️ Payment failed. Please check details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
     <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        badge={newBadge}
      />
    <Flex direction="column" align="center" gap="6" style={{ padding: 24, minHeight: "100vh" }}>
      <Card
        style={{
          padding: 32,
          background: "#1a1a1a",
          minWidth: 320,
          maxWidth: 460,
          borderRadius: 12,
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
        aria-live="polite"
      >
        <Text size="6" weight="bold" style={{ marginBottom: 16, color: "#51cf66" ,display: "block",}}>
          Make Payment
        </Text>
        <Text size="4" style={{ marginBottom: 24, color: "#a0aec0", lineHeight: 1.5,display: "block", }}>
          Transfer your WKT tokens to another wallet address. Make sure you have sufficient balance.
        </Text>

        <Box
          style={{
            paddingBottom: 16,
            textAlign: "left",
            color: "#cbd5e0",
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 12,
          }}
        >
          Current Balance: <strong>{totalBalance.toString()} WKT</strong>
        </Box>

        <Box style={{ textAlign: "left", marginBottom: 8 }}>
          <label
            htmlFor="recipientInput"
            style={{ color: "#a0aec0", fontSize: 14, fontWeight: 600 }}
          >
            Recipient Wallet Address
          </label>
        </Box>
        <input
          id="recipientInput"
          type="text"
          placeholder="Enter recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={loading}
          style={{
            backgroundColor: "#2a2a2a",
            color: "white",
            borderRadius: 8,
            fontSize: 16,
            padding: "12px 16px",
            border: "1px solid #444",
            width: "100%",
            boxSizing: "border-box",
            marginBottom: 20,
          }}
          aria-label="Recipient wallet address"
        />

        <Box style={{ textAlign: "left", marginBottom: 8 }}>
          <label
            htmlFor="amountInput"
            style={{ color: "#a0aec0", fontSize: 14, fontWeight: 600 }}
          >
            Amount (WKT)
          </label>
        </Box>
        <input
          id="amountInput"
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
          style={{
            backgroundColor: "#2a2a2a",
            color: "white",
            borderRadius: 8,
            fontSize: 16,
            padding: "12px 16px",
            border: "1px solid #444",
            width: "100%",
            boxSizing: "border-box",
            marginBottom: 24,
          }}
          aria-label="Amount of WKT to send"
          min="0"
          step="any"
        />

       <Tooltip 
  content={totalBalance === BigInt(0) 
    ? "You need WKT tokens in your wallet to make payments" 
    : "Send WKT tokens to another wallet address"}
>
  <div>
  <Button
    onClick={handlePayment}
    disabled={loading || !account || !recipient || !amount || !coinId}
    style={{ width: "100%", fontWeight: 600, fontSize: 18, padding: "14px 0" }}
    aria-busy={loading}
    aria-disabled={loading || !account || !recipient || !amount || !coinId}
  >
    {loading ? "Processing..." : "Make Payment"}
  </Button>
  </div>
</Tooltip>


        {message && (
          <Text
            size="4"
            style={{
              marginTop: 20,
              color: message.includes("successful") ? "#48bb78" : "#f56565",
              fontWeight: 600,
            }}
            role="alert"
            aria-live="assertive"
          >
            {message}
          </Text>
        )}

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
              ← Back to Dashboard
            </Button>
          </Link>
        </Box>
      </Card>
    </Flex>
    </>
  );
}
