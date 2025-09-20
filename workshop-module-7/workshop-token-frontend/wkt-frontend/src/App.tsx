import { ConnectButton } from "@iota/dapp-kit";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home/Home";
import AdminPanel from "./components/AdminPanel";
import ClaimTokens from "./components/ClaimTokens";
import ClaimCoupon from "./components/ClaimCoupon";
import MakePayment from "./components/MakePayment";
import RedeemBadge from "./components/RedeemBadge";
import BadgeGallery from "./components/BadgeGallery";
import { useWKTContract } from "./hooks/useWKTContract";
import { useEffect, useState } from "react";
import { FiHexagon } from "react-icons/fi";

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
  }, [account?.address, checkIsAdmin]);

  const navLinkStyle = {
    textDecoration: 'none',
    transition: 'color 0.2s ease-in-out',
  };

  return (
    <Box>
     
      <Flex
        as="div"
        position="sticky"
        top="0"
        px="5"
        py="3"
        justify="between"
        align="center"
        style={{
          background: "var(--gray-2)",
          borderBottom: "1px solid var(--gray-a5)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
          zIndex: 10,
        }}
      >
        <Flex align="center" gap="6">
          <Link to="/" style={navLinkStyle}>
            <Flex align="center" gap="3">
              <FiHexagon size={28} color="var(--accent-9)" />
              <Heading size="5" style={{ color: "var(--gray-12)" }}>
                WKT dApp
              </Heading>
            </Flex>
          </Link>
          
          {isAdmin && (
            <Link to="/admin" style={navLinkStyle}>
              <Text 
                weight="bold"
                className="nav-link"
                style={{
                  color: 'var(--gray-11)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-3)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-a3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Admin Panel
              </Text>
            </Link>
          )}
        </Flex>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Box
        as="div"
        style={{
          background: "var(--gray-1)",
          minHeight: "calc(100vh - 65px)",
          maxWidth: "900px",
          margin: "0 auto",
          padding: "24px",
        }}
      >
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