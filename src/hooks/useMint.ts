// src/hooks/useMint.ts
import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import axios from "axios";
import { useNonceMessage } from "./useNonceMessage";

export function useMint(quantity: number) {
  const { address } = useAccount();
  const { message, markNonceUsed } = useNonceMessage(quantity);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { signMessageAsync } = useSignMessage();

  const mint = async () => {
    if (!address || !message || quantity < 1 || quantity > 10) {
      setError("Invalid input");
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const signature = await signMessageAsync({ message });

      const response = await axios.post(`${import.meta.env.VITE_RELAYER_URL}/mint`, {
        userAddress: address,
        quantity,
        message,
        signature,
      });

      markNonceUsed();
      setTxHash(response.data.txHash);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Minting failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return { mint, loading, error, txHash };
}
