import { Flex} from "@radix-ui/themes";
import { useState } from "react";
import { OPERATIONS } from "../constants";
import Button from "./molecules/Button";
import NFTStorefront from "./NFTStorefront";
import ClaimVoucher from "./ClaimVoucher";
import RedeemVoucher from "./RedeemVoucher";
import { useVoucherShop } from "../hooks/useVoucherShop";
import AvailableVouchers from "./AvailableVouchers";
import Tooltip from "./molecules/Tooltip";

export default function Home() {
  const { account, selectedNft, setSelectedNft } = useVoucherShop();
  const [activeOperation, setActiveOperation] = useState<string | null>(null);

  return (
    <Flex direction="column" align="center" mt="5" gap="4">

      {account && (
        <div style={{ 
          padding: "1rem", 
          marginBottom: "1rem",
          background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)", 
          border: "1px solid #12ef46ff", 
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(18, 239, 70, 0.2)"
        }}>
          <p style={{ margin: "0", color: "#155724", fontWeight: "500" }}>
            👋 Welcome! Connected as: <code style={{ 
              backgroundColor: "#fff", 
              padding: "4px 8px", 
              borderRadius: "6px",
              fontWeight: "600",
              border: "1px solid #12ef46"
            }}>{`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}</code>
          </p>
        </div>
      )}

      <AvailableVouchers />

      {account && (
        <Flex direction="column" gap="6" mt="4" align="center" style={{ width: "100%" }}>
      
          {activeOperation === null && (
            <Flex direction="row" gap="4" wrap="wrap" justify="center">
              {OPERATIONS.map((op) => (
                <Tooltip 
                  key={op.name} 
                  content={op.name === 'ClaimVoucher' 
                    ? "Get your voucher to start collecting NFTs" 
                    : "Use your voucher to redeem NFTs"
                  }
                >
                  <div>
                    <Button 
                      onClick={() => setActiveOperation(op.name)}
                      style={{ 
                        minWidth: "160px",
                        background: op.name === 'ClaimVoucher' 
                          ? "linear-gradient(135deg, #4dabf7 0%, #3b82f6 100%)"
                          : "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
                        padding: "12px 20px",
                        fontSize: "16px",
                        fontWeight: "600"
                      }}
                    >
                      {op.description}
                    </Button>
                  </div>
                </Tooltip>
              ))}
            </Flex>
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
          <Tooltip content="Go back to the main dashboard">
            <div>
              <Button
                onClick={() => setActiveOperation(null)}
                style={{ 
                  background: "linear-gradient(135deg, #6c757d 0%, #495057 100%)",
                  color: "white"
                }}
              >
                ⬅ Back to Dashboard
              </Button>
            </div>
          </Tooltip>
        </Flex>
      )}
    </Flex>
  );
}