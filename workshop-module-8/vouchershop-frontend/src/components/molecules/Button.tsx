import { Button as RadixButton } from "@radix-ui/themes";
import Tooltip from "./Tooltip";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  tooltip?: string;
  loading?: boolean;
  hoverStyle?: React.CSSProperties;

}

export default function Button({
  children,
  onClick,
  disabled = false,
  style = {},
  tooltip,
  loading = false,
}: ButtonProps) {
  const buttonContent = (
    <RadixButton
      radius="medium"
      style={{ 
        background: "#0101ff", 
        borderRadius: "8px",
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        ...style 
      }}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? "⏳ Processing..." : children}
    </RadixButton>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip}>
        <div style={{ display: 'inline-block' }}>
          {buttonContent}
        </div>
      </Tooltip>
    );
  }

  return buttonContent;
}