import { Flex, Card, Text, TextField } from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import Button from "./molecules/Button";
import { useState, useEffect } from "react";

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
      <Card style={{ padding: "20px", background: "#1a1a1a", margin: "20px" }}>
        <Text>Admin access required. You don't have permission to view this page.</Text>
      </Card>
    );
  }

  const handleAddCoupon = async () => {
    if (!couponCode) return;
    
    setLoading(true);
    try {
      await addCouponCode(couponCode);
      setCoupons([...coupons, couponCode]);
      setCouponCode("");
      setMessage("Coupon code added successfully!");
    } catch (error) {
      console.error("Failed to add coupon:", error);
      setMessage("Failed to add coupon code");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!removeCode) return;
    
    setLoading(true);
    try {
      await removeCouponCode(removeCode);
      setCoupons(coupons.filter(code => code !== removeCode));
      setRemoveCode("");
      setMessage("Coupon code removed successfully!");
    } catch (error) {
      console.error("Failed to remove coupon:", error);
      setMessage("Failed to remove coupon code");
    } finally {
      setLoading(false);
    }
  };

  const handleSetAutoBadge = async () => {
    if (!workshopId || !badgeUrl) return;
    
    setLoading(true);
    try {
      await setAutoBadgeConfig(workshopId, badgeUrl);
      setMessage("Auto badge config updated successfully!");
      setWorkshopId("");
      setBadgeUrl("");
    } catch (error) {
      console.error("Failed to set auto badge config:", error);
      setMessage("Failed to update auto badge config");
    } finally {
      setLoading(false);
    }
  };

  const handleMintBadge = async () => {
    if (!mintRecipient || !mintWorkshopId || !mintUrl) return;
    
    setLoading(true);
    try {
      await mintBadge(mintRecipient, mintWorkshopId, mintUrl);
      setMessage("Badge minted successfully!");
      setMintRecipient("");
      setMintWorkshopId("");
      setMintUrl("");
    } catch (error) {
      console.error("Failed to mint badge:", error);
      setMessage("Failed to mint badge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" align="center" gap="4" style={{ padding: "20px" }}>
      <Text size="6" weight="bold">Admin Panel</Text>
      
      <Card style={{ padding: "20px", background: "#1a1a1a", width: "100%", maxWidth: "500px" }}>
        <Text size="4" weight="bold">Coupon Management</Text>
        
        <TextField.Root
          placeholder="Add coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          style={{ margin: "10px 0" }}
        />
        <Button onClick={handleAddCoupon} disabled={loading}>
          Add Coupon
        </Button>
        
        <TextField.Root
          placeholder="Remove coupon code"
          value={removeCode}
          onChange={(e) => setRemoveCode(e.target.value)}
          style={{ margin: "10px 0" }}
        />
        <Button onClick={handleRemoveCoupon} disabled={loading}>
          Remove Coupon
        </Button>
        
        <Text size="3" style={{ marginTop: "15px" }}>Active Coupons:</Text>
        {coupons.length > 0 ? (
          <ul>
            {coupons.map(code => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        ) : (
          <Text>No active coupons</Text>
        )}
      </Card>
      
      <Card style={{ padding: "20px", background: "#1a1a1a", width: "100%", maxWidth: "500px" }}>
        <Text size="4" weight="bold">Auto Badge Configuration</Text>
        
        <TextField.Root
          placeholder="Workshop ID"
          value={workshopId}
          onChange={(e) => setWorkshopId(e.target.value)}
          style={{ margin: "10px 0" }}
        />
        
        <TextField.Root
          placeholder="Badge Image URL"
          value={badgeUrl}
          onChange={(e) => setBadgeUrl(e.target.value)}
          style={{ margin: "10px 0" }}
        />
        
        <Button onClick={handleSetAutoBadge} disabled={loading}>
          Set Auto Badge Config
        </Button>
      </Card>
      
      <Card style={{ padding: "20px", background: "#1a1a1a", width: "100%", maxWidth: "500px" }}>
        <Text size="4" weight="bold">Mint Badge</Text>
        
        <TextField.Root
          placeholder="Recipient Address"
          value={mintRecipient}
          onChange={(e) => setMintRecipient(e.target.value)}
          style={{ margin: "10px 0" }}
        />
        
        <TextField.Root
          placeholder="Workshop ID"
          value={mintWorkshopId}
          onChange={(e) => setMintWorkshopId(e.target.value)}
          style={{ margin: "10px 0" }}
        />
        
        <TextField.Root
          placeholder="Badge Image URL"
          value={mintUrl}
          onChange={(e) => setMintUrl(e.target.value)}
          style={{ margin: "10px 0" }}
        />
        
        <Button onClick={handleMintBadge} disabled={loading}>
          Mint Badge
        </Button>
      </Card>
      
      {message && (
        <Card style={{ padding: "20px", background: "#1a1a1a", width: "100%", maxWidth: "500px" }}>
          <Text color={message.includes("Failed") ? "red" : "green"}>{message}</Text>
        </Card>
      )}
    </Flex>
  );
}