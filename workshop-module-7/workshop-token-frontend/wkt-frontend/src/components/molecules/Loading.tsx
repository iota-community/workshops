import { Flex, Text, Card } from "@radix-ui/themes";
import { FiHexagon } from "react-icons/fi";

export default function Loading() {
  // Define a subtle pulsing animation
  const pulseAnimation = `@keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(0.95);
    }
  }`;

  return (
    <>
      <style>{pulseAnimation}</style>
      <Flex
        align="center"
        justify="center"
        style={{ 
          minHeight: "200px", 
          padding: "40px", 
        }}
        role="status"
        aria-live="polite"
      >
        <Card style={{ background: 'var(--gray-a2)', padding: '32px' }}>
          <Flex direction="column" align="center" gap="4">
            <FiHexagon 
              size={48} 
              color="var(--accent-9)" 
              style={{
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
              aria-label="Loading indicator"
            />
            <Text size="3" weight="medium" style={{ color: "var(--gray-11)" }}>
              Fetching data...
            </Text>
          </Flex>
        </Card>
      </Flex>
    </>
  );
}