// src/hooks/useContractConfig.ts
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

export const CONTRACT_ADDRESS = "0x1048d4F6CfEcD09aDB8A57BaE6059260a66780Ac"; // Replace this

export function useContractConfig() {
  return {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CharityRaffleABI,
  };
}
