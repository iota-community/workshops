// src/App.tsx
import { ConnectButton } from "@iota/dapp-kit";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { Link } from "react-router-dom";
import Home from "./components/Home";

function App() {
  return (
    <Box>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        align="center"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
          background: "#000000",
        }}
      >
        <Box>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Heading>VoucherShop dApp</Heading>
          </Link>
        </Box>
        <ConnectButton />
      </Flex>
      <Box style={{ background: "#111111" }} mx="5">
        <Home />
      </Box>
    </Box>
  );
}

export default App;