// src/components/MintSection.jsx
import { useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { useApproveUSDC } from "../hooks/useApproveUSDC"; // Assuming this path is correct
import { useAllowanceCheck } from "../hooks/useAllowanceCheck"; // Assuming this path is correct
import CharityRaffleABI from "../abis/CharityRaffleABI.json"; // Assuming this path is correct
import { ConnectButton } from "@rainbow-me/rainbowkit";

const CONTRACT_ADDRESS = "0xed81C5F9e322D1005a28393c5D93499ee2ff4e55"; // Make sure this is the correct Base Mainnet address
const MAX_SUPPLY = 300;

export default function MintSection() {
  const { address, isConnected } = useAccount();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { data: mintPriceData, isLoading: isPriceLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "mintPrice",
  });

  const { data: totalMintedData } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "totalMinted",
    watch: true,
  });

  const numericMintPrice = mintPriceData ? Number(mintPriceData) : 0;
  const minted = totalMintedData ? Number(totalMintedData) : 0;
  const soldOut = minted >= MAX_SUPPLY;

  // Ensure numericMintPrice is valid before passing to hooks
  const validNumericMintPrice = numericMintPrice > 0 ? numericMintPrice : 0;

  const { approve, status: approveStatus } = useApproveUSDC(
    quantity,
    validNumericMintPrice
  );
  const {
    hasEnoughAllowance,
    isLoading: isAllowanceLoading, // Assuming your hook provides this
    refetch: refetchAllowance,
  } = useAllowanceCheck(address, quantity, validNumericMintPrice);

  const handleMint = async () => {
    if (!address || !isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    if (quantity < 1 || quantity > 3) {
      setErrorMessage("Quantity must be between 1 and 3.");
      return;
    }
    if (soldOut) {
      setErrorMessage("Sorry, all tickets are sold out!");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setTxHash(null);

    try {
      // Refetch allowance right before checking
      const allowanceResult = await refetchAllowance?.();
      const currentAllowance = allowanceResult?.data ?? hasEnoughAllowance; // Use refetched data if available

      if (!currentAllowance) {
        const approveResult = await approve?.(); // Call approve
        if (!approveResult) { // Check if approve itself failed or user rejected
          throw new Error("USDC approval failed or was rejected.");
        }
        // It's good practice to refetch allowance again after approval if the hook doesn't auto-update
        // or wait for the approval transaction to be confirmed.
        // For simplicity here, we'll assume the relayer will handle a slight delay if any.
      }

      const res = await fetch(
        "https://charity-raffle-relayer.onrender.com/mint",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAddress: address, quantity }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Minting transaction failed.");
      }

      setTxHash(data.txHash);
    } catch (err) {
      console.error("Mint failed:", err);
      setErrorMessage(
        err.message || "An unexpected error occurred during minting."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-content-bg dark:bg-dark-content-bg shadow-soft rounded-xl p-6 text-center space-y-4">
        <h2 className="text-2xl font-headings text-pink-500 dark:text-pink-400"> {/* Assuming 'pink' is a defined theme accent */}
          🎁 Yolo Summer Event Charity Raffle
        </h2>
        <p className="text-text-dark/90 dark:text-dark-text/90">
          30% of total sales will be <strong>split equally</strong> between 3
          randomly selected winners after the event.
        </p>
        <p className="text-text-dark/90 dark:text-dark-text/90">
          The remaining 70% will be <strong>donated to charity</strong>.
        </p>
        <p className="text-text-dark/90 dark:text-dark-text/90">
          Connect your wallet to mint your ticket and participate.
        </p>
        <div className="pt-2 flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  // This content is rendered INSIDE a <Card> from App.jsx
  return (
    <div className="space-y-5 text-center"> {/* Main content wrapper with spacing */}
      {/* The main title "Join the Raffle!" is provided by the parent Card in App.jsx */}
      {/* Optional: A subtitle specific to this section if needed */}
      {/* <h3 className="text-lg font-headings text-indigo-500 dark:text-indigo-300">Your Minting Details</h3> */}

      <img
        src="https://gateway.pinata.cloud/ipfs/bafybeifja4swu3agtebxnkruod6sf7wrkrpo37tjabun6toxhl5c54vxse/winner.png" // Replace with your actual NFT image IPFS link
        alt="Raffle Ticket NFT Preview"
        className="w-full max-w-[200px] sm:max-w-[250px] mx-auto rounded-lg shadow-medium"
      />

      {typeof totalMintedData === "bigint" && (
        <p className="text-sm text-text-dark/80 dark:text-dark-text/80">
          🎯 {minted ?? 0} / {MAX_SUPPLY} tickets minted
        </p>
      )}

      {!isPriceLoading && validNumericMintPrice > 0 && (
        <p className="text-sm text-text-dark/80 dark:text-dark-text/80">
          Each ticket costs{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {(validNumericMintPrice / 10_000_000).toFixed(2)} USDC
          </span>
        </p>
      )}

      <div className="flex items-center justify-center gap-3 py-1">
        <label htmlFor="quantity-input" className="text-sm font-medium text-text-dark dark:text-dark-text">
          Quantity:
        </label>
        <input
          id="quantity-input"
          type="number"
          value={quantity}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= 1 && val <= 3) {
              setQuantity(val);
            } else if (e.target.value === "") { // Allow clearing input temporarily
              setQuantity(1); // Or handle intermediate empty state if desired
            }
          }}
          onBlur={(e) => { // Ensure value is valid on blur
            const val = Number(e.target.value);
            if (val < 1) setQuantity(1);
            if (val > 3) setQuantity(3);
          }}
          min={1}
          max={3}
          className="rounded-md border border-pastel-purple dark:border-slate-600 bg-content-bg dark:bg-dark-content-bg/50 px-3 py-1.5 text-center w-20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-150"
        />
      </div>

      {!isPriceLoading && validNumericMintPrice > 0 && quantity >= 1 && (
        <p className="text-sm text-text-dark/80 dark:text-dark-text/80">
          Total:{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {(quantity * validNumericMintPrice / 1_000_000).toFixed(2)} USDC
          </span>
        </p>
      )}

      <button
        onClick={handleMint}
        disabled={
          loading ||
          approveStatus === "loading" || // Assuming approveStatus can be 'loading'
          isAllowanceLoading ||
          isPriceLoading ||
          soldOut ||
          quantity < 1 || quantity > 3 // Explicitly disable if quantity is bad
        }
        className="w-full py-3 px-6 rounded-full font-semibold text-white transition-all duration-200 ease-in-out
                   bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
                   dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-500 dark:disabled:hover:bg-blue-600"
      >
        {soldOut
          ? "Sold Out"
          : loading || approveStatus === "loading" || isAllowanceLoading
            ? "Processing..."
            : !hasEnoughAllowance
              ? `Approve USDC & Mint ${quantity} Ticket${quantity > 1 ? "s" : ""}`
              : `Mint ${quantity} Ticket${quantity > 1 ? "s" : ""}`}
      </button>

      {txHash && (
        <div className="text-sm text-green-600 dark:text-green-400 text-center pt-2">
          ✅ Mint Successful! <br />
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-500 dark:hover:text-green-300 break-all"
          >
            View Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
        </div>
      )}

      {errorMessage && (
        <div className="text-sm text-center text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800/40 border border-red-300 dark:border-red-600 p-3 rounded-lg mt-2">
          ❌ {errorMessage}
        </div>
      )}
    </div>
  );
}