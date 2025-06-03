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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const chains = [base];

const { connectors } = getDefaultWallets({
  appName: "Charity Raffle",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains,
});

export const config = createConfig({
  autoConnect: true,
  connectors,
  chains,
  transports: {
    [base.id]: http("https://mainnet.base.org"), // ✅ FIXED: mapped to 8453
  },
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
