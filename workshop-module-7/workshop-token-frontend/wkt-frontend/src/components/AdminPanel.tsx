import { Flex, Card, Text, TextField, Box, Heading, Tabs } from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import Button from "./molecules/Button";
import { useState, useEffect } from "react";
import { FiKey, FiGift, FiAward, FiSettings, FiUsers, FiXCircle, FiCheckCircle } from "react-icons/fi";
import Tooltip from "./molecules/Tooltip";

export default function AdminPanel() {
  const { account, addCouponCode, removeCouponCode, setAutoBadgeConfig, mintBadge, checkIsAdmin, getAvailableCoupons } = useWKTContract();
  const [isAdmin, setIsAdmin] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [removeCode, setRemoveCode] = useState("");
  const [workshopId, setWorkshopId] = useState("");
  const [badgeUrl, setBadgeUrl] = useState("");
  const [mintRecipient, setMintRecipient] = useState("");
  const [mintWorkshopId, setMintWorkshopId] = useState("");
  const [mintUrl, setMintUrl] = useState("");
  const [coupons, setCoupons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      if (account?.address) {
        const adminStatus = await checkIsAdmin(account.address);
        setIsAdmin(adminStatus);

        if (adminStatus) {
          const availableCoupons = await getAvailableCoupons();
          setCoupons(availableCoupons);
        }
      }
    };
    checkAdmin();
  }, [account?.address]);

  if (!isAdmin) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "60vh", padding: "20px" }}>
        <Card
          style={{
            padding: "40px",
            background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
            maxWidth: "500px",
            textAlign: "center",
            border: "1px solid #333"
          }}
        >
          <FiKey size={48} color="#f56565" style={{ marginBottom: "16px" }} />
          <Heading size="5" style={{ marginBottom: "12px", color: "#e2e8f0" }}>
            Admin Access Required
          </Heading>
          <Text style={{ color: "#a0aec0" }}>
            You don't have permission to view this page. Please contact the system administrator.
          </Text>
        </Card>
      </Flex>
    );
  }

  const handleAddCoupon = async () => {
    if (!couponCode) return;
    setLoading(true);
    setMessage("");
    try {
      await addCouponCode(couponCode);
      setCoupons([...coupons, couponCode]);
      setCouponCode("");
      setMessage("✅ Coupon code added successfully!");
    } catch {
      setMessage("❌ Failed to add coupon code");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!removeCode) return;
    setLoading(true);
    setMessage("");
    try {
      await removeCouponCode(removeCode);
      setCoupons(coupons.filter((code) => code !== removeCode));
      setRemoveCode("");
      setMessage("✅ Coupon code removed successfully!");
    } catch {
      setMessage("❌ Failed to remove coupon code");
    } finally {
      setLoading(false);
    }
  };

  const handleSetAutoBadge = async () => {
    if (!workshopId || !badgeUrl) return;
    setLoading(true);
    setMessage("");
    try {
      await setAutoBadgeConfig(workshopId, badgeUrl);
      setMessage("✅ Auto badge config updated successfully!");
      setWorkshopId("");
      setBadgeUrl("");
    } catch {
      setMessage("❌ Failed to update auto badge config");
    } finally {
      setLoading(false);
    }
  };

  const handleMintBadge = async () => {
    if (!mintRecipient || !mintWorkshopId || !mintUrl) return;
    setLoading(true);
    setMessage("");
    try {
      await mintBadge(mintRecipient, mintWorkshopId, mintUrl);
      setMessage("✅ Badge minted successfully!");
      setMintRecipient("");
      setMintWorkshopId("");
      setMintUrl("");
    } catch {
      setMessage("❌ Failed to mint badge");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #333",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    width: "100%"
  };

  const inputStyle = {
    backgroundColor: "#2a2a2a",
    color: "white",
    border: "1px solid #444",
    borderRadius: "8px",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box" as const
  };

  return (
    <Flex direction="column" align="center" gap="6" style={{ padding: "24px", minHeight: "100vh", width: "100%" }}>
      <Flex align="center" gap="3" style={{ marginBottom: "8px" }}>
        <FiSettings size={32} color="#805ad5" />
        <Heading
          size="8"
          weight="bold"
          style={{
            background: "linear-gradient(90deg, #805ad5, #0bc5ea)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Admin Dashboard
        </Heading>
      </Flex>

      <Text size="4" style={{ color: "#a0aec0", marginBottom: "32px", textAlign: "center" }}>
        Manage coupons, badge configurations, and mint new badges
      </Text>

      <Tabs.Root defaultValue="coupons" style={{ width: "100%", maxWidth: "800px" }}>
        <Tabs.List style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "32px" }}>
          <Tabs.Trigger value="coupons">
            <FiGift size={18} style={{ marginRight: "8px" }} />
            Coupons
          </Tabs.Trigger>
          <Tabs.Trigger value="badgeConfig">
            <FiAward size={18} style={{ marginRight: "8px" }} />
            Badge Config
          </Tabs.Trigger>
          <Tabs.Trigger value="mintBadge">
            <FiUsers size={18} style={{ marginRight: "8px" }} />
            Mint Badge
          </Tabs.Trigger>
        </Tabs.List>

        {/* Coupons Tab */}
        <Tabs.Content value="coupons">
          <Card style={cardStyle}>
            <Flex align="center" gap="3" style={{ marginBottom: "24px" }}>
              <FiGift size={24} color="#0bc5ea" />
              <Heading size="5" style={{ color: "#e2e8f0" }}>Coupon Management</Heading>
            </Flex>

            <Flex direction="column" gap="4">
              <Box>
                <Text size="2" weight="medium" style={{ color: "#a0aec0" }}>Add New Coupon</Text>
                <TextField.Root
                  placeholder="Enter coupon code..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={inputStyle}
                />
                <Tooltip content="Add a new coupon code for users to redeem">
                  <Button onClick={handleAddCoupon} disabled={loading || !couponCode} style={{ width: "100%", marginTop: "8px" }}>
                    <FiCheckCircle style={{ marginRight: "8px" }} />
                    Add Coupon
                  </Button>
                </Tooltip>
              </Box>

              <Box>
                <Text size="2" weight="medium" style={{ color: "#a0aec0" }}>Remove Coupon</Text>
                <TextField.Root
                  placeholder="Enter coupon code to remove..."
                  value={removeCode}
                  onChange={(e) => setRemoveCode(e.target.value)}
                  style={inputStyle}
                />
                <Tooltip content="Remove an existing coupon code">
                  <Button onClick={handleRemoveCoupon} disabled={loading || !removeCode} style={{ width: "100%", marginTop: "8px" }}>
                    <FiXCircle style={{ marginRight: "8px" }} />
                    Remove Coupon
                  </Button>
                </Tooltip>
              </Box>

              <Box>
                <Text size="2" weight="medium" style={{ color: "#a0aec0" }}>Active Coupons ({coupons.length})</Text>
                {coupons.length > 0 ? (
                  <Flex direction="column" gap="2" style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {coupons.map((code) => (
                      <Card key={code} style={{ background: "#2a2a2a", padding: "12px", borderRadius: "8px", border: "1px solid #333" }}>
                        <Flex justify="between" align="center">
                          <Text size="2" style={{ fontFamily: "monospace", color: "#e2e8f0" }}>{code}</Text>
                          <Text size="1" style={{ color: "#48bb78" }}>Active</Text>
                        </Flex>
                      </Card>
                    ))}
                  </Flex>
                ) : (
                  <Text size="2" style={{ color: "#718096", fontStyle: "italic" }}>No active coupons</Text>
                )}
              </Box>
            </Flex>
          </Card>
        </Tabs.Content>

        {/* Badge Config Tab */}
        <Tabs.Content value="badgeConfig">
          <Card style={cardStyle}>
            <Flex align="center" gap="3" style={{ marginBottom: "24px" }}>
              <FiAward size={24} color="#48bb78" />
              <Heading size="5" style={{ color: "#e2e8f0" }}>Auto Badge Configuration</Heading>
            </Flex>
            <Flex direction="column" gap="4">
              <Box>
                <Text size="2" weight="medium" style={{ color: "#a0aec0" }}>Workshop ID</Text>
                <TextField.Root
                  placeholder="Enter workshop ID..."
                  value={workshopId}
                  onChange={(e) => setWorkshopId(e.target.value)}
                  style={inputStyle}
                />
              </Box>
              <Box>
                <Text size="2" weight="medium" style={{ color: "#a0aec0" }}>Badge Image URL</Text>
                <TextField.Root
                  placeholder="Enter badge image URL..."
                  value={badgeUrl}
                  onChange={(e) => setBadgeUrl(e.target.value)}
                  style={inputStyle}
                />
              </Box>
              <Tooltip content="Configure automatic badge creation for payments">
                <Button onClick={handleSetAutoBadge} disabled={loading || !workshopId || !badgeUrl} style={{ width: "100%", marginTop: "8px" }}>
                  <FiSettings style={{ marginRight: "8px" }} />
                  Set Auto Badge Config
                </Button>
              </Tooltip>
            </Flex>
          </Card>
        </Tabs.Content>

        {/* Mint Badge Tab */}
        <Tabs.Content value="mintBadge">
          <Card style={cardStyle}>
            <Flex align="center" gap="3" style={{ marginBottom: "24px" }}>
              <FiUsers size={24} color="#805ad5" />
              <Heading size="5" style={{ color: "#e2e8f0" }}>Mint Badge</Heading>
            </Flex>
            <Flex direction="column" gap="4">
              <Box>
                <Text size="2" weight="medium" style={{ color: "#a0aec0" }}>Recipient Address</Text>
                <TextField.Root
                  placeholder="Enter recipient address..."
                  value={mintRecipient}
                  onChange={(e) => setMintRecipient(e.target.value)}
                  style={inputStyle}
                />
              </Box>
              <Box>
                <Text size="2" weight="medium" style={{ color: "#a0aec0" }}>Workshop ID</Text>
                <TextField.Root
                  placeholder="Enter workshop ID..."
                  value={mintWorkshopId}
                  onChange={(e) => setMintWorkshopId(e.target.value)}
                  style={inputStyle}
                />
              </Box>
              <Box>
                <Text size="2" weight="medium" style={{ color: "#a0aec0" }}>Badge Image URL</Text>
                <TextField.Root
                  placeholder="Enter badge image URL..."
                  value={mintUrl}
                  onChange={(e) => setMintUrl(e.target.value)}
                  style={inputStyle}
                />
              </Box>
              <Tooltip content="Manually mint a badge for a specific user">
                <Button onClick={handleMintBadge} disabled={loading || !mintRecipient || !mintWorkshopId || !mintUrl} style={{ width: "100%", marginTop: "8px" }}>
                  <FiAward style={{ marginRight: "8px" }} />
                  Mint Badge
                </Button>
              </Tooltip>
            </Flex>
          </Card>
        </Tabs.Content>
      </Tabs.Root>

      {message && (
        <Card
          style={{
            ...cardStyle,
            borderColor: message.includes("❌") ? "#f56565" : "#48bb78",
            maxWidth: "600px",
            marginTop: "24px"
          }}
        >
          <Flex align="center" gap="3">
            {message.includes("❌") ? (
              <FiXCircle size={20} color="#f56565" />
            ) : (
              <FiCheckCircle size={20} color="#48bb78" />
            )}
            <Text color={message.includes("❌") ? "red" : "green"} weight="medium">
              {message}
            </Text>
          </Flex>
        </Card>
      )}
    </Flex>
  );
}
