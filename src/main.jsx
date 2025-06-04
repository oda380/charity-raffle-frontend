// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { http } from 'viem';

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const baseMainnetRpcUrl = import.meta.env.VITE_BASE_MAINNET_RPC_URL;

if (!walletConnectProjectId) {
  console.error("❌ VITE_WALLETCONNECT_PROJECT_ID not set");
}

const config = getDefaultConfig({
  appName: 'Charity Raffle',
  projectId: walletConnectProjectId || "missing_project_id", // fallback for testing
  chains: [base],
  transports: {
    [base.id]: http(baseMainnetRpcUrl || undefined),
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={{
            lightMode: lightTheme(),
            darkMode: darkTheme({
              accentColor: '#6366f1',
              borderRadius: 'large',
            }),
          }}
          modalSize="compact"
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>

);
