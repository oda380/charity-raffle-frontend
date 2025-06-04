// src/hooks/useApproveUSDC.ts
import { useWriteContract, usePublicClient } from "wagmi";
import { useState } from "react";
import USDC_ABI from "../abis/USDC_ABI.json";
import { base } from "wagmi/chains";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const CONTRACT_ADDRESS = "0x68a8b9579f846B123686Fb920B075DFC686c2aEB"; // Update to your actual deployed contract

export function useApproveUSDC(quantity: number, mintPrice: number) {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: base.id });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const approve = async () => {
    if (!publicClient) {
      console.error("Public client unavailable");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      const amount = BigInt(100_000_000); // 100 USDC with 6 decimals

      const hash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, amount],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      setStatus("success");
    } catch (err) {
      console.error("Approve failed", err);
      setStatus("error");
    }
  };

  return { approve, status };
}
