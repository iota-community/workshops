import Tooltip from "../components/molecules/Tooltip";
import { AvailableVouchersHeaderProps } from "../types";
import { FiInfo } from "react-icons/fi";

export default function AvailableVouchersHeader({ shopInfo, account }: AvailableVouchersHeaderProps) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "1.5rem",
      paddingBottom: "1rem",
      borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem"
      }}>
        <Tooltip content="Voucher Shop Dashboard - Monitor real-time status, available NFTs, and your voucher state">
          <div style={{
            padding: "0.5rem",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)",
            borderRadius: "10px",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            cursor: "help"
          }}>
            <span style={{ fontSize: "1.25rem" }}>🏪</span>
          </div>
        </Tooltip>
        <div>
          <Tooltip content="Main dashboard showing contract details, your status, and available actions">
            <h3 style={{
              color: "#F1F5F9",
              fontSize: "1.4rem",
              fontWeight: "700",
              margin: 0,
              background: "linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              cursor: "help"
            }}>
              Shop Overview
            </h3>
          </Tooltip>
          <Tooltip content="Live data from the blockchain updated in real-time">
            <p style={{
              color: "#94A3B8",
              fontSize: "0.875rem",
              margin: "0.25rem 0 0 0",
              fontWeight: "400",
              cursor: "help"
            }}>
              Real-time status & analytics
            </p>
          </Tooltip>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: "flex",
        gap: "1rem",
        alignItems: "center"
      }}>
        <Tooltip content="Number of available NFT templates that can be redeemed with vouchers">
          <div style={{
            textAlign: "center",
            padding: "0.5rem 0.75rem",
            background: "rgba(139, 92, 246, 0.1)",
            borderRadius: "8px",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            cursor: "help"
          }}>
            <div style={{ 
              color: "#8B5CF6", 
              fontSize: "1.1rem",
              fontWeight: "700",
              lineHeight: "1.2",
              display: "flex",
            alignItems: "center",
                gap: "0.4rem",
            }}>
              <FiInfo size={12} style={{ opacity: 0.8, flexShrink: 0,color: "white" }} />{shopInfo?.nftTemplatesCount || 0}
            </div>
            <div style={{ 
              color: "#C4B5FD", 
              fontSize: "0.75rem",
              fontWeight: "500"
            }}>
              Templates
            </div>
          </div>
        </Tooltip>
        
        {account && (
          <Tooltip content="Number of vouchers you currently own (max 1 per address)">
            <div style={{
              textAlign: "center",
              padding: "0.5rem 0.75rem",
              background: "rgba(59, 130, 246, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              cursor: "help"
            }}>
              <div style={{ 
                color: "#3B82F6", 
                fontSize: "1.1rem",
                fontWeight: "700",
                lineHeight: "1.2",
                 display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
              }}>
                <FiInfo size={12} style={{ opacity: 0.8, flexShrink: 0,color: "white" }} />{shopInfo?.userVoucherStatus?.hasVoucher ? '1' : '0'}
              </div>
              <div style={{ 
                color: "#93C5FD", 
                fontSize: "0.75rem",
                fontWeight: "500",
              }}>
                Vouchers
              </div>
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
}