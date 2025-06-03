// src/components/AdminPanel.jsx
import { useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransactionReceipt
} from "wagmi";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";

// 1. Revert to hardcoded contract address
const CONTRACT_ADDRESS = "0xed81C5F9e322D1005a28393c5D93499ee2ff4e55"; // Make sure this is correct
const MAX_SUPPLY = 300;

export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  const [count, setCount] = useState(1);
  const [uiError, setUiError] = useState(null);

  // 2. Remove check for CONTRACT_ADDRESS being undefined from env, as it's now hardcoded.
  // if (!CONTRACT_ADDRESS) { ... } // This check is no longer needed

  const {
    data: owner,
    isError: isOwnerError,
    error: ownerError,
    isLoading: isOwnerLoading,
  } = useContractRead({
    address: CONTRACT_ADDRESS, // Still good to keep type assertion
    abi: CharityRaffleABI,
    functionName: "owner",
    enabled: isConnected,
  });

  const {
    data: writeData,
    write,
    isLoading: isWriteLoading,
    error: txSubmitError,
    reset: resetWrite,
  } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "selectWinners",
  });

  const {
    data: txReceipt,
    isError: isTxReceiptError,
    isLoading: isTxReceiptLoading,
    isSuccess: isTxReceiptSuccess,
    error: txReceiptFetchError,
  } = useWaitForTransactionReceipt({
    hash: writeData?.hash,
    enabled: !!writeData?.hash,
    onSuccess: () => {
      setUiError(null);
    },
    onError: () => { /* txReceiptFetchError will be populated */ }
  });

  const isAdmin =
    !!address && !!owner && address.toLowerCase() === String(owner).toLowerCase();

  if (!isConnected) {
    return null;
  }

  if (isOwnerLoading) {
    return null;
  }

  if (!isAdmin) {
    // Log error only if there was an owner fetch error, but still return null for non-admins
    if (isOwnerError) {
        console.error("AdminPanel: Error fetching contract owner:", ownerError);
    }
    return null;
  }

  // If isOwnerError is true AND isAdmin is somehow true (e.g. stale data),
  // an admin might want to see an error. But typically if owner fetch fails, isAdmin will be false.
  // This specific error display is for an admin who *is* verified but encounters an issue later.
  if (isOwnerError && isAdmin) {
     return (
      <div className="text-sm text-center text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800/40 border border-red-300 dark:border-red-600 p-3 rounded-lg">
        ❌ Could not verify admin status properly: {ownerError?.shortMessage || ownerError?.message || "Unknown error"}
      </div>
    );
  }


  const handleClick = () => {
    setUiError(null);
    if (count < 1 || count > MAX_SUPPLY) {
      setUiError(`Number of winners must be between 1 and ${MAX_SUPPLY}.`);
      return;
    }
    if (writeData?.hash || txSubmitError || txReceiptFetchError) {
        resetWrite();
    }
    write({ args: [BigInt(count)] });
  };

  const isLoadingInteraction = isWriteLoading || isTxReceiptLoading;
  const currentInteractionError = uiError || txSubmitError?.shortMessage || txSubmitError?.message || txReceiptFetchError?.shortMessage || txReceiptFetchError?.message || null;

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-3 py-1">
        <label htmlFor="winner-count-input" className="text-sm font-medium text-text-dark dark:text-dark-text">
          Number of Winners:
        </label>
        <input
          id="winner-count-input"
          type="number"
          value={count}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (e.target.value === "") { setCount(1); }
            else if (!isNaN(val)) { setCount(val); }
          }}
          onBlur={(e) => {
            let val = Number(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > MAX_SUPPLY) val = MAX_SUPPLY;
            setCount(val);
          }}
          min={1}
          max={MAX_SUPPLY}
          className="rounded-md border border-pastel-purple dark:border-slate-600 bg-content-bg dark:bg-dark-content-bg/50 px-3 py-1.5 text-center w-24
                     focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-150"
        />
      </div>

      <button
        onClick={handleClick}
        disabled={isLoadingInteraction}
        className="w-full py-2.5 px-6 rounded-full font-semibold text-white transition-all duration-200 ease-in-out
                   bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75
                   dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:focus:ring-indigo-600
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 dark:disabled:hover:bg-indigo-700"
      >
        {isLoadingInteraction
          ? isWriteLoading ? "Submitting..." : "Processing Tx..."
          : "Select Winners"}
      </button>

      {isTxReceiptSuccess && writeData?.hash && (
        <div className="text-sm text-green-600 dark:text-green-400 pt-2">
          ✅ Winners selected successfully! (Status: {txReceipt?.status})<br />
          {writeData?.hash && (
            <a
              href={`https://basescan.org/tx/${writeData.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-500 dark:hover:text-green-300 break-all"
            >
              View Transaction: {String(writeData.hash).slice(0, 10)}...{String(writeData.hash).slice(-8)}
            </a>
          )}
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
