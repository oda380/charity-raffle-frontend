// src/hooks/useAdminStatus.ts
import { useAccount, useContractRead } from "wagmi";
import CharityRaffleABI from "../abis/CharityRaffleABI.json"; // Adjust path if needed

// 1. Use a hardcoded contract address
const CONTRACT_ADDRESS = "0xed81C5F9e322D1005a28393c5D93499ee2ff4e55"; // Make sure this is correct

export function useAdminStatus() {
  const { address, isConnected } = useAccount();

  const {
    data: owner,
    isLoading: isLoadingOwner,
    isError: isOwnerError,
    error: ownerError,
  } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`, // Type assertion is still good
    abi: CharityRaffleABI,
    functionName: "owner",
    // Corrected: `enabled` and other query options go inside the `query` object
    query: {
      enabled: isConnected, // Only fetch if connected (CONTRACT_ADDRESS is always defined now)
    },
  });

  const isAdmin =
    isConnected &&
    !!address &&
    !!owner && // owner will be undefined if isLoadingOwner or isOwnerError
    address.toLowerCase() === String(owner).toLowerCase();

  // 2. isContractConfigured is effectively always true now, so it can be removed
  //    or kept as true if other parts of your app might use it for different configs.
  //    For simplicity here, we'll assume it's not strictly needed for this hook's output anymore
  //    if this hook is *only* for this specific hardcoded contract.

  return {
    isAdmin,
    isLoadingAdminStatus: isLoadingOwner,
    isAdminStatusError: isOwnerError,
    adminStatusErrorMessage: ownerError?.shortMessage || ownerError?.message || null,
    // isContractConfigured: true, // You can return true if needed elsewhere
    isConnected, // Expose isConnected for convenience in App.jsx
  };
}
