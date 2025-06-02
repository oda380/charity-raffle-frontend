import {
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  WagmiConfig,
  createConfig,
  http,
} from "wagmi";
import { base } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const chains = [base];
const publicClient = http("https://mainnet.base.org");

const { connectors } = getDefaultWallets({
  appName: "Charity Raffle",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains,
});

export const config = createConfig({
  connectors,
  publicClient,
  chains,
  autoConnect: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <RainbowKitProvider chains={chains}>
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
