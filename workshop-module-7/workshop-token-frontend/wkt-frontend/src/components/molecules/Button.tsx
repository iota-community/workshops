import { Button as RadixButton } from "@radix-ui/themes";
import { forwardRef } from "react";
import { ButtonProps } from "../../types";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, onClick, disabled = false, style = {}, className = "" },
    ref,
  ) => {
    return (
      <RadixButton
        ref={ref}
        radius="none"
        className={className}
        style={{
          borderRadius: "8px",
          cursor: disabled ? "not-allowed" : "pointer",
          ...style,
        }}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </RadixButton>
    );
  },
);

Button.displayName = "Button";

export default Button;
