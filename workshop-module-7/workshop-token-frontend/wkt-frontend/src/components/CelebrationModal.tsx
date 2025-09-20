import { Card, Flex, Text, Box } from "@radix-ui/themes";
import Confetti from "react-confetti";
import { useState, useEffect } from "react";
import { WorkshopBadge } from "../types";
import Button from "./molecules/Button";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: WorkshopBadge | null;
}

// A simple hook to get window dimensions for the confetti
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export default function CelebrationModal({ isOpen, onClose, badge }: CelebrationModalProps) {
  const { width, height } = useWindowSize();

  if (!isOpen || !badge) return null;

  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
      <Card
        style={{
          padding: 32,
          background: "#1a1a1a",
          maxWidth: 400,
          textAlign: "center",
          borderRadius: 12,
          border: "1px solid #51cf66",
          boxShadow: "0 8px 24px rgba(81, 207, 102, 0.3)",
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <Text size="7" weight="bold" style={{ color: "#51cf66" }}>
            🎉 Congratulations! 🎉
          </Text>
          <Text size="4" style={{ color: "#a0aec0" }}>
            You've earned a new NFT Badge for making your first transaction!
          </Text>
          
          {/* Display the new badge */}
          <Box style={{ padding: '16px', background: '#2d3748', borderRadius: '8px', marginTop: '16px' }}>
            <img 
              src={badge.url} 
              alt={badge.workshop_id} 
              style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: '8px' }} 
            />
            <Text weight="bold" style={{ color: 'white', marginTop: '8px', display: 'block' }}>
              Workshop Badge #{badge.workshop_id}
            </Text>
          </Box>

          <Button onClick={onClose} style={{ marginTop: 24, width: "100%" }}>
            Awesome!
          </Button>
        </Flex>
      </Card>
    </Box>
  );
}