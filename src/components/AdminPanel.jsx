// src/components/AdminPanel.jsx
import { useState, useEffect } from "react";
import {
  useAccount,
  useContractRead,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

const CONTRACT_ADDRESS = "0x1048d4F6CfEcD09aDB8A57BaE6059260a66780Ac";
const MAX_SUPPLY = 300;

export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  const [count, setCount] = useState(1);
  const [uiError, setUiError] = useState(null);

  const {
    data: owner,
    isLoading: isOwnerLoading,
    isError: isOwnerError,
    error: ownerError,
  } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "owner",
    enabled: isConnected,
  });

  const {
    data: writeHash,
    writeContract,
    isPending: isWriteLoading,
    error: txSubmitError,
  } = useWriteContract();

  const {
    data: txReceipt,
    isLoading: isTxReceiptLoading,
    isSuccess: isTxReceiptSuccess,
    isError: isTxReceiptError,
    error: txReceiptFetchError,
  } = useWaitForTransactionReceipt({
    hash: writeHash,
  });

  const isAdmin =
    !!address && !!owner && address.toLowerCase() === String(owner).toLowerCase();
  const isLoadingInteraction = isWriteLoading || isTxReceiptLoading;

  const currentInteractionError =
    uiError ||
    txSubmitError?.shortMessage ||
    txSubmitError?.message ||
    txReceiptFetchError?.shortMessage ||
    txReceiptFetchError?.message ||
    null;

  const handleClick = () => {
    setUiError(null);

    if (count < 1 || count > MAX_SUPPLY) {
      setUiError(`Number of winners must be between 1 and ${MAX_SUPPLY}.`);
      return;
    }

    if (!writeContract) {
      console.error("❌ writeContract is not available.");
      setUiError("Select Winners is not available. Please try again.");
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CharityRaffleABI,
      functionName: "selectWinners",
      args: [BigInt(count)],
    });
  };

  useEffect(() => {
    if (isTxReceiptSuccess) {
      setUiError(null);
    }
  }, [isTxReceiptSuccess]);

  if (!isConnected || isOwnerLoading) return null;
  if (!isAdmin) {
    if (isOwnerError) {
      console.error("AdminPanel: Error fetching contract owner:", ownerError);
    }
    return null;
  }

  return (
    <div className="space-y-4 text-center">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-1">
        <label className="text-sm font-medium text-text-dark dark:text-dark-text">
          Number of Winners:
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            className="w-9 h-9 rounded-full bg-pastel-purple/20 hover:bg-pastel-purple/40 dark:bg-slate-700 dark:hover:bg-slate-600 text-xl font-semibold text-indigo-600 dark:text-indigo-300 transition"
            aria-label="Decrease number of winners"
            disabled={isLoadingInteraction}
          >
            −
          </button>
          <span className="text-lg font-semibold w-10 text-center text-text-dark dark:text-dark-text">
            {count}
          </span>
          <button
            onClick={() => setCount((c) => Math.min(MAX_SUPPLY, c + 1))}
            className="w-9 h-9 rounded-full bg-pastel-purple/20 hover:bg-pastel-purple/40 dark:bg-slate-700 dark:hover:bg-slate-600 text-xl font-semibold text-indigo-600 dark:text-indigo-300 transition"
            aria-label="Increase number of winners"
            disabled={isLoadingInteraction}
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleClick}
        disabled={isLoadingInteraction || !writeContract}
        className="w-full py-2.5 px-6 rounded-full font-semibold text-white transition-all duration-200 ease-in-out
                   bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75
                   dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:focus:ring-indigo-600
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoadingInteraction
          ? isWriteLoading
            ? "Awaiting Signature..."
            : "Processing Tx..."
          : "Select Winners"}
      </button>

      {isTxReceiptSuccess && writeHash && (
        <div className="text-sm text-green-600 dark:text-green-400 pt-2">
          ✅ Winners selected successfully!
          <br />
          <a
            href={`https://basescan.org/tx/${writeHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-500 dark:hover:text-green-300 break-all"
          >
            View Transaction: {writeHash.slice(0, 10)}...{writeHash.slice(-8)}
          </a>
        </div>
      )}

      {currentInteractionError && !isTxReceiptSuccess && (
        <div className="text-sm text-center text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800/40 border border-red-300 dark:border-red-600 p-3 rounded-lg mt-2">
          ❌ Error: {currentInteractionError}
        </div>
      )}
    </div>
  );
}
