// src/hooks/useContractConfig.ts
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

export const CONTRACT_ADDRESS = "0x1b46f44eadc6486ea8daf1a7b00ea4025383f6fc"; // Replace this

export function useContractConfig() {
  return {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CharityRaffleABI,
  };
}
