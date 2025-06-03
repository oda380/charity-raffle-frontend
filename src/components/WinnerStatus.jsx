import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import InfoCard from "./InfoCard";

export default function WinnerStatus() {
  const { address, isConnected } = useAccount();
  const [isWinner, setIsWinner] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) return;

    const check = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://https://charity-raffle-relayer.onrender.com/isWinner/${address}`);
        const data = await res.json();
        setIsWinner(data.isWinner);
      } catch (err) {
        console.error("Winner check failed:", err);
        setIsWinner(null);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [address, isConnected]);

  if (!isConnected) return null;

  return (
    <InfoCard title="🎉 Winner Status">
      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Checking winner status...</p>
      ) : isWinner === true ? (
        <p className="text-xl font-fun font-bold text-green-600 dark:text-green-400 animate-pulse">
          🎉 You're a winner!
        </p>
      ) : isWinner === false ? (
        <p className="text-sm text-purple-600 dark:text-purple-300 font-medium">
          Not a winner (yet) — fingers crossed!
        </p>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
         Wait till the winners are selected!
        </p>
      )}
    </InfoCard>
  );
}
