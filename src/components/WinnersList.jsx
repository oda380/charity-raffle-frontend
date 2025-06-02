import { useEffect, useState } from "react";

export default function WinnersList() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await fetch("https://charity-raffle-relayer.onrender.com/winners");
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
    <div className="bg-white p-4 rounded shadow text-sm text-center space-y-2">
      <h3 className="text-lg font-semibold">🎉 Winning Token IDs</h3>

      {loading && <p>Loading winners...</p>}
      {error && <p className="text-red-600">Failed to fetch winners.</p>}

      {winners.length === 0 && !loading && (
        <p className="text-gray-600">No winners have been selected yet.</p>
      )}

      {winners.length > 0 && (
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-800">
          {winners.map((id) => (
            <div
              key={id}
              className="bg-gray-100 px-2 py-1 rounded font-mono"
            >
              #{id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
