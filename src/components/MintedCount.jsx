// src/components/MintedCount.jsx
import { useContractRead } from "wagmi";
import CharityRaffleABI from "../abis/CharityRaffleABI.json"; // Assuming this path is correct
import InfoCard from "./InfoCard"; // Assuming this path is correct

const CONTRACT_ADDRESS = "0xed81C5F9e322D1005a28393c5D93499ee2ff4e55"; // Make sure this is correct
const MAX_SUPPLY = 300;

export default function MintedCount() {
  const { data: totalMintedData, isLoading, isError } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "totalMinted",
    watch: true, // Keeps the data fresh
  });

  const mintedCount = typeof totalMintedData === "bigint" ? Number(totalMintedData) : 0;
  const percentageMinted = MAX_SUPPLY > 0 ? (mintedCount / MAX_SUPPLY) * 100 : 0;

  let content;

  if (isLoading) {
    content = (
      <p className="text-sm text-text-dark/70 dark:text-dark-text/70 animate-pulse">
        Loading count...
      </p>
    );
  } else if (isError) {
    content = (
      <p className="text-sm text-red-600 dark:text-red-400">
        Could not load ticket count.
      </p>
    );
  } else {
    // Success or default state (if data is not bigint but no error/loading)
    content = (
      <div className="space-y-2 w-full">
        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          {mintedCount} / {MAX_SUPPLY}
        </p>
        <div className="w-full bg-pastel-lavender dark:bg-slate-700 rounded-full h-2.5 shadow-inner">
          <div
            className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentageMinted}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <InfoCard title="🎯 Tickets Minted">
      <div className="flex flex-col items-center justify-center w-full pt-1"> {/* Added pt-1 for slight spacing from title */}
        {content}
      </div>
    </InfoCard>
  );
}