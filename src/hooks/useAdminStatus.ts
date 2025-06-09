import { useAccount, useContractRead } from "wagmi";
import { base } from "wagmi/chains";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

const CONTRACT_ADDRESS = "0x1048d4F6CfEcD09aDB8A57BaE6059260a66780Ac";

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
