import { FiInfo } from "react-icons/fi";
import Tooltip from "../components/molecules/Tooltip";
import { AvailableVouchersContentProps } from "../types";

export default function AvailableVouchersContent({ shopInfo, account }: AvailableVouchersContentProps) {
  if (!shopInfo) {
    return (
      <Tooltip content="Shop data couldn't be loaded. This might be a temporary issue or the shop object might not exist.">
        <div style={{ 
          padding: "1.5rem", 
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.02)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          cursor: "help"
        }}>
          <p style={{ color: "#94A3B8", margin: 0, fontSize: "0.9rem" }}>No shop information available</p>
        </div>
      </Tooltip>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* Main Info Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem"
      }}>
        {/* Shop Details */}
        <div style={{ 
          padding: "1.25rem", 
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)", 
          borderRadius: "12px",
          position: "relative"
        }}>
          <Tooltip content="Smart contract configuration and administrative details">
            <h4 style={{ 
              color: "#E2E8F0", 
              margin: "0 0 0.75rem 0",
              fontSize: "1rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "help"
            }}>
              <span style={{ 
                color: "#8B5CF6",
                fontSize: "1.1rem"
              }}>⚡</span>
              Contract Details
            </h4>
          </Tooltip>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <div>
              <Tooltip content="The administrator address that can manage NFT templates and shop settings">
                <div style={{ 
                  color: "#94A3B8", 
                  fontSize: "0.8rem", 
                  fontWeight: "500", 
                  marginBottom: "0.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  cursor: "help"
                }}>
                  <FiInfo size={12} style={{ opacity: 0.8, flexShrink: 0 }} />
                  Admin
                </div>
              </Tooltip>
              <Tooltip content="This address controls the smart contract and can add/remove NFT templates">
                <code style={{ 
                  fontSize: "0.8rem",
                  background: "rgba(139, 92, 246, 0.08)",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid rgba(139, 92, 246, 0.15)",
                  color: "#E2E8F0",
                  display: "block",
                  wordBreak: "break-all",
                  cursor: "help"
                }}>{shopInfo.admin}</code>
              </Tooltip>
            </div>
            <div>
              <Tooltip content="Unique identifiers for available NFT templates that can be redeemed">
                <div style={{ 
                  display: "flex", 
                  gap: "0.4rem",
                  alignItems: "center",
                  color: "#94A3B8", 
                  fontSize: "0.8rem", 
                  fontWeight: "500", 
                  marginBottom: "0.25rem",
                  cursor: "help"
                }}>
                  <FiInfo size={12} style={{ opacity: 0.8, flexShrink: 0 }} /> 
                  NFT Template IDs
                </div>
              </Tooltip>
              <Tooltip content="Each ID represents a unique NFT design. You'll need these IDs when redeeming vouchers">
                <div style={{ 
                  color: "#CBD5E1", 
                  fontSize: "0.8rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  minHeight: "2.5rem",
                  display: "flex",
                  alignItems: "center",
                  cursor: "help"
                }}>
                  {shopInfo.nftIds.length > 0 ? 
                    shopInfo.nftIds.join(', ') : 'No templates available'
                  }
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* User Status */}
        {account && shopInfo.userVoucherStatus && (
          <div style={{ 
            padding: "1.25rem", 
            background: "rgba(59, 130, 246, 0.06)",
            border: "1px solid rgba(59, 130, 246, 0.15)",
            borderRadius: "12px",
            position: "relative"
          }}>
            <Tooltip content="Your personal voucher status and redemption history">
              <h4 style={{ 
                color: "#E2E8F0", 
                margin: "0 0 0.75rem 0",
                fontSize: "1rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "help"
              }}>
                <span style={{ 
                  color: "#3B82F6",
                  fontSize: "1.1rem"
                }}>👤</span>
                Your Status
              </h4>
            </Tooltip>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <Tooltip content="Current state of your voucher - whether you have one and if it's been used">
                  <div style={{ 
                    color: "#94A3B8", 
                    fontSize: "0.8rem", 
                    fontWeight: "500", 
                    marginBottom: "0.4rem",
                    cursor: "help"
                  }}>
                    Voucher Status
                  </div>
                </Tooltip>
                {shopInfo.userVoucherStatus.hasVoucher ? (
                  shopInfo.userVoucherStatus.isVoucherUsed ? (
                    <Tooltip content="You've successfully redeemed your voucher and received an NFT. Each address can only use one voucher.">
                      <div style={{ 
                        color: "#10B981", 
                        fontWeight: "600",
                        background: "rgba(16, 185, 129, 0.1)",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.85rem",
                        cursor: "help"
                      }}>
                        <span>✅</span>
                        Claimed & Used
                      </div>
                    </Tooltip>
                  ) : (
                    <Tooltip content="You have an active voucher ready to be redeemed for any available NFT template">
                      <div style={{ 
                        color: "#60A5FA", 
                        fontWeight: "600",
                        background: "rgba(96, 165, 250, 0.1)",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(96, 165, 250, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.85rem",
                        cursor: "help"
                      }}>
                        <span>🎯</span>
                        Ready to Redeem
                      </div>
                    </Tooltip>
                  )
                ) : (
                  <Tooltip content="You haven't claimed a voucher yet. Click 'Claim Voucher' to get started!">
                    <div style={{ 
                      color: "#F87171", 
                      fontWeight: "600",
                      background: "rgba(248, 113, 113, 0.1)",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(248, 113, 113, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.85rem",
                      cursor: "help"
                    }}>
                      <span>⏳</span>
                      Not Claimed
                    </div>
                  </Tooltip>
                )}
              </div>
              
              <div>
                <Tooltip content="NFTs you've successfully redeemed using your vouchers">
                  <div style={{ 
                    display: "flex", 
                    marginTop: "1rem", 
                    gap: "0.4rem", 
                    alignItems: "center", 
                    color: "#94A3B8", 
                    fontSize: "0.8rem", 
                    fontWeight: "500", 
                    marginBottom: "0.25rem",
                    cursor: "help"
                  }}>
                    <FiInfo size={12} style={{ opacity: 0.8, flexShrink: 0 }} />
                    Redeemed NFTs
                  </div>
                </Tooltip>
                <Tooltip content="These are the NFT template IDs you've successfully redeemed. Check your wallet for the actual NFTs.">
                  <div style={{ 
                    color: shopInfo.redemptionHistory && shopInfo.redemptionHistory.length > 0 ? "#E2E8F0" : "#94A3B8",
                    background: "rgba(255, 255, 255, 0.04)",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    fontSize: "0.8rem",
                    fontStyle: shopInfo.redemptionHistory && shopInfo.redemptionHistory.length > 0 ? "normal" : "italic",
                    cursor: "help"
                  }}>
                    {shopInfo.redemptionHistory && shopInfo.redemptionHistory.length > 0 
                      ? `Your Redeemed NFT IDs: ${shopInfo.redemptionHistory.join(', ')}`
                      : "No NFTs redeemed yet"
                    }
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Actions */}
      <div style={{ 
        padding: "1.25rem", 
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.06)", 
        borderRadius: "12px" 
      }}>
        <Tooltip content="Actions you can perform based on your current status and available NFTs">
          <h4 style={{ 
            color: "#E2E8F0", 
            margin: "0 0 0.75rem 0",
            fontSize: "1rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "help"
          }}>
            <span style={{ 
              color: "#10B981",
              fontSize: "1.1rem"
            }}>🚀</span>
            Available Actions
          </h4>
        </Tooltip>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem" }}>
          {!account ? (
            <Tooltip content="Connect your wallet to interact with the voucher shop system">
              <div style={{ 
                color: "#FCA5A5", 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem",
                padding: "0.6rem 0.75rem",
                background: "rgba(252, 165, 165, 0.08)",
                borderRadius: "8px",
                border: "1px solid rgba(252, 165, 165, 0.15)",
                cursor: "help"
              }}>
                <span>🔒</span>
                Connect wallet to interact with the shop
              </div>
            </Tooltip>
          ) : (
            <>
              {!shopInfo.userVoucherStatus?.hasVoucher && (
                <Tooltip content="Get your exclusive voucher that can be redeemed for limited edition NFTs">
                  <div style={{ 
                    color: "#86EFAC", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.5rem",
                    padding: "0.6rem 0.75rem",
                    background: "rgba(134, 239, 172, 0.08)",
                    borderRadius: "8px",
                    border: "1px solid rgba(134, 239, 172, 0.15)",
                    cursor: "help"
                  }}>
                    <span>📋</span>
                    You can claim a voucher
                  </div>
                </Tooltip>
              )}
              {shopInfo.userVoucherStatus?.hasVoucher && !shopInfo.userVoucherStatus?.isVoucherUsed && shopInfo.nftTemplatesCount > 0 && (
                <Tooltip content="Use your active voucher to redeem any available NFT template from the catalog">
                  <div style={{ 
                    color: "#93C5FD", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.5rem",
                    padding: "0.6rem 0.75rem",
                    background: "rgba(147, 197, 253, 0.08)",
                    borderRadius: "8px",
                    border: "1px solid rgba(147, 197, 253, 0.15)",
                    cursor: "help"
                  }}>
                    <span>🎁</span>
                    You can redeem your voucher for an NFT
                  </div>
                </Tooltip>
              )}
              {shopInfo.userVoucherStatus?.hasVoucher && shopInfo.userVoucherStatus?.isVoucherUsed && (
                <Tooltip content="You've already used your voucher. Each address can only redeem one voucher.">
                  <div style={{ 
                    color: "#CBD5E1", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.5rem",
                    padding: "0.6rem 0.75rem",
                    background: "rgba(203, 213, 225, 0.08)",
                    borderRadius: "8px",
                    border: "1px solid rgba(203, 213, 225, 0.15)",
                    cursor: "help"
                  }}>
                    <span>✨</span>
                    You have already redeemed your voucher
                  </div>
                </Tooltip>
              )}
              {shopInfo.nftTemplatesCount === 0 && (
                <Tooltip content="The admin needs to add NFT templates before vouchers can be redeemed">
                  <div style={{ 
                    color: "#FDBA74", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.5rem",
                    padding: "0.6rem 0.75rem",
                    background: "rgba(253, 186, 116, 0.08)",
                    borderRadius: "8px",
                    border: "1px solid rgba(253, 186, 116, 0.15)",
                    cursor: "help"
                  }}>
                    <span>⚠️</span>
                    No NFT templates available for redemption
                  </div>
                </Tooltip>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}