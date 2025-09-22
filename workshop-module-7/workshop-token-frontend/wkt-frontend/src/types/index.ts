export interface WorkshopBadge {
  id: string;
  recipient: string;
  minted_at: string;
  workshop_id: string;
  url: string;
}

export interface TokenBalance {
  coinObjectId: string;
  balance: string;
}

export interface CouponStatus {
  isValid: boolean;
  isUsed: boolean;
}

export interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: WorkshopBadge | null;
}

export interface ActionTabsProps {
  selectedTab: "tab1" | "tab2";
  setSelectedTab: (tab: "tab1" | "tab2") => void;
  hasClaimed: boolean;
  hasRedeemed: boolean;
  totalBalance: bigint;
  badges: any[];
}

export interface DashboardSummaryProps {
  account: any;
  totalBalance: bigint;
  badges: any[];
  hasClaimed: boolean;
  hasRedeemed: boolean;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}
