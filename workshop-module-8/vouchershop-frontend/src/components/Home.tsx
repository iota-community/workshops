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
          border: "1px solid #12ef46ff", 
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
        <Flex direction="row" gap="6" mt="4" align="center">
      
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
            <Flex direction="column" gap="4" align="center" style={{ width: "100%" }}>
              <NFTStorefront onSelect={setSelectedNft} />
              {selectedNft && <RedeemVoucher nftId={selectedNft} />}
            </Flex>
          )}
        </Flex>
      )}

      {activeOperation !== null && (
            <Flex direction="column" align="center" mt="2" gap="3">
            <Button
              onClick={() => setActiveOperation(null)}
              style={{ background: "#e0e0e0", color: "#000" }}
            >
              ⬅ Back
            </Button>
          </Flex>
          )}
    </Flex>
  );
}
