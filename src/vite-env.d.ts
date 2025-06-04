// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: `0x${string}`;
  readonly VITE_RELAYER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
