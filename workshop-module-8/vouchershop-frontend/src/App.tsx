import { ConnectButton } from "@iota/dapp-kit";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { Link } from "react-router-dom";
import Home from "./components/Home";

function App() {
  return (
    <Box style={{
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <Flex
        position="sticky"
        top="0"
        px="5"
        py="3"
        justify="between"
        align="center"
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(15, 15, 25, 0.8)",
          backdropFilter: "blur(20px)",
          zIndex: 1000,
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)"
        }}
      >
        <Box>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Flex align="center" gap="3">
              <div style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)"
              }}>
                <span style={{ 
                  fontSize: "1.2rem", 
                  fontWeight: "bold",
                  color: "white"
                }}>
                  🛍️
                </span>
              </div>
              
              <Heading style={{
                background: "linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "1.8rem",
                fontWeight: "800",
                letterSpacing: "-0.5px",
                margin: 0
              }}>
                VoucherShop
              </Heading>
            </Flex>
          </Link>
        </Box>
          <ConnectButton />
      </Flex>

      {/* Main Content */}
      <Box style={{ background: "transparent" }}>
        <Home />
      </Box>
    </Box>
  );
}

export default App;