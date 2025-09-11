import { ConnectButton } from "@iota/dapp-kit";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import AdminPanel from "./components/AdminPanel";
import ClaimTokens from "./components/ClaimTokens";
import ClaimCoupon from "./components/ClaimCoupon";
import MakePayment from "./components/MakePayment";
import RedeemBadge from "./components/RedeemBadge";
import BadgeGallery from "./components/BadgeGallery";
import { useWKTContract } from "./hooks/useWKTContract";
import { useEffect, useState } from "react";

function App() {
  const { account, checkIsAdmin } = useWKTContract();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (account?.address) {
        const adminStatus = await checkIsAdmin(account.address);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    };
    verifyAdmin();
  }, [account?.address]);

  return (
    <Box>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        align="center"
        style={{
          borderBottom: "1px solid var(--gray-a6)",
          background: "#000000",
        }}
      >
        <Box>
          <Flex gap="4" align="center">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Heading>WKT Token dApp</Heading>
            </Link>
            {isAdmin && (
              <Link to="/admin" style={{ textDecoration: "none" }}>
                <span style={{ color: "#12ef46", fontWeight: "bold" }}>Admin Panel</span>
              </Link>
            )}
          </Flex>
        </Box>
        <ConnectButton />
      </Flex>
      <Box style={{ background: "#111111", minHeight: "100vh" }} mx="5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/claim-tokens" element={<ClaimTokens />} />
          <Route path="/claim-coupon" element={<ClaimCoupon />} />
          <Route path="/make-payment" element={<MakePayment />} />
          <Route path="/redeem-badge" element={<RedeemBadge />} />
          <Route path="/badge-gallery" element={<BadgeGallery />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;