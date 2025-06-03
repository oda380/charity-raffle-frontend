import { useState } from "react";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

const CONTRACT_ADDRESS = "0xed81C5F9e322D1005a28393c5D93499ee2ff4e55";

export default function AdminPanel() {
  const { address } = useAccount();
  const [count, setCount] = useState(1);

  const {
    data: owner,
    isError,
    error,
  } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "owner",
    enabled: !!address, // ✅ only fetch when user is connected
  });

  const { write, isLoading, isSuccess, error: txError } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "selectWinners",
  });

  const isAdmin =
    address && owner && address.toLowerCase() === owner.toLowerCase();

  // Debug logs
  console.log("Connected address:", address);
  console.log("Owner from contract:", owner);
  console.log("Contract read error:", error);
  console.log("Match:", isAdmin);

  if (!isAdmin) return null;

  const handleClick = () => {
    write({ args: [count] });
  };

  return (
    <div className="bg-white/80 dark:bg-indigo-950/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-white/30 dark:border-indigo-800 text-center space-y-4">
      <h3 className="text-lg font-fun text-indigo-600 dark:text-indigo-300">
        🛠️ Admin Panel
      </h3>

      <div className="flex items-center justify-center gap-2">
        <label className="text-sm text-gray-700 dark:text-gray-300">
          Number of Winners:
        </label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          min={1}
          max={300}
          className="rounded-lg border border-indigo-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1 text-center w-24"
        />
      </div>

      <button
        onClick={handleClick}
        disabled={isLoading}
        className="w-full py-2 px-4 rounded-full font-semibold text-white transition bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
      >
        {isLoading ? "Selecting..." : "Select Winners"}
      </button>

      {isSuccess && (
        <p className="text-sm text-green-600 dark:text-green-400">
          ✅ Winners selected!
        </p>
      )}
      {txError && (
        <p className="text-sm text-red-500 dark:text-red-400">
          ❌ {txError.message || "Transaction failed"}
        </p>
      )}
    </div>
  );
}
