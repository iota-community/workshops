import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable } = createNetworkConfig({
  devnet: {
    url: getFullnodeUrl("devnet"),
    variables: {
      packageId: "",
      faucetObject: "",
    },
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
    variables: {
      packageId:
        "<YOUR_PACKAGE_ID>",
      faucetObject:
        "<YOUR_FAUCET_Object_ID>",
    },
  },
});

export { useNetworkVariable, networkConfig };
