export interface NFTMetadata {
  id: number;
  name: string;
  image_uri: string;
  description: string;
}

export interface VoucherState {
  hasVoucher: boolean;
  isUsed: boolean;
}

export interface VoucherShopOperation {
  name: 'ClaimVoucher' | 'RedeemVoucher';
  description: string;
  path?: string;
}

// Tooltip types
export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

// Confetti celebration types
export interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  badge?: {
    id: number;
    name: string;
    image_uri: string;
    description: string;
  };
}

export interface CelebrationContextType {
  triggerCelebration: (config?: {
    title?: string;
    message?: string;
    badge?: CelebrationModalProps['badge'];
  }) => void;
}

export interface VoucherShopInfo {
  admin: string;
  nftTemplatesCount: number;
  nftIds: number[];
  userVoucherStatus?: { hasVoucher: boolean; isVoucherUsed: boolean };
  redemptionHistory?: number[];
}