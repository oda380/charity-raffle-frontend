import { useWriteContract } from "wagmi";
import { useState } from "react";
import USDC_ABI from "../abis/USDC_ABI.json";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const CONTRACT_ADDRESS = "0x880cbc560a7a5e166D2fa882a1096E66f8F38BfE";

export function useApproveUSDC(quantity: number, mintPrice: number) {
  const { writeContractAsync } = useWriteContract();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const approve = async () => {
    try {
      setStatus("loading");
      const amount = BigInt(quantity) * BigInt(mintPrice);
      await writeContractAsync({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, amount],
      });
      setStatus("success");
    } catch (err) {
      console.error("Approve failed", err);
      setStatus("error");
    }
  };

  return { approve, status };
}
