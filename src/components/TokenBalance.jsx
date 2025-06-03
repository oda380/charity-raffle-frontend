import { useAccount, useContractRead } from "wagmi";
import USDC from "../abis/USDC.json";
import InfoCard from "./InfoCard";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export default function TokenBalance() {
  const { address, isConnected } = useAccount();

  const { data: balance, isLoading } = useContractRead({
    address: USDC_ADDRESS,
    abi: USDC,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address,
    watch: true,
  });

  if (!isConnected) return null;

  return (
    <InfoCard title="💰 Your USDC Balance">
      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Fetching balance...</p>
      ) : (
        <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
          {(Number(balance || 0) / 1_000_000).toFixed(2)} USDC
        </p>
      )}
    </InfoCard>
  );
}
