// src/utils/transactions/redeemVoucher.ts
import { useVoucherShop } from "../../hooks/useVoucherShop";

export const redeemVoucher = (nftId: number) => {
  const { redeemVoucher: redeem } = useVoucherShop();
  return redeem(nftId);
};