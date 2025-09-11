import React from "react";
import ReactDOM from "react-dom/client";
import "@iota/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";

import { IotaClientProvider, WalletProvider } from "@iota/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import App from "./App";
import { networkConfig } from "./networkConfig";
import { BrowserRouter } from "react-router-dom";
import { darkTheme } from "./theme/darkTheme";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme appearance="dark">
      <QueryClientProvider client={queryClient}>
        <IotaClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider autoConnect theme={darkTheme}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </WalletProvider>
        </IotaClientProvider>
      </QueryClientProvider>
    </Theme>
  </React.StrictMode>,
);