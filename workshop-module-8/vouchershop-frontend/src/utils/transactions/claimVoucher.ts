import { useVoucherShop } from "../../hooks/useVoucherShop";

export const claimVoucher = () => {
  const { claimVoucher: claim } = useVoucherShop();
  return claim();
};