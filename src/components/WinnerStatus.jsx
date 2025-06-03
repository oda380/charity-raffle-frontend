// src/components/WinnerStatus.jsx
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import InfoCard from "./InfoCard"; // Assuming this path is correct

// Ensure your relayer URL is correct
const RELAYER_BASE_URL = "https://charity-raffle-relayer.onrender.com";

export default function WinnerStatus() {
  const { address, isConnected } = useAccount();
  // isWinner state:
  // null: status unknown, pending, or raffle not yet concluded
  // true: user is a winner (and raffle concluded)
  // false: user is not a winner (and raffle concluded)
  const [isWinner, setIsWinner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setIsWinner(null); // Reset status if disconnected or no address
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    const checkWinnerStatus = async () => {
      setIsLoading(true);
      setFetchError(null);
      setIsWinner(null); // Default to pending/unknown while fetching

      try {
        // IMPORTANT ASSUMPTION:
        // API endpoint /isWinner/:address now returns:
        // { isWinner: boolean, winnersSelected: boolean }
        const res = await fetch(`${RELAYER_BASE_URL}/isWinner/${address}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to check status: ${res.statusText}`);
        }
        const data = await res.json();

        if (data.winnersSelected === undefined) {
          console.warn("API response is missing 'winnersSelected' field. Displaying potentially inaccurate status.");
          // Fallback or specific error handling if the API isn't updated as expected
          // For now, we'll proceed assuming it might be an older API version
          // and rely only on data.isWinner if winnersSelected is missing.
          if (data.isWinner === true) {
            setIsWinner(true);
          } else if (data.isWinner === false) {
            setIsWinner(false);
          } else {
            setIsWinner(null); // Treat as pending if isWinner is also ambiguous
          }
        } else if (data.winnersSelected === false) {
          // If winners have NOT been selected by the contract, the raffle is pending.
          setIsWinner(null); // This will trigger the "Winner selection is pending..." message
        } else {
          // Winners HAVE been selected (data.winnersSelected is true).
          // Now check if the current user is one of them.
          if (data.isWinner === true) {
            setIsWinner(true); // User is a winner
          } else {
            setIsWinner(false); // User is not a winner (and raffle has concluded)
          }
        }
      } catch (err) {
        console.error("Winner status check failed:", err);
        setFetchError(err.message || "Could not check winner status.");
        setIsWinner(null); // On error, revert to a pending-like state for the message
      } finally {
        setIsLoading(false);
      }
    };

    checkWinnerStatus();
  }, [address, isConnected]);

  if (!isConnected) {
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
    // isWinner is null. This now correctly means:
    // 1. Initial state.
    // 2. User not connected / no address.
    // 3. Loading state (though 'Checking status...' will show).
    // 4. Fetch error occurred.
    // 5. Crucially: API indicated that winnersSelected is false.
    content = (
      <p className="text-sm text-text-dark/80 dark:text-dark-text/80">
        Winner selection is pending. Please check back later.
      </p>
    );
  }

  return (
    <InfoCard title="🌟 Your Raffle Status">
      <div className="flex items-center justify-center pt-1 min-h-[40px]">
        {content}
      </div>
    </InfoCard>
  );
}