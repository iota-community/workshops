import { Flex, Heading, Text, Card } from "@radix-ui/themes";
import { useWKTContract } from "../hooks/useWKTContract";
import { Link } from "react-router-dom";
import Button from "./molecules/Button";
import { useEffect, useState } from "react";
import { TokenBalance, WorkshopBadge } from "../types";
import OwnedObjects from "../OwnedObjects";
import Loading from "./molecules/Loading";

export default function Home() {
  const { account, getWKTBalance, getWorkshopBadges, checkHasClaimed, checkHasRedeemedBadge } = useWKTContract();
  const [balance, setBalance] = useState<TokenBalance[]>([]);
  const [badges, setBadges] = useState<WorkshopBadge[]>([]);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [hasRedeemed, setHasRedeemed] = useState(false);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    const fetchUserData = async () => {
      if (account?.address) {
        setLoading(true);
        try {
          const [userBalance, userBadges, claimStatus, redeemStatus] = await Promise.all([
            getWKTBalance(account.address),
            getWorkshopBadges(account.address),
            checkHasClaimed(account.address),
            checkHasRedeemedBadge(account.address)
          ]);
          setBalance(userBalance);
          setBadges(userBadges);
          setHasClaimed(claimStatus);
          setHasRedeemed(redeemStatus);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [account?.address]);

  if (loading) {
  return <Loading/>;
  }
  

  const totalBalance = balance.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0));

  return (
    <Flex direction="column" align="center" pt="5">
      <Heading mb="4" size="8">WKT Token Dashboard</Heading>
      
      {account ? (
        <>
          <Card style={{ padding: "20px", marginBottom: "20px", background: "#1a1a1a", width: "43%" }}>
            <Flex direction="column" gap="3">
              <Text size="3">Connected: {`${account.address.slice(0, 8)}...${account.address.slice(-6)}`}</Text>
              <Text size="4" weight="bold">WKT Balance: {totalBalance.toString()} tokens</Text>
              <Text size="3">Workshop Badges: {badges.length}</Text>
              <Text size="2" style={{ color: hasClaimed ? "#ff6b6b" : "#51cf66" }}>
                Daily Claim: {hasClaimed ? "Already claimed today" : "Available"}
              </Text>
              <Text size="2" style={{ color: hasRedeemed ? "#ff6b6b" : "#51cf66" }}>
                Badge Redemption: {hasRedeemed ? "Already redeemed" : "Available"}
              </Text>
            </Flex>
          </Card>

          <Flex gap="3" wrap="wrap" justify="center" mb="5">
            <Link to="/claim-tokens">
              <Button disabled={hasClaimed}>Claim Daily Tokens</Button>
            </Link>
            <Link to="/claim-coupon">
              <Button>Claim with Coupon</Button>
            </Link>
            <Link to="/make-payment">
              <Button disabled={totalBalance === BigInt(0)}>Make Payment</Button>
            </Link>
            <Link to="/redeem-badge">
              <Button disabled={badges.length === 0 || hasRedeemed}>Redeem Badge</Button>
            </Link>
            <Link to="/badge-gallery">
              <Button>View Badge Gallery</Button>
            </Link>
          </Flex>

          <OwnedObjects />
        </>
      ) : (
        <Card style={{ padding: "40px", background: "#1a1a1a" }}>
          <Text size="5">Please connect your wallet to get started</Text>
        </Card>
      )}
    </Flex>
  );
}