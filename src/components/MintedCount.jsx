import { useContractRead } from "wagmi";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";
import InfoCard from "./InfoCard";

const CONTRACT_ADDRESS = "0xed81C5F9e322D1005a28393c5D93499ee2ff4e55";

export default function MintedCount() {
  const { data, isLoading, isError } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "totalMinted",
    watch: true,
  });

  return (
    <InfoCard title="🎯 Tickets Minted">
      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        ) : typeof data === "bigint" ? (
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
            {Number(data)} / 300
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">0 / 300 tickets minted</p>
        )}
    </InfoCard>
  );
}
