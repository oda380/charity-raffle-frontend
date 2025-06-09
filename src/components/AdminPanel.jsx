// src/components/AdminPanel.jsx
import { useState, useEffect } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransactionReceipt,
} from "wagmi";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

const CONTRACT_ADDRESS = "0xCBDF97E844afDbF26f5e21e139e045dE72077023";
const MAX_SUPPLY = 300;

export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  const [count, setCount] = useState(1);
  const [uiError, setUiError] = useState(null);

  // --- HOOKS ---
  // All wagmi hooks are defined first.

  const {
    data: owner,
    isError: isOwnerError,
    error: ownerError,
    isLoading: isOwnerLoading,
  } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "owner",
    enabled: isConnected,
  });

  const {
    data: writeData,
    write,
    isPending: isWriteLoading, // Switched to isPending for wagmi v2+ convention
    error: txSubmitError,
    reset: resetWrite,
  } = useContractWrite();

  const {
    data: txReceipt,
    isError: isTxReceiptError,
    isLoading: isTxReceiptLoading,
    isSuccess: isTxReceiptSuccess,
    error: txReceiptFetchError,
  } = useWaitForTransactionReceipt({
    hash: writeData?.hash,
  });


  // --- LOGIC AND DERIVED STATE ---
  // Now we can safely use the variables from the hooks.

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

  // --- EVENT HANDLERS ---

  const handleClick = () => {
    setUiError(null);

    if (count < 1 || count > MAX_SUPPLY) {
      setUiError(`Number of winners must be between 1 and ${MAX_SUPPLY}.`);
      return;
    }

    // Ensure `write` is available before calling it
    if (typeof write !== "function") {
      console.error("❌ AdminPanel: 'write' function is not available.");
      setUiError("The write function is not ready. Please try again.");
      return;
    }

    write({
      address: CONTRACT_ADDRESS,
      abi: CharityRaffleABI,
      functionName: "selectWinners",
      args: [BigInt(count)],
    });
  };

  // --- EFFECTS ---

  // Effect to reset the form upon successful transaction
  useEffect(() => {
    if (isTxReceiptSuccess) {
      setUiError(null);
    }
  }, [isTxReceiptSuccess]);
  
  // --- DEBUGGING LOGS (optional) ---
  // Place logs here to safely inspect state on every render
  console.log({
    isAdmin,
    isLoadingInteraction,
    isWriteLoading,
    isTxReceiptLoading,
    writeFunction: write,
    error: currentInteractionError
  });


  // --- RENDER LOGIC ---

  if (!isConnected || isOwnerLoading) {
    return null; // Don't render anything if not connected or still loading owner
  }

  if (!isAdmin) {
    if (isOwnerError) {
      console.error("AdminPanel: Error fetching contract owner:", ownerError);
    }
    return null; // Don't render for non-admins
  }

  // Handle case where admin status is unclear due to an error
  if (isOwnerError && isAdmin) {
    return (
      <div className="text-sm text-center text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800/40 border border-red-300 dark:border-red-600 p-3 rounded-lg">
        ❌ Could not verify admin status properly:{" "}
        {ownerError?.shortMessage || ownerError?.message || "Unknown error"}
      </div>
    );
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
        disabled={isLoadingInteraction || !write}
        className="w-full py-2.5 px-6 rounded-full font-semibold text-white transition-all duration-200 ease-in-out
                   bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75
                   dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:focus:ring-indigo-600
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoadingInteraction
          ? isWriteLoading ? "Awaiting Signature..." : "Processing Tx..."
          : "Select Winners"}
      </button>

      {isTxReceiptSuccess && writeData?.hash && (
        <div className="text-sm text-green-600 dark:text-green-400 pt-2">
          ✅ Winners selected successfully!
          <br />
          <a
            href={`https://basescan.org/tx/${writeData.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-500 dark:hover:text-green-300 break-all"
          >
            View Transaction: {String(writeData.hash).slice(0, 10)}...{String(writeData.hash).slice(-8)}
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