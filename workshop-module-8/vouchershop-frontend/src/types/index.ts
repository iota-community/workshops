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