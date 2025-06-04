// src/hooks/useNonceMessage.ts
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

let globalNonceMap = new Map<string, number>();

export function useNonceMessage(quantity: number) {
  const { address } = useAccount();
  const [nonce, setNonce] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!address || quantity < 1) return;

    const stored = globalNonceMap.get(address) || 0;
    const newNonce = stored + 1;

    const msg = `I want to mint ${quantity} Charity Raffle NFTs @ ${newNonce}`;
    setNonce(newNonce);
    setMessage(msg);
  }, [address, quantity]);

  const markNonceUsed = () => {
    if (address && nonce !== null) {
      globalNonceMap.set(address, nonce);
    }
  };

  return { message, nonce, markNonceUsed };
}
