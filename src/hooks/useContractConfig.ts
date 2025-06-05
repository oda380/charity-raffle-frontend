// src/hooks/useContractConfig.ts
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

export const CONTRACT_ADDRESS = "0xCBDF97E844afDbF26f5e21e139e045dE72077023"; // Replace this

export function useContractConfig() {
  return {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CharityRaffleABI,
  };
}
