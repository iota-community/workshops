import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useEffect, useState } from "react";
import { FiInfo } from "react-icons/fi";
import { TooltipProps } from "../../types";

const keyframes = `
  @keyframes tooltip-pop-up {
    0% {
      opacity: 0;
      transform: translateY(8px) scale(0.95);
    }
    50% {
      transform: translateY(-2px) scale(1.02);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes tooltip-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Inject keyframes into the document head
if (typeof window !== "undefined") {
  const styleSheetId = "tooltip-popup-styles";
  if (!document.getElementById(styleSheetId)) {
    const styleSheet = document.createElement("style");
    styleSheet.id = styleSheetId;
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);
  }
}

export default function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
}: TooltipProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tooltipContentStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #1a1f36 0%, #2d3748 100%)",
    color: "hsl(210, 40%, 98%)",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    maxWidth: "280px",
    textAlign: "center",
    boxShadow: `
      0 10px 25px -5px rgba(0, 0, 0, 0.3),
      0 8px 10px -6px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    zIndex: 1000,
    border: "1px solid rgba(66, 153, 225, 0.3)",
    lineHeight: "1.4",
    animation: "tooltip-pop-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    backdropFilter: "blur(8px)",
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  };

  const tooltipArrowStyle: React.CSSProperties = {
    fill: "#2d3748",
    filter: "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3))",
  };

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            style={tooltipContentStyle}
            side={side}
            align={align}
            sideOffset={6}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FiInfo size={12} style={{ opacity: 0.8, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{content}</span>
            </div>
            <TooltipPrimitive.Arrow
              style={tooltipArrowStyle}
              width={11}
              height={6}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}