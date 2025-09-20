import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable } = createNetworkConfig({
  devnet: {
    url: getFullnodeUrl("devnet"),
    variables: {
      packageId: "",
      faucetObject: ""
    }
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
    variables: {
      packageId: "0x8effd4f141f4ef8692450e25fddc771a031c5645770b507de2e4eee7cb20a3bd",
      faucetObject: "0x8718a993b6291dee7908cff22848477b7de2401e70875c225d19cf3ce70be88b"
    }
  }
});

export { useNetworkVariable, networkConfig };