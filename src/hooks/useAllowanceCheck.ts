import { useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import USDC_ABI from "../abis/USDC_ABI.json";
import { base } from "wagmi/chains";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const CONTRACT_ADDRESS = "0xCBDF97E844afDbF26f5e21e139e045dE72077023";

export function useAllowanceCheck(
  owner: string | undefined,
  quantity: number,
  mintPrice: number
) {
  const [hasEnoughAllowance, setHasEnoughAllowance] = useState(false);
  const shouldFetch = !!owner;

  const {
    data,
    refetch: refetchAllowance,
    isLoading,
    isFetching,
    isError,
    error,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: shouldFetch ? [owner!, CONTRACT_ADDRESS] : undefined,
    chainId: base.id,
    query: { enabled: shouldFetch },
  });

  useEffect(() => {
    if (typeof data === "bigint") {
      const required = BigInt(quantity) * BigInt(mintPrice);
      setHasEnoughAllowance(data >= required);
    }
  }, [data, quantity, mintPrice]);

  return {
    hasEnoughAllowance,
    refetchAllowance, // renamed for clarity
    isLoading,
    isFetching,
    isError,
    error,
  };
}
