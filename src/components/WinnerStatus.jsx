import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export default function WinnerStatus() {
  const { address, isConnected } = useAccount();
  const [isWinner, setIsWinner] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) return;

    const checkWinner = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://charity-raffle-relayer.onrender.com/isWinner/${address}`);
        const data = await res.json();
        setIsWinner(data.isWinner);
      } catch (err) {
        console.error("Winner check failed:", err);
        setIsWinner(null);
      } finally {
        setLoading(false);
      }
    };

    checkWinner();
  }, [address, isConnected]);

  if (!isConnected) return null;

  return (
    <div className="bg-white p-4 rounded shadow text-sm text-center">
      {loading && <p>Checking winner status...</p>}
      {isWinner === true && (
        <p className="text-green-600 font-bold text-lg">🎉 You are a winner!</p>
      )}
      {isWinner === false && (
        <p className="text-gray-600">Not a winner (yet) — good luck!</p>
      )}
    </div>
  );
}
