import { useEffect, useState } from "react";
import { Flex } from "@radix-ui/themes";
import { useWKTContract } from "../../hooks/useWKTContract";
import DashboardSummary from "./DashboardSummary";
import ActionTabs from "./ActionTabs";
import OwnedObjects from "../../OwnedObjects";
import Loading from "../molecules/Loading";
import { TokenBalance, WorkshopBadge } from "../../types";
import "./HomeStyles.css";
export default function Home() {
  const {
    account,
    getWKTBalance,
    getWorkshopBadges,
    checkHasClaimed,
    checkHasRedeemedBadge,
  } = useWKTContract();

  const [balance, setBalance] = useState<TokenBalance[]>([]);
  const [badges, setBadges] = useState<WorkshopBadge[]>([]);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [hasRedeemed, setHasRedeemed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"tab1" | "tab2">("tab1");

  useEffect(() => {
    const fetchUserData = async () => {
      if (account?.address) {
        setLoading(true);
        try {
          const [userBalance, userBadges, claimStatus, redeemStatus] =
            await Promise.all([
              getWKTBalance(account.address),
              getWorkshopBadges(account.address),
              checkHasClaimed(account.address),
              checkHasRedeemedBadge(account.address),
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
    return <Loading />;
  }

  const totalBalance = balance.reduce(
    (sum, coin) => sum + BigInt(coin.balance),
    BigInt(0),
  );

  if (!account) {
    return (
      <Flex
        direction="column"
        align="center"
        pt="6"
        gap="8"
        style={{
          maxWidth: 800,
          margin: "auto",
          padding: "0 16px 40px",
          minHeight: "100vh",
        }}
      >
        <DashboardSummary
          account={null}
          totalBalance={BigInt(0)}
          badges={[]}
          hasClaimed={false}
          hasRedeemed={false}
        />
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      align="center"
      pt="6"
      gap="8"
      style={{
        maxWidth: 800,
        margin: "auto",
        padding: "0 16px 40px",
        minHeight: "100vh",
      }}
    >
      <DashboardSummary
        account={account}
        totalBalance={totalBalance}
        badges={badges}
        hasClaimed={hasClaimed}
        hasRedeemed={hasRedeemed}
      />

      <ActionTabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        hasClaimed={hasClaimed}
        hasRedeemed={hasRedeemed}
        totalBalance={totalBalance}
        badges={badges}
      />

      <OwnedObjects />
    </Flex>
  );
}
