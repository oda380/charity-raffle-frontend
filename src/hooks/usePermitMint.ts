// src/hooks/usePermitMint.ts
import { useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import axios from "../lib/axiosInstance";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;
const USDC_NAME = "USD Coin";
const USDC_VERSION = "2";

export function usePermitMint(quantity: number, mintPrice: number) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintWithPermit = async (): Promise<string | null> => {
    if (!walletClient || !publicClient || !address || quantity < 1 || quantity > 10) {
      setError("Invalid mint input");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const value = BigInt(quantity) * BigInt(mintPrice);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800); // 30 min from now

      const nonce: bigint = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: [
          {
            name: "nonces",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "owner", type: "address" }],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "nonces",
        args: [address],
      });

      const domain = {
        name: USDC_NAME,
        version: USDC_VERSION,
        chainId: await walletClient.getChainId(),
        verifyingContract: USDC_ADDRESS,
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const spender = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

      const signature = await walletClient.signTypedData({
        account: address, // 🔐 crucial
        domain,
        types,
        primaryType: "Permit",
        message: {
          owner: address,
          spender,
          value,
          nonce,
          deadline,
        },
      });

      const { r, s, v } = splitSignature(signature);

      const { data } = await axios.post("/mint-with-permit", {
        tokenOwner: address,
        nftRecipient: address,
        quantity,
        value: value.toString(),
        permitDeadline: deadline.toString(),
        permitV: v,
        permitR: r,
        permitS: s,
      });

      return data.txHash;
    } catch (err: any) {
      console.error("Permit mint failed:", err);
      const msg = err?.response?.data?.error || err.message || "Permit mint failed";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mintWithPermit, loading, error };
}

function splitSignature(signature: string) {
  return {
    r: `0x${signature.slice(2, 66)}`,
    s: `0x${signature.slice(66, 130)}`,
    v: parseInt(signature.slice(130, 132), 16),
  };
}
