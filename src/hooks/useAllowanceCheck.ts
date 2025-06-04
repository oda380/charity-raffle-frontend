import { useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import USDC_ABI from "../abis/USDC_ABI.json";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const CONTRACT_ADDRESS = "0x880cbc560a7a5e166D2fa882a1096E66f8F38BfE";

export function useAllowanceCheck(
  owner: string | undefined,
  quantity: number,
  mintPrice: number
) {
  const [hasEnoughAllowance, setHasEnoughAllowance] = useState(false);

  const { data, refetch } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: owner ? [owner, CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!owner },
  });

  useEffect(() => {
    if (data && typeof data === "bigint") {
      const required = BigInt(quantity) * BigInt(mintPrice);
      setHasEnoughAllowance(data >= required);
    }
  }, [data, quantity, mintPrice]);

  return { hasEnoughAllowance, refetch };
}
