// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ["browser"],
  },
  // Add this section:
  optimizeDeps: {
    include: ['wagmi', 'viem'], // Explicitly include wagmi and its peer dependency viem
  },
});