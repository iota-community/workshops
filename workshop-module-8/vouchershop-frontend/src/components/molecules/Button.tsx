import { Button as RadixButton } from "@radix-ui/themes";

export default function Button({
  children,
  onClick,
  disabled = false,
  style = {}
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <RadixButton
      radius="none"
      style={{ background: "#0101ff",  borderRadius: "8px",cursor: 'pointer', ...style }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </RadixButton>
  );
}
