/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RELAYER_ADDRESS: `0x${string}`; // renamed from VITE_CONTRACT_ADDRESS
  readonly VITE_RELAYER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
