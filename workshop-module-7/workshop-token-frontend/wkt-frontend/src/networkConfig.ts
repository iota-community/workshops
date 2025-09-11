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
      packageId: "0x0dbf03185407dceef5e2aa22e8cf411794b093f5eea79ccb100e14b7f17b9ab7",
      faucetObject: "0xa26ad50787d402726438129bf610bf83c6c4cf0e28d0f8f8f5d5bc1bdf42eb41"
    }
  }
});

export { useNetworkVariable, networkConfig };