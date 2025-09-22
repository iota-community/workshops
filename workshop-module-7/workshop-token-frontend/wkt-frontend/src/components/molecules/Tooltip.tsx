import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ReactNode, useEffect, useState } from "react";
import { FiInfo } from "react-icons/fi";

// Keyframes for a smooth "pop-up" animation with bounce effect
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

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
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
    background: "linear-gradient(135deg, #190e5e51 0%, #333e4e 100%)",
    color: "hsl(210, 40%, 98%)",
    padding: "14px 18px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 500,
    maxWidth: "320px",
    textAlign: "center",
    boxShadow: `
      0 20px 40px -10px rgba(0, 0, 0, 0.4),
      0 10px 20px -5px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    zIndex: 1000,
    border: "1px solid rgba(66, 153, 225, 0.3)",
    lineHeight: "1.3",
    animation: "tooltip-pop-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    backdropFilter: "blur(12px)",
    transition: "all 0.2s ease-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontStyle: "normal",
    letterSpacing: "0.5px",
  };

  const tooltipArrowStyle: React.CSSProperties = {
    fill: "#f3f4f5ff",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
    animation: "tooltip-fade-in 0.3s ease-out",
    transition: "all 0.2s ease-out",
  };

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            style={tooltipContentStyle}
            side={side}
            align={align}
            sideOffset={8}
          >
            <FiInfo size={14} style={{ marginRight: "8px", opacity: 0.9 }} />
            <span style={{ flex: 1 }}>{content}</span>
            <TooltipPrimitive.Arrow
              style={tooltipArrowStyle}
              width={14}
              height={7}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
