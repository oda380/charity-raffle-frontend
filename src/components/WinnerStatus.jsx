// src/components/WinnerStatus.jsx
import { useEffect, useState } from "react";
import { useAccount, useContractRead, useReadContracts } from "wagmi";
import InfoCard from "./InfoCard";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

const RELAYER_BASE_URL = "https://charity-raffle-relayer.onrender.com";
const CONTRACT_ADDRESS = "0xed81C5F9e322D1005a28393c5D93499ee2ff4e55";

export default function WinnerStatus() {
  const { address, isConnected } = useAccount();
  const [isWinner, setIsWinner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setIsWinner(null);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    const checkWinnerStatus = async () => {
      setIsLoading(true);
      setFetchError(null);
      setIsWinner(null);

      try {
        const res = await fetch(`${RELAYER_BASE_URL}/isWinner/${address}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to check status: ${res.statusText}`);
        }
        const data = await res.json();

        if (data.winnersSelected === undefined) {
          if (data.isWinner === true) setIsWinner(true);
          else if (data.isWinner === false) setIsWinner(false);
          else setIsWinner(null);
        } else if (data.winnersSelected === false) {
          setIsWinner(null);
        } else {
          setIsWinner(data.isWinner === true);
        }
      } catch (err) {
        console.error("Winner status check failed:", err);
        setFetchError(err.message || "Could not check winner status.");
        setIsWinner(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkWinnerStatus();
  }, [address, isConnected]);

  const { data: balanceOf } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address,
  });

  const tokenIndexes = Array.from({ length: Number(balanceOf || 0) }, (_, i) => i);

  const ownedTokenReads = tokenIndexes.map((i) => ({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "tokenOfOwnerByIndex",
    args: [address, BigInt(i)],
  }));

  const { data: tokenResults } = useReadContracts({
    contracts: ownedTokenReads,
    query: { enabled: tokenIndexes.length > 0 },
  });

  let content;

  if (!isConnected) return null;

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
    content = (
      <p className="text-sm text-text-dark/80 dark:text-dark-text/80">
        Winner selection is pending. Please check back later.
      </p>
    );
  }

  return (
    <InfoCard title="🌟 Your Raffle Status">
      <div className="flex flex-col items-center justify-center gap-2 pt-1">
        {content}

        {tokenResults && tokenResults.length > 0 && (
          <div className="pt-4 space-y-2 text-sm text-text-dark/80 dark:text-dark-text/80">
            <p className="font-medium">🎫 You own the following ticket(s):</p>
            <div className="flex flex-wrap justify-center gap-2">
              {tokenResults.map((res, i) => {
                const tokenId = res?.result?.toString();
                return tokenId ? (
                  <div
                    key={i}
                    className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-700/30 dark:text-indigo-200 text-xs font-semibold"
                  >
                    Ticket #{tokenId}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </InfoCard>
  );
}
