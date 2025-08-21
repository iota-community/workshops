// src/components/Home.tsx
import { Flex, Heading } from "@radix-ui/themes";
import { useState } from "react";
import { OPERATIONS } from "../constants";
import Button from "./molecules/Button";
import NFTStorefront from "./NFTStorefront";
import ClaimVoucher from "./ClaimVoucher";
import RedeemVoucher from "./RedeemVoucher";
import { useVoucherShop } from "../hooks/useVoucherShop";
import AvailableVouchers from "./AvailableVouchers";

export default function Home() {

  const { account, selectedNft, setSelectedNft } = useVoucherShop();
  const [activeOperation, setActiveOperation] = useState<string | null>(null);

  return (
    <Flex direction="column" align="center" mt="5">

      {account && (
        <div style={{ 
          padding: "1rem", 
          marginBottom: "1rem",
          backgroundColor: "#d4edda", 
          border: "1px solid #c3e6cb", 
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <p style={{ margin: "0", color: "#155724", fontWeight: "500" }}>
            Welcome! Connected as: <code style={{ backgroundColor: "#fff", padding: "2px 6px", borderRadius: "4px" }}>{`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}</code>
          </p>
        </div>
      )}

      <Heading mb="4">VoucherShop Dashboard</Heading>

      <AvailableVouchers />

      {account && (
        <Flex direction="column" gap="3" mt="4" align="center">
      
          {activeOperation === null && (
            <>
              {OPERATIONS.map((op) => (
                <Button key={op.name} onClick={() => setActiveOperation(op.name)}>
                  {op.description}
                </Button>
              ))}
            </>
          )}

          {activeOperation === "ClaimVoucher" && <ClaimVoucher />}

          {activeOperation === "RedeemVoucher" && (
            <>
              <NFTStorefront onSelect={setSelectedNft} />
              {selectedNft && <RedeemVoucher nftId={selectedNft} />}
            </>
          )}

          {activeOperation !== null && (
            <Button
              onClick={() => setActiveOperation(null)}
              style={{ background: "#e0e0e0", color: "#000" }}
            >
              ⬅ Back
            </Button>
          )}
        </Flex>
      )}
    </Flex>
  );
}
