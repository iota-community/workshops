import React from "react";
import ReactDOM from "react-dom/client";
import "@iota/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";
import "./index.css";

import { IotaClientProvider, WalletProvider } from "@iota/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import App from "./App";
import { networkConfig } from "./networkConfig";
import { BrowserRouter } from "react-router-dom";
import { darkTheme } from "./theme/darkTheme";
import { CelebrationProvider } from "./contexts/CelebrationContext";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme appearance="dark">
      <QueryClientProvider client={queryClient}>
        <IotaClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider autoConnect theme={darkTheme}>
            <BrowserRouter>
              <CelebrationProvider>
                <App />
              </CelebrationProvider>
            </BrowserRouter>
          </WalletProvider>
        </IotaClientProvider>
      </QueryClientProvider>
    </Theme>
  </React.StrictMode>,
);