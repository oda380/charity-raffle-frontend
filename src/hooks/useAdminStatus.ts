import { useAccount, useContractRead } from "wagmi";
import { base } from "wagmi/chains";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

const CONTRACT_ADDRESS = "0xCBDF97E844afDbF26f5e21e139e045dE72077023";

export function useAdminStatus() {
  const { address, isConnected } = useAccount();

  const {
    data: owner,
    isLoading: isLoadingOwner,
    isError: isOwnerError,
    error: ownerError,
  } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CharityRaffleABI,
    functionName: "owner",
    query: {
      enabled: isConnected, // ✅ CORRECT for Wagmi v2
    },
  });

  const isAdmin =
    isConnected &&
    !!address &&
    !!owner &&
    address.toLowerCase() === String(owner).toLowerCase();

  return {
    isAdmin,
    isLoadingAdminStatus: isLoadingOwner,
    isAdminStatusError: isOwnerError,
    adminStatusErrorMessage: ownerError?.shortMessage || ownerError?.message || null,
    isConnected,
  };
}
