import { Card, Flex, Text, Box } from "@radix-ui/themes";
import Confetti from "react-confetti";
import { useState, useEffect } from "react";
import { CelebrationModalProps } from "../../types";
import Button from "./Button";

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

export default function CelebrationModal({
  isOpen,
  onClose,
  title = "🎉 Congratulations! 🎉",
  message = "You've successfully completed the action!",
  badge,
}: CelebrationModalProps) {
  const { width, height } = useWindowSize();
  const [confettiRunning, setConfettiRunning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setConfettiRunning(true);
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setConfettiRunning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      <Confetti
        width={width}
        height={height}
        recycle={confettiRunning}
        numberOfPieces={200}
        gravity={0.3}
      />
      <Card
        style={{
          padding: "2rem",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          maxWidth: "400px",
          textAlign: "center",
          borderRadius: "16px",
          border: "1px solid #4dabf7",
          boxShadow: "0 20px 40px rgba(77, 171, 247, 0.3)",
          margin: "1rem",
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <Text size="6" weight="bold" style={{ color: "#4dabf7" }}>
            {title}
          </Text>
          
          <Text size="3" style={{ color: "#a0aec0", lineHeight: "1.6" }}>
            {message}
          </Text>

          {/* Display badge if provided */}
          {badge && (
            <Box
              style={{
                padding: "1.5rem",
                background: "rgba(45, 55, 72, 0.6)",
                borderRadius: "12px",
                marginTop: "1rem",
                border: "1px solid #4dabf7",
              }}
            >
              <img
                src={badge.image_uri}
                alt={badge.name}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                }}
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzMzMzMzIi8+Cjx0ZXh0IHg9IjYwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ORlQ8L3RleHQ+Cjwvc3ZnPgo=";
                }}
              />
              <Text
                weight="bold"
                style={{ color: "white", display: "block", marginBottom: "0.25rem" }}
              >
                {badge.name}
              </Text>
              <Text
                size="2"
                style={{ color: "#cbd5e0", display: "block" }}
              >
                {badge.description}
              </Text>
            </Box>
          )}

          <Button 
            onClick={onClose} 
            style={{ 
              marginTop: "1.5rem", 
              width: "100%",
              background: "linear-gradient(135deg, #4dabf7 0%, #3b82f6 100%)",
            }}
          >
            Awesome!
          </Button>
        </Flex>
      </Card>
    </Box>
  );
}