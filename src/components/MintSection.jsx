import { useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { useApproveUSDC } from "../hooks/useApproveUSDC";
import { useAllowanceCheck } from "../hooks/useAllowanceCheck";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const CONTRACT_ADDRESS = "0xed81C5F9e322D1005a28393c5D93499ee2ff4e55";
const MAX_SUPPLY = 300;

export default function MintSection() {
  const { address, isConnected } = useAccount();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { data: mintPrice, isLoading: isPriceLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "mintPrice",
  });

  const { data: totalMinted } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "totalMinted",
    watch: true,
  });

  const numericMintPrice = mintPrice ? Number(mintPrice) : 0;
  const minted = totalMinted ? Number(totalMinted) : 0;
  const soldOut = minted >= MAX_SUPPLY;

  const { approve, status: approveStatus } = useApproveUSDC(quantity, numericMintPrice);
  const { hasEnoughAllowance, refetch: refetchAllowance } = useAllowanceCheck(
    address,
    quantity,
    numericMintPrice
  );

  const handleMint = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      await refetchAllowance();

      if (!hasEnoughAllowance) {
        await approve();
      }

      const res = await fetch("https://charity-raffle-relayer.onrender.com/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: address, quantity }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mint failed");

      setTxHash(data.txHash);
    } catch (err) {
      console.error("Mint failed:", err);
      setErrorMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 rounded-xl p-6 text-center text-gray-700 dark:text-gray-100 space-y-4 shadow-md">
        <h2 className="text-2xl font-fun text-pink-500 dark:text-pink-300">
          🎁 Yolo Summer Day Charity Raffle
        </h2>
        <p>
          30% of total sales will be <strong>split equally</strong> between 3 randomly selected winners after the event.
        </p>
        <p>
          The remaining 70% will be <strong>donated to charity</strong>.
        </p>
        <p>Connect your wallet to mint your ticket and participate.</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm rounded-2xl shadow-md border border-white/30 p-6 space-y-4 text-gray-800 dark:text-gray-100">
      <h2 className="text-xl font-fun text-pink-500 dark:text-pink-300 text-center">
        🎟️ Mint Your Ticket
      </h2>

      <img
        src="https://your-ipfs-gateway.com/ipfs/bafybeifja4swu3agtebxnkruod6sf7wrkrpo37tjabun6toxhl5c54vxse/winner.png"
        alt="NFT Preview"
        className="w-full max-w-xs mx-auto rounded-2xl shadow-md"
      />

      {typeof totalMinted === "bigint" && (
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          🎯 {minted} / {MAX_SUPPLY} tickets minted
        </p>
      )}
      
        {/* Ticket price info */}
        {!isPriceLoading && (
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Each ticket costs{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-300">
              {(numericMintPrice / 1_000_000).toFixed(2)} USDC
            </span>
          </p>
        )}

        {/* Quantity input */}
        <div className="flex items-center justify-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
            max={3}
            className="rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1 text-center w-20"
          />
        </div>

        {/* Total cost */}
        {!isPriceLoading && numericMintPrice > 0 && (
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Total:{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-300">
              {(quantity * numericMintPrice / 1_000_000).toFixed(2)} USDC
            </span>
          </p>
        )}

      <button
        onClick={handleMint}
        disabled={
          loading ||
          approveStatus === "loading" ||
          isPriceLoading ||
          soldOut
        }
        className="w-full py-2 px-4 rounded-full font-semibold text-white transition bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        {soldOut
          ? "Sold Out"
          : loading
            ? "Minting..."
            : hasEnoughAllowance
              ? `Mint ${quantity} Ticket${quantity > 1 ? "s" : ""}`
              : "Approve + Mint"}
      </button>

      {txHash && (
        <p className="text-sm text-green-500 text-center">
          ✅ Minted! Tx:{" "}
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {txHash.slice(0, 10)}...
          </a>
        </p>
      )}

      {errorMessage && (
        <div className="text-sm text-center text-red-500 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 p-3 rounded-xl">
          ❌ {errorMessage}
        </div>
      )}
    </div>
  );
}
