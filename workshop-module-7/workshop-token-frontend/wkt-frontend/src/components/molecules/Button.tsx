import { Button as RadixButton } from "@radix-ui/themes";
import { forwardRef } from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, onClick, disabled = false, style = {} }, ref) => {
    return (
      <RadixButton
        ref={ref}
        radius="none"
        style={{ 
          background: disabled ? "#666" : "#0101ff", 
          borderRadius: "8px", 
          cursor: disabled ? "not-allowed" : "pointer", 
          ...style 
        }}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </RadixButton>
    );
  }
);

Button.displayName = "Button";

export default Button;