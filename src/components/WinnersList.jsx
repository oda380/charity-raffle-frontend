// src/components/WinnersList.jsx
import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import CharityRaffleABI from "../abis/CharityRaffleABI.json"; // Assuming this path is correct

const RAFFLE_CONTRACT_ADDRESS = "0x68a8b9579f846B123686Fb920B075DFC686c2aEB"; // Make sure this is correct
// Ensure your relayer URL is correct
const RELAYER_WINNERS_URL = "https://charity-raffle-relayer.onrender.com/winners";

export default function WinnersList() {
  const [winningTicketIds, setWinningTicketIds] = useState([]);
  const [isLoadingWinners, setIsLoadingWinners] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch the list of winning ticket IDs from the relayer
  useEffect(() => {
    const fetchWinningTicketIds = async () => {
      setIsLoadingWinners(true);
      setFetchError(null);
      try {
        const res = await fetch(RELAYER_WINNERS_URL);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({})); // Try to get error message
          throw new Error(errorData.error || `Failed to fetch winners: ${res.statusText}`);
        }
        const data = await res.json();
        setWinningTicketIds(Array.isArray(data.winners) ? data.winners.map(id => BigInt(id)) : []);
      } catch (err) {
        console.error("Failed to load winning ticket IDs:", err);
        setFetchError(err.message || "Could not load winners list.");
      } finally {
        setIsLoadingWinners(false);
      }
    };

    fetchWinningTicketIds();
  }, []);

  // Prepare queries to fetch ownerOf for each winning ticket ID
  const ownerQueries = winningTicketIds.map((id) => ({
    address: RAFFLE_CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "ownerOf",
    args: [id], // id should already be BigInt from the fetch processing
  }));

  const {
    data: ownerResults, // Array of results, each with { result: '0xAddress', status: 'success' } or error
    isLoading: isLoadingOwners,
    isError: isOwnerReadError, // True if any of the multicalls fail
    error: ownerReadErrorData, // Contains error details if isOwnerReadError is true
  } = useReadContracts({
    contracts: ownerQueries,
    // Only enable if there are winning ticket IDs to query
    query: { enabled: winningTicketIds.length > 0 && !isLoadingWinners && !fetchError },
  });


  // Content to display based on loading and error states
  let content;

  if (isLoadingWinners) {
    content = (
      <p className="text-sm text-text-dark/70 dark:text-dark-text/70 animate-pulse text-center">
        Loading winning tickets...
      </p>
    );
  } else if (fetchError) {
    content = (
      <div className="text-sm text-center text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800/40 border border-red-300 dark:border-red-600 p-3 rounded-lg">
        ❌ {fetchError}
      </div>
    );
  } else if (winningTicketIds.length === 0) {
    content = (
      <p className="text-sm text-text-dark/80 dark:text-dark-text/80 text-center">
        No winners have been selected yet.
      </p>
    );
  } else {
    content = (
      <div className="space-y-3">
        {isOwnerReadError && (
          <p className="text-xs text-red-600 dark:text-red-400 text-center mb-2">
            Note: Could not fetch all owner details. {ownerReadErrorData?.shortMessage || ownerReadErrorData?.message}
          </p>
        )}
        <ul className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-3">
          {winningTicketIds.map((ticketId, index) => {
            const ownerResult = ownerResults?.[index];
            const ownerAddress = ownerResult?.status === 'success' ? String(ownerResult.result) : null;
            const ownerFetchFailed = ownerResult?.status === 'failure';

            return (
              <li
                key={String(ticketId)}
                className="bg-indigo-100/70 dark:bg-indigo-900/50 p-3 rounded-lg shadow-sm text-left transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold font-mono text-indigo-700 dark:text-indigo-300">
                    🎟️ Ticket #{String(ticketId)}
                  </span>
                  {/* Optional: Add a small visual cue for successful owner fetch */}
                </div>
                {isLoadingOwners && !ownerAddress && !ownerFetchFailed && (
                  <p className="text-xs text-text-dark/60 dark:text-dark-text/60 mt-1 animate-pulse">
                    Fetching owner...
                  </p>
                )}
                {ownerAddress && (
                  <p className="text-xs text-text-dark/80 dark:text-dark-text/70 mt-1 truncate">
                    🧑 Owner:{" "}
                    <a
                      href={`https://basescan.org/address/${ownerAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-indigo-600 dark:text-indigo-400"
                    >
                      {ownerAddress.slice(0, 6)}...{ownerAddress.slice(-4)}
                    </a>
                  </p>
                )}
                {ownerFetchFailed && !isLoadingOwners && (
                   <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    Could not fetch owner.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // This component assumes it's placed within a parent <Card> that provides the main title
  // e.g., <Card title="🏆 Raffle Winners">
  return (
    <div className="w-full space-y-3">
       {/* Optional: Sub-heading specific to this list if the parent Card title is more general */}
      <h4 className="text-md font-headings text-purple-600 dark:text-purple-400 text-center">
        Winning Tickets & Owners
      </h4>
      {content}
    </div>
  );
}