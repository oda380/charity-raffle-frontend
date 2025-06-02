import { useState } from "react";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { parseUnits } from "viem";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

const CONTRACT_ADDRESS = "0xFD280eecf57c2a533b6508acC03E4AEDC1E86164";

export default function AdminPanel() {
  const { address } = useAccount();
  const [count, setCount] = useState(1);

  const { data: owner } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "owner",
  });

  const { write, isLoading, isSuccess, error } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "selectWinners",
  });

  const isAdmin =
  address &&
  owner &&
  address.toLowerCase() === owner.toLowerCase();

  const handleClick = () => {
    write({ args: [count] });
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-white p-4 rounded shadow space-y-4 text-sm text-center">
      <h3 className="font-semibold text-lg text-red-600">Admin Panel</h3>

      <div className="flex items-center justify-center gap-2">
        <label>Number of Winners:</label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          min={1}
          max={300}
          className="border rounded px-2 py-1 w-20 text-center"
        />
      </div>

      <button
        onClick={handleClick}
        disabled={isLoading}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full"
      >
        {isLoading ? "Selecting..." : "Select Winners"}
      </button>

      {isSuccess && <p className="text-green-600">✅ Winners selected!</p>}
      {error && <p className="text-red-600">❌ {error.message}</p>}
    </div>
  );
}
