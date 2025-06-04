// src/hooks/useTotalMinted.ts
import { useContractRead } from "wagmi";
import { useContractConfig } from "./useContractConfig";

export function useTotalMinted() {
  const contract = useContractConfig();

  return useContractRead({
    ...contract,
    functionName: "totalMinted",
    query: {
      refetchInterval: 5000,
    },
  });
}
