import { useEffect, useState } from "react";
import { useVoucherShop } from "../hooks/useVoucherShop";
import Loading from "./molecules/Loading";

export default function VoucherStatus() {
  const { account, checkVoucherStatus } = useVoucherShop();
  const [voucherStatus, setVoucherStatus] = useState<{
    hasVoucher: boolean;
    isVoucherUsed: boolean;
    loading: boolean;
  }>({
    hasVoucher: false,
    isVoucherUsed: false,
    loading: false
  });

  useEffect(() => {
    if (account?.address) {
      setVoucherStatus(prev => ({ ...prev, loading: true }));
      checkVoucherStatus(account.address).then(status => {
        setVoucherStatus({
          hasVoucher: status.hasVoucher,
          isVoucherUsed: status.isVoucherUsed,
          loading: false
        });
      });
    } else {
      setVoucherStatus({ hasVoucher: false, isVoucherUsed: false, loading: false });
    }
  }, [account?.address]);

  if (!account) return <p>Connect wallet to check voucher status</p>;
  if (voucherStatus.loading) return <Loading />;

  return (
    <div>
      {voucherStatus.hasVoucher ? (
        voucherStatus.isVoucherUsed ? (
          <p>✅ Voucher claimed and used</p>
        ) : (
          <p>✅ Voucher claimed (ready to redeem)</p>
        )
      ) : (
        <p>❌ No voucher claimed yet</p>
      )}
    </div>
  );
}
