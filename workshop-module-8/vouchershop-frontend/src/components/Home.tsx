import { Flex } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { OPERATIONS } from "../constants";
import Button from "./molecules/Button";
import NFTStorefront from "./NFTStorefront";
import ClaimVoucher from "./ClaimVoucher";
import RedeemVoucher from "./RedeemVoucher";
import { useVoucherShop } from "../hooks/useVoucherShop";
import AvailableVouchers from "../AvailableVouchers/AvailableVouchers";
import Tooltip from "./molecules/Tooltip";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const { account, selectedNft, setSelectedNft, checkVoucherStatus } = useVoucherShop();
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  // Check voucher status when account connects
  useEffect(() => {
    const checkStatus = async () => {
      if (account?.address) {
        try {
          const status = await checkVoucherStatus(account.address);
          
          // Show welcome toast with voucher status
          if (status.hasVoucher) {
            if (status.isVoucherUsed) {
              toast.success('🎉 Welcome back! Your voucher has been redeemed.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            } else {
              toast.info('🎁 You have an active voucher ready to redeem!', {
                position: "top-right",
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }
          } else {
            toast.info('👋 Welcome! Claim your voucher to get started.', {
              position: "top-right",
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        } catch (error) {
          console.error('Error checking voucher status:', error);
        }
      }
    };

    checkStatus();
  }, [account?.address]);

  // Show toast when user selects an operation
  useEffect(() => {
    if (activeOperation === "ClaimVoucher") {
      toast.info('💫 Ready to claim your exclusive voucher!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else if (activeOperation === "RedeemVoucher") {
      toast.info('🖼️ Browse available NFTs for redemption', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [activeOperation]);

  return (
    <Flex 
      direction="column" 
      align="center" 
      gap="5"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
        padding: "1.5rem 1rem",
        position: "relative"
      }}
    >
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{
          fontSize: '14px',
          zIndex: 10000
        }}
        toastStyle={{
          background: 'rgba(17, 25, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '12px',
          color: '#F1F5F9'
        }}
      />

      {/* Animated background elements */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "200px",
        height: "200px",
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(40px)",
        zIndex: 0
      }} />
      
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "5%",
        width: "150px",
        height: "150px",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(30px)",
        zIndex: 0
      }} />

      {/* Header */}
      <div style={{
        width: "100%",
        maxWidth: "900px",
        textAlign: "center",
        marginBottom: "1rem",
        position: "relative",
        zIndex: 1
      }}>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: "800",
          background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #6366F1 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "0.5rem",
          textShadow: "0 2px 12px rgba(139, 92, 246, 0.3)",
          letterSpacing: "-0.5px"
        }}>
          VoucherShop
        </h1>
        <p style={{
          color: "#94A3B8",
          fontSize: "1rem",
          fontWeight: "400",
          margin: 0,
          maxWidth: "400px",
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: "1.4"
        }}>
          Exclusive digital collectibles • Limited edition vouchers
        </p>
      </div>

      {/* Wallet Connection Banner */}
      {account && (
        <div style={{ 
          padding: "1rem 1.5rem", 
          marginBottom: "0.5rem",
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
          position: "relative",
          overflow: "hidden",
          maxWidth: "900px",
          width: "100%",
          zIndex: 1
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, #8B5CF6, #3B82F6, #6366F1)",
          }} />
          <p style={{ 
            margin: "0", 
            color: "#E2E8F0", 
            fontWeight: "500",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem"
          }}>
            <span style={{
              padding: "0.4rem",
              background: "rgba(139, 92, 246, 0.15)",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center"
            }}>
              👋
            </span>
            Connected: <code style={{ 
              backgroundColor: "rgba(139, 92, 246, 0.12)", 
              padding: "0.4rem 0.8rem", 
              borderRadius: "8px",
              fontWeight: "600",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              color: "#E2E8F0",
              fontSize: "0.85rem",
              letterSpacing: "0.3px"
            }}>{`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}</code>
          </p>
        </div>
      )}

      <AvailableVouchers />

      {account && (
        <Flex direction="column" gap="6" mt="2" align="center" style={{ width: "100%", maxWidth: "900px", zIndex: 1 }}>
      
          {activeOperation === null && (
            <div style={{
              padding: "2rem 1.5rem",
              background: "rgba(17, 25, 40, 0.6)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)"
            }}>
              <h2 style={{
                textAlign: "center",
                color: "#F1F5F9",
                fontSize: "1.5rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
                background: "linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Get Started
              </h2>
              
              <Flex direction="row" gap="4" wrap="wrap" justify="center">
                {OPERATIONS.map((op) => (
                  <Tooltip 
                    key={op.name} 
                    content={op.name === 'ClaimVoucher' 
                      ? "Get your exclusive voucher to start collecting NFTs" 
                      : "Use your voucher to redeem limited edition NFTs"
                    }
                  >
                    <div style={{
                      position: "relative",
                      flex: "1",
                      minWidth: "160px"
                    }}>
                      <div style={{
                        position: "absolute",
                        inset: "-1px",
                        background: op.name === 'ClaimVoucher' 
                          ? "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)"
                          : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                        borderRadius: "12px",
                        filter: "blur(6px)",
                        opacity: 0.5,
                        zIndex: 0
                      }} />
                      <Button 
                        onClick={() => setActiveOperation(op.name)}
                        style={{ 
                          minHeight: "100px",
                          background: op.name === 'ClaimVoucher' 
                            ? "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)"
                            : "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.12) 100%)",
                          padding: "1.25rem",
                          fontSize: "0.95rem",
                          fontWeight: "600",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          backdropFilter: "blur(16px)",
                          color: "#F1F5F9",
                          borderRadius: "11px",
                          position: "relative",
                          zIndex: 1,
                          transition: "all 0.3s ease",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.75rem",
                          width: "100%"
                        }}
                        hoverStyle={{
                          transform: "translateY(-3px)",
                          boxShadow: "0 8px 25px rgba(139, 92, 246, 0.25)"
                        }}
                      >
                        <div style={{
                          fontSize: "2rem",
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                        }}>
                          {op.name === 'ClaimVoucher' ? '🎟️' : '🛍️'}
                        </div>
                        {op.description}
                        <div style={{
                          fontSize: "0.8rem",
                          opacity: 0.8,
                          fontWeight: "400",
                          marginTop: "2px"
                        }}>
                          {op.name === 'ClaimVoucher' ? 'Get Voucher' : 'Redeem NFT'}
                        </div>
                      </Button>
                    </div>
                  </Tooltip>
                ))}
              </Flex>
            </div>
          )}

          {activeOperation === "ClaimVoucher" && <ClaimVoucher />}

          {activeOperation === "RedeemVoucher" && (
            <Flex direction="column" gap="5" align="center" style={{ width: "100%" }}>
              <NFTStorefront onSelect={setSelectedNft} />
              {selectedNft && <RedeemVoucher nftId={selectedNft} />}
            </Flex>
          )}
        </Flex>
      )}

      {activeOperation !== null && (
        <Flex direction="column" align="center" mt="3" gap="2" style={{ zIndex: 1 }}>
          <Tooltip content="Return to the main dashboard">
            <div>
              <Button
                onClick={() => {
                  setActiveOperation(null);
                  toast.info('🏠 Returning to dashboard', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  });
                }}
                style={{ 
                  background: "linear-gradient(135deg, rgba(107, 114, 128, 0.12) 0%, rgba(75, 85, 99, 0.12) 100%)",
                  color: "#E2E8F0",
                  padding: "0.75rem 1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(16px)",
                  borderRadius: "10px",
                  fontWeight: "500",
                  fontSize: "0.85rem"
                }}
                hoverStyle={{
                  background: "linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(75, 85, 99, 0.2) 100%)",
                  transform: "translateY(-1px)"
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