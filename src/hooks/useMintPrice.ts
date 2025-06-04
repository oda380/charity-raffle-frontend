// src/hooks/useMintPrice.ts
import { useContractRead } from "wagmi";
import { useContractConfig } from "./useContractConfig";

export function useMintPrice() {
  const contract = useContractConfig();

  return useContractRead({
    ...contract,
    functionName: "mintPrice",
    query: {
      refetchInterval: 5000, // every 5 seconds
    },
  });
}
