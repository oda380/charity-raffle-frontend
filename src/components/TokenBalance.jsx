// src/components/TokenBalance.jsx
import { useAccount, useContractRead } from "wagmi";
import USDC_ABI from "../abis/USDC_ABI.json"; // Assuming ABI is named USDC_ABI.json or similar
import InfoCard from "./InfoCard"; // Assuming this path is correct

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base Mainnet USDC.e

export default function TokenBalance() {
  const { address, isConnected } = useAccount();

  const {
    data: balanceData,
    isLoading,
    isError,
    error, // Capture the error object
  } = useContractRead({
    address: USDC_ADDRESS,
    abi: USDC_ABI, // Make sure this ABI is correct for balanceOf
    functionName: "balanceOf",
    args: [address],
    enabled: !!address && isConnected, // Only fetch if address exists and wallet is connected
    watch: true, // Keep the balance updated
    staleTime: 15_000, // Optional: refetch slightly less aggressively than default
    cacheTime: 60_000, // Optional: cache for 1 minute
  });

  if (!isConnected) {
    // Don't render anything if the wallet is not connected,
    // as this component is likely part of a section that only shows when connected.
    return null;
  }

  let content;

  if (isLoading) {
    content = (
      <p className="text-sm text-text-dark/70 dark:text-dark-text/70 animate-pulse">
        Fetching balance...
      </p>
    );
  } else if (isError) {
    console.error("Error fetching USDC balance:", error);
    content = (
      <p className="text-sm text-red-600 dark:text-red-400">
        Could not load balance.
      </p>
    );
  } else if (typeof balanceData === "bigint") {
    const formattedBalance = (Number(balanceData) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    content = (
      <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
        {formattedBalance} USDC
      </p>
    );
  } else {
    // Fallback or if balanceData is not in the expected format but no error/loading
    content = (
      <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
        0.00 USDC
      </p>
    );
  }

  return (
    <InfoCard title="💰 Your Balance"> {/* Changed title slightly for brevity */}
      <div className="flex items-center justify-center pt-1"> {/* Added pt-1 for slight spacing from title */}
        {content}
      </div>
    </InfoCard>
  );
}
