import { useContractRead } from "wagmi";
import { formatUnits } from "viem";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

const CONTRACT_ADDRESS = "0xYourContractAddress";

export default function MintedCount() {
  const { data, isLoading, isError } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "totalMinted",
    watch: true,
  });

  return (
    <div className="text-sm text-gray-700 text-center">
      {isLoading && "Loading minted count..."}
      {isError && "Failed to fetch minted count."}
      {data && (
        <p>
          🎯 <strong>{data.toString()}</strong> / 300 tickets minted
        </p>
      )}
    </div>
  );
}
