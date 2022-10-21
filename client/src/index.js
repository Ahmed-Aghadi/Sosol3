import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { MoralisProvider } from "react-moralis";
import { NotificationsProvider } from "@mantine/notifications";
const { chains, provider } = configureChains(
    [chain.polygonMumbai],
    [publicProvider()]
);

const { connectors } = getDefaultWallets({
    appName: "Sosol3",
    chains,
});

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <WagmiConfig client={wagmiClient}>
        <NotificationsProvider position="top-right" zIndex={2077}>
            <MoralisProvider
                serverUrl="https://t5mndyrwxyxp.usemoralis.com:2053/server"
                appId="F40FMMhw2xZzT2VGrBKZ9watFX08dDV3BfHo8zA3"
            >
                <HashRouter>
                    <App />
                </HashRouter>
            </MoralisProvider>
        </NotificationsProvider>
    </WagmiConfig>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
