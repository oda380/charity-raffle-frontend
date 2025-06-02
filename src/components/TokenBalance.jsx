import { useAccount, useContractRead } from "wagmi";
import ERC20ABI from "../abis/ERC20ABI.json";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC

export default function TokenBalance() {
  const { address, isConnected } = useAccount();

  const { data: balance, isLoading } = useContractRead({
    address: USDC_ADDRESS,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address,
    watch: true,
  });

  if (!isConnected) return null;

  return (
    <div className="text-sm text-center text-gray-800">
      {isLoading && "Fetching USDC balance..."}
      {balance && (
        <p>
          💰 Balance: {(Number(balance) / 1_000_000).toFixed(2)} USDC
        </p>
      )}
    </div>
  );
}
