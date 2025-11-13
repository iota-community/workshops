import { useEffect, useState } from "react";
import { useVoucherShop } from "../hooks/useVoucherShop";
import { Transaction } from "@iota/iota-sdk/transactions";
import Loading from "../components/molecules/Loading";
import { VoucherShopInfo } from "../types";
import Tooltip from "../components/molecules/Tooltip";
import AvailableVouchersHeader from "./AvailableVouchersHeader";
import AvailableVouchersContent from "./AvailableVouchersContent";

export default function AvailableVouchers() {
  const { client, voucherShopObject, packageId, account } = useVoucherShop();
  const [shopInfo, setShopInfo] = useState<VoucherShopInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const shopObject = await client.getObject({
          id: voucherShopObject,
          options: { showContent: true }
        });

        if (shopObject.data?.content && shopObject.data.content.dataType === 'moveObject') {
          const fields = (shopObject.data.content as any).fields;
          console.log('Shop object fields:', fields);
          
          const admin = fields.admin;
          const nftIds = fields.nft_ids || [];
          
          let userVoucherStatus: { hasVoucher: boolean; isVoucherUsed: boolean } | undefined;
          let redemptionHistory: number[] = [];

          if (account?.address) {
            try {
              const hasVoucherTx = new Transaction();
              hasVoucherTx.moveCall({
                target: `${packageId}::voucher_shop::has_voucher`,
                arguments: [hasVoucherTx.object(voucherShopObject), hasVoucherTx.pure.address(account.address)]
              });

              const hasVoucherResult = await client.devInspectTransactionBlock({
                transactionBlock: hasVoucherTx,
                sender: account.address
              });

              let hasVoucher = false;
              if (hasVoucherResult.results && hasVoucherResult.results.length > 0) {
                const returnValues = hasVoucherResult.results[0]?.returnValues;
                if (returnValues && returnValues.length > 0) {
                  hasVoucher = returnValues[0][0][0] === 1;
                }
              }

              let isVoucherUsed = false;
              if (hasVoucher) {
                const isUsedTx = new Transaction();
                isUsedTx.moveCall({
                  target: `${packageId}::voucher_shop::is_voucher_used`,
                  arguments: [isUsedTx.object(voucherShopObject), isUsedTx.pure.address(account.address)]
                });

                const isUsedResult = await client.devInspectTransactionBlock({
                  transactionBlock: isUsedTx,
                  sender: account.address
                });

                if (isUsedResult.results && isUsedResult.results.length > 0) {
                  const returnValues = isUsedResult.results[0]?.returnValues;
                  if (returnValues && returnValues.length > 0) {
                    isVoucherUsed = returnValues[0][0][0] === 1;
                  }
                }
              }

              userVoucherStatus = { hasVoucher, isVoucherUsed };
            } catch (voucherError) {
              console.log('Could not fetch voucher status:', voucherError);
              userVoucherStatus = { hasVoucher: false, isVoucherUsed: false };
            }
            
            try {
              const historyTx = new Transaction();
              historyTx.moveCall({
                target: `${packageId}::voucher_shop::get_redemption_history`,
                arguments: [historyTx.object(voucherShopObject), historyTx.pure.address(account.address)]
              });

              const historyResult = await client.devInspectTransactionBlock({
                transactionBlock: historyTx,
                sender: account.address
              });

              if (historyResult.results && historyResult.results.length > 0) {
                const returnValues = historyResult.results[0]?.returnValues;
                if (returnValues && returnValues.length > 0) {
                  const rawData = returnValues[0][0];
                  
                  console.log('Raw redemption history data:', rawData);
                  
                  if (Array.isArray(rawData)) {
                    redemptionHistory = (rawData as any[])
                      .slice(1)
                      .filter((id): id is number => 
                        typeof id === 'number' && 
                        id > 0 && 
                        !isNaN(id) && 
                        Number.isInteger(id)
                      )
                      .filter((id, index, arr) => arr.indexOf(id) === index);
                  } else {
                    redemptionHistory = [];
                  }
                  
                  console.log('Parsed redemption history:', redemptionHistory);
                }
              }
            } catch (historyError) {
              console.log('Could not fetch redemption history:', historyError);
              redemptionHistory = [];
            }
          }
          
          setShopInfo({
            admin,
            nftTemplatesCount: nftIds.length,
            nftIds,
            userVoucherStatus,
            redemptionHistory
          });
        } else {
          setError("Could not fetch voucher shop data");
        }

      } catch (err) {
        console.error("Error fetching shop info:", err);
        setError(err instanceof Error ? err.message : "Failed to load shop information");
      } finally {
        setLoading(false);
      }
    };

    fetchShopInfo();
  }, [client, voucherShopObject, packageId, account?.address]);

  if (loading) return (
    <Tooltip content="Loading real-time shop data and your voucher status...">
      <div style={{
        padding: "2rem 1.5rem",
        background: "rgba(17, 25, 40, 0.6)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        textAlign: "center",
        maxWidth: "900px",
        width: "100%",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
      }}>
        <Loading />
      </div>
    </Tooltip>
  );
  
  if (error) {
    return (
      <div style={{ 
        padding: "1.5rem", 
        background: "rgba(239, 68, 68, 0.08)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(239, 68, 68, 0.2)", 
        borderRadius: "14px", 
        maxWidth: "900px",
        width: "100%",
        boxShadow: "0 4px 24px rgba(239, 68, 68, 0.1)"
      }}>
        <Tooltip content="This error occurred while fetching shop data. Click the link below to verify the shop object on the blockchain.">
          <p style={{ 
            color: "#FCA5A5", 
            margin: "0 0 0.75rem 0",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: "500"
          }}>
            <span style={{ fontSize: "1.1rem" }}>⚠️</span>
            Error loading shop information: {error}
          </p>
        </Tooltip>
        <Tooltip content="View the smart contract object directly on the IOTA Explorer to debug issues">
          <p style={{ color: "#94A3B8", margin: 0, fontSize: "0.875rem" }}>
            Check details on{' '}
            <a 
              href={`https://explorer.iota.org/object/${voucherShopObject}?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#8B5CF6', 
                textDecoration: 'none',
                fontWeight: '500',
                borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
                paddingBottom: '1px'
              }}
            >
              IOTA Explorer
            </a>
          </p>
        </Tooltip>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "2rem", 
      background: "rgba(17, 25, 40, 0.6)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "18px",
      maxWidth: "900px",
      width: "100%",
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.25)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated gradient border */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: "linear-gradient(90deg, #8B5CF6, #3B82F6, #6366F1, #8B5CF6)",
        backgroundSize: "200% 100%",
        animation: "shimmer 3s ease infinite",
      }} />
      
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
      
      <AvailableVouchersHeader shopInfo={shopInfo} account={account} />
      <AvailableVouchersContent shopInfo={shopInfo} account={account} />
    </div>
  );
}