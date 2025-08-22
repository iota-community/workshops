import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable } = createNetworkConfig({
  devnet: {
    url: getFullnodeUrl("devnet"),
    variables: {
      packageId: "0x2c722ceb348d67dbce64bbace300e3299ae7021680a0c985e651175a3e75acfb",
      voucherShopObject: "0x668061bf3f21e3dcc24fe9b44496059368c2d5f6cd71f2b59adc084e9eb42250"
    }
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
    variables: {
      packageId: "0xfd1e0fe711a7858b865b78eea6f4d5a18edc280d77e34ef2491cc3dcaaf72eba",
      voucherShopObject: "0x106240082ea95bfa84c137063c57da2a4ead1dbb567348ddcc9a1bf5b3e0e5e5"
    }
  }
});

export { useNetworkVariable, networkConfig };