// src/components/WinnerStatus.jsx
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import InfoCard from "./InfoCard"; // Assuming this path is correct

// Ensure your relayer URL is correct
const RELAYER_BASE_URL = "https://charity-raffle-relayer.onrender.com";

export default function WinnerStatus() {
  const { address, isConnected } = useAccount();
  const [isWinner, setIsWinner] = useState(null); // null: not checked, true: is winner, false: not winner
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setIsWinner(null); // Reset status if disconnected or no address
      setFetchError(null);
      return;
    }

    const checkWinnerStatus = async () => {
      setIsLoading(true);
      setFetchError(null);
      setIsWinner(null); // Reset while fetching

      try {
        const res = await fetch(`${RELAYER_BASE_URL}/isWinner/${address}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({})); // Try to get error message
          throw new Error(errorData.error || `Failed to check status: ${res.statusText}`);
        }
        const data = await res.json();
        setIsWinner(data.isWinner === true); // Ensure it's explicitly true
      } catch (err) {
        console.error("Winner status check failed:", err);
        setFetchError(err.message || "Could not check winner status.");
        setIsWinner(null); // Set to null on error to differentiate from explicitly "not a winner"
      } finally {
        setIsLoading(false);
      }
    };

    checkWinnerStatus();
  }, [address, isConnected]);

  if (!isConnected) {
    // Don't render if not connected, as this is user-specific info
    return null;
  }

  let content;

  if (isLoading) {
    content = (
      <p className="text-sm text-text-dark/70 dark:text-dark-text/70 animate-pulse">
        Checking your status...
      </p>
    );
  } else if (fetchError) {
    content = (
      <div className="text-sm text-center text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800/40 border border-red-300 dark:border-red-600 p-2 rounded-md">
        ⚠️ {fetchError}
      </div>
    );
  } else if (isWinner === true) {
    content = (
      <p className="text-xl font-headings font-bold text-green-600 dark:text-green-400 animate-pulse">
        🎉 Congratulations, You're a Winner!
      </p>
    );
  } else if (isWinner === false) {
    content = (
      <p className="text-md font-medium text-indigo-600 dark:text-indigo-400">
        Not a winner this time. Better luck next raffle!
      </p>
    );
  } else {
    // isWinner is null (e.g., relayer hasn't determined winners yet or initial state)
    content = (
      <p className="text-sm text-text-dark/80 dark:text-dark-text/80">
        Winner selection is pending or status could not be determined.
      </p>
    );
  }

  return (
    <InfoCard title="🌟 Your Raffle Status">
      <div className="flex items-center justify-center pt-1 min-h-[40px]"> {/* Added min-h for consistent height */}
        {content}
      </div>
    </InfoCard>
  );
}
