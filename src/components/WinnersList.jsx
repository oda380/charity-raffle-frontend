import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

export default function WinnersList() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const ownerQueries = winners.map((id) => ({
  address: "0xed81C5F9e322D1005a28393c5D93499ee2ff4e55",
  abi: CharityRaffleABI,
  functionName: "ownerOf",
  args: [BigInt(id)],
    }));

    const { data: ownerResults, isLoading: ownersLoading } = useReadContracts({
      contracts: ownerQueries,
      query: { enabled: winners.length > 0 },
    });

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await fetch("https://https://charity-raffle-relayer.onrender.com/winners");
        const data = await res.json();
        setWinners(data.winners || []);
      } catch (err) {
        console.error("Failed to load winners:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  return (
    <div className="bg-white/80 dark:bg-indigo-950/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-white/30 dark:border-indigo-800 text-center space-y-4">
      <h3 className="text-lg font-fun text-purple-600 dark:text-purple-300">
        🏆 Winning Ticket IDs
      </h3>

      {loading && <p className="text-sm text-gray-500">Loading winners...</p>}
      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading winners...</p>
      ) : winners.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">No winners selected yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
          {winners.map((id) => (
            <div
              key={id}
              className="bg-indigo-100 text-indigo-700 dark:bg-indigo-700/50 dark:text-indigo-100 px-3 py-1 rounded-xl shadow-sm font-semibold font-mono"
            >
              #{id}
            </div>
          ))}
        </div>
      )}


      {winners.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {winners.map((id, i) => {
            const owner = ownerResults?.[i]?.result;
            return (
              <div
                key={id}
                className="bg-indigo-100 text-indigo-700 dark:bg-indigo-700/50 dark:text-indigo-100 px-4 py-3 rounded-xl shadow-sm font-mono text-left"
              >
                <div className="font-semibold">🎟 Ticket #{id}</div>
                {owner ? (
                  <div className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                    🧑 {owner.slice(0, 6)}...{owner.slice(-4)}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">Loading owner...</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
