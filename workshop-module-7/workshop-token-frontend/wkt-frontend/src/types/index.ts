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