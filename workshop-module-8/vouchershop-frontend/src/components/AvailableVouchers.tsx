import { useEffect, useState } from "react";
import { useVoucherShop } from "../hooks/useVoucherShop";
import { Transaction } from "@iota/iota-sdk/transactions";
import Loading from "./molecules/Loading";
import { VoucherShopInfo } from "../types";

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
        
        // Get the shop object to extract information
        const shopObject = await client.getObject({
          id: voucherShopObject,
          options: { showContent: true }
        });

        if (shopObject.data?.content && shopObject.data.content.dataType === 'moveObject') {
          const fields = (shopObject.data.content as any).fields;
          console.log('Shop object fields:', fields);
          
          // Extract information from the contract fields
          const admin = fields.admin;
          const nftIds = fields.nft_ids || [];
          
          let userVoucherStatus: { hasVoucher: boolean; isVoucherUsed: boolean } | undefined;
          let redemptionHistory: number[] = [];

          // If user is connected, get their voucher status and redemption history
          if (account?.address) {
            // Get voucher status inline to avoid function dependency
            try {
              // Check if has voucher
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
                  hasVoucher = returnValues[0][0][0] === 1; // Convert from bytes
                }
              }

              let isVoucherUsed = false;
              if (hasVoucher) {
                // Check if voucher is used
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
                    isVoucherUsed = returnValues[0][0][0] === 1; // Convert from bytes
                  }
                }
              }

              userVoucherStatus = { hasVoucher, isVoucherUsed };
            } catch (voucherError) {
              console.log('Could not fetch voucher status:', voucherError);
              userVoucherStatus = { hasVoucher: false, isVoucherUsed: false };
            }
            
            // Get user's redemption history
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
                  // Parse the redemption history from bytes
                  // For now, just try to extract the length or basic info
                  const rawData = returnValues[0][0];
                  if (Array.isArray(rawData) && rawData.length > 0) {
                    // This is a simplified parsing - in reality you'd need BCS decoding
                    // For now, just show that there is redemption history
                    redemptionHistory = rawData.length > 0 ? [1] : []; // Placeholder
                  }
                  console.log('Redemption history raw data:', returnValues[0]);
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

  if (loading) return <Loading />;
  
  if (error) {
    return (
      <div style={{ padding: "1rem", border: "1px solid #ff6b6b", borderRadius: "8px", backgroundColor: "#ffe0e0" }}>
        <p style={{ color: "#d63031" }}>Error loading shop information: {error}</p>
        <p>
          You can check the voucher shop details on the{' '}
          <a 
            href={`https://explorer.iota.org/object/${voucherShopObject}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'blue', textDecoration: 'underline' }}
          >
            IOTA Explorer
          </a>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#242526ff", marginTop: "1rem" }}>
      <h3>🏪 Voucher Shop Information</h3>
      
      {shopInfo ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          
          {/* Shop Details */}
          <div style={{ padding: "1rem", backgroundColor: "#38393aff", border: "1px solid #ccc", borderRadius: "6px" }}>
            <h4 style={{ margin: "0 0 0.5rem 0" }}>Shop Details</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <div><strong>Admin:</strong> <code style={{ fontSize: "0.875rem" }}>{shopInfo.admin}</code></div>
              <div><strong>Available NFT Templates:</strong> {shopInfo.nftTemplatesCount}</div>
              <div>
                <strong>Template IDs:</strong> {shopInfo.nftIds.length > 0 ? 
                  shopInfo.nftIds.join(', ') : 'None'
                }
              </div>
            </div>
          </div>

          {/* User Status (only if connected) */}
          {account && shopInfo.userVoucherStatus && (
            <div style={{ padding: "1rem", backgroundColor: "#4976a3ff", borderRadius: "6px" }}>
              <h4 style={{ margin: "0 0 0.5rem 0" }}>Your Status</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div>
                  <strong>Voucher Status:</strong>{' '}
                  {shopInfo.userVoucherStatus.hasVoucher ? (
                    shopInfo.userVoucherStatus.isVoucherUsed ? (
                      <span style={{ color: "#f5f0f0ff" }}>✅ Claimed and Used</span>
                    ) : (
                      <span style={{ color: "#f5f0f0ff" }}>✅ Claimed (Ready to Redeem)</span>
                    )
                  ) : (
                    <span style={{ color: "#721c24" }}>❌ Not Claimed</span>
                  )}
                </div>
                
                {shopInfo.redemptionHistory && shopInfo.redemptionHistory.length > 0 && (
                  <div>
                    <strong>Redeemed Templates:</strong> {shopInfo.redemptionHistory.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Available Actions */}
          <div style={{ padding: "1rem", backgroundColor: "#343637ff", borderRadius: "6px" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color:'white' }}>Available Actions</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.875rem" }}>
              {!account ? (
                <div style={{ color: "#be5560ff" }}>🔒 Connect wallet to interact with the shop</div>
              ) : (
                <>
                  {!shopInfo.userVoucherStatus?.hasVoucher && (
                    <div style={{ color: "#a8d5b2ff" }}>📋 You can claim a voucher</div>
                  )}
                  {shopInfo.userVoucherStatus?.hasVoucher && !shopInfo.userVoucherStatus?.isVoucherUsed && shopInfo.nftTemplatesCount > 0 && (
                    <div style={{ color: "#d1d6e1ff" }}>🎁 You can redeem your voucher for an NFT</div>
                  )}
                  {shopInfo.userVoucherStatus?.hasVoucher && shopInfo.userVoucherStatus?.isVoucherUsed && (
                    <div style={{ color: "#d1d6e1ff" }}>✨ You have already redeemed your voucher</div>
                  )}
                  {shopInfo.nftTemplatesCount === 0 && (
                    <div style={{ color: "#d1d6e1ff" }}>⚠️ No NFT templates available for redemption</div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Shop Stats */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
            gap: "0.5rem",
            fontSize: "0.875rem" 
          }}>
            <div style={{ 
              padding: "0.75rem", 
              backgroundColor: "#22281dff", 
              border: "1px solid #dee2e6", 
              borderRadius: "4px",
              textAlign: "center"
            }}>
              <div style={{ fontWeight: "bold", color: "#f5f7f8ff" }}>{shopInfo.nftTemplatesCount}</div>
              <div style={{ color: "#dee3e8ff" }}>NFT Templates</div>
            </div>
            
            <div style={{ 
              padding: "0.75rem", 
              backgroundColor: "#1f2d964b", 
              border: "1px solid #dee2e6", 
              borderRadius: "4px",
              textAlign: "center"
            }}>
              <div style={{ fontWeight: "bold", color: "#eef1f4ff" }}>
                {shopInfo.userVoucherStatus?.hasVoucher ? '1' : '0'}
              </div>
              <div style={{ color: "#eaeef1ff" }}>Your Vouchers</div>
            </div>
          </div>

        </div>
      ) : (
        <p>No shop information available</p>
      )}
    </div>
  );
}