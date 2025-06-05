// src/components/MintSection.jsx
import { useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { useUSDCBalance } from "../hooks/useUSDCBalance";
import { usePermitMint } from "../hooks/usePermitMint";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NFTPreviewCarousel } from "./NFTPreviewCarousel";
import toast from "react-hot-toast";

const CONTRACT_ADDRESS = "0xCBDF97E844afDbF26f5e21e139e045dE72077023";
const MAX_SUPPLY = 300;

export default function MintSection() {
  const { address, isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);
  const [txHash, setTxHash] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [minted, setMinted] = useState(false);

  const { data: mintPriceData, isLoading: isPriceLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "mintPrice",
    query: {
      refetchInterval: 60000,
    },
  });

  const { data: totalMintedData } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CharityRaffleABI,
    functionName: "totalMinted",
    query: { refetchInterval: 30000 },
  });

  const numericMintPrice = mintPriceData ? Number(mintPriceData) : 0;
  const mintedCount = totalMintedData ? Number(totalMintedData) : 0;
  const soldOut = mintedCount >= MAX_SUPPLY;
  const validNumericMintPrice = numericMintPrice > 0 ? numericMintPrice : 0;

  const { balance: usdcBalance, isLoading: isUSDCLoading, refetch: usdcBalanceRefetch } =
    useUSDCBalance(address);

  const { mintWithPermit, loading, error } = usePermitMint(quantity, validNumericMintPrice);

  const handleMint = async () => {
    if (!address || !isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    if (quantity < 1 || quantity > 10) {
      setErrorMessage("Quantity must be between 1 and 10.");
      return;
    }
    if (soldOut) {
      setErrorMessage("Sorry, all tickets are sold out!");
      return;
    }

    const required = BigInt(quantity) * BigInt(validNumericMintPrice);
    if (!usdcBalance || usdcBalance < required) {
      setErrorMessage("You don't have enough USDC to mint.");
      return;
    }

    setErrorMessage(null);
    setTxHash(null);

    try {
      const hash = await mintWithPermit();
      setTxHash(hash);
      toast.success("🎉 Mint successful! Check your NFT below.", { position: "top-center" });
      await usdcBalanceRefetch?.();
      setQuantity(1);
      setMinted(true);
    } catch (err) {
      console.error("Mint failed:", err);
      setErrorMessage(error || "An unexpected error occurred during minting.");
    }
  };

  return (
    <div className="space-y-6 text-center">
      <NFTPreviewCarousel />

      {!isConnected ? (
        <div className="bg-content-bg dark:bg-dark-content-bg shadow-soft rounded-xl p-6 text-center space-y-4">
          <h2 className="text-2xl font-headings text-pink-500 dark:text-pink-400">
            🎁 Yolo Summer Event Charity Raffle
          </h2>
          <p className="text-text-dark/90 dark:text-dark-text/90">
            30% of total sales will be <strong>split equally</strong> between 3 randomly selected winners after the event.
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
      ) : (
        <div className="space-y-5">
          {!isPriceLoading && validNumericMintPrice > 0 && (
            <p className="text-sm text-text-dark/80 dark:text-dark-text/80">
              Each raffle ticket costs {" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {(validNumericMintPrice / 1_000_000).toFixed(2)} USDC.
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
                if (val >= 1 && val <= 10) {
                  setQuantity(val);
                } else if (e.target.value === "") {
                  setQuantity(1);
                }
              }}
              onBlur={(e) => {
                const val = Number(e.target.value);
                if (val < 1) setQuantity(1);
                if (val > 10) setQuantity(10);
              }}
              min={1}
              max={10}
              className="rounded-md border border-pastel-purple dark:border-slate-600 bg-content-bg dark:bg-dark-content-bg/50 px-3 py-1.5 text-center w-20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-150"
            />
          </div>

          {!isPriceLoading && quantity >= 1 && (
            <p className="text-sm text-text-dark/80 dark:text-dark-text/80">
              Total: {" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {(quantity * validNumericMintPrice / 1_000_000).toFixed(2)} USDC
              </span>
            </p>
          )}

          <button
            onClick={handleMint}
            disabled={
              loading ||
              isPriceLoading ||
              isUSDCLoading ||
              soldOut ||
              quantity < 1 ||
              quantity > 10
            }
            className="w-full py-3 px-6 rounded-full font-semibold text-white transition-all duration-200 ease-in-out
                     bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75
                     dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500
                     disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {soldOut
              ? "Sold Out"
              : loading
              ? "Minting..."
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

          {minted && (
            <div className="bg-green-50 border border-green-300 text-green-700 dark:bg-green-900/20 dark:text-green-300 p-4 rounded-lg">
              ✅ Thank you for minting! Your NFT has been sent to your wallet.
            </div>
          )}

          {errorMessage && (
            <div className="text-sm text-center text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-800/40 border border-red-300 dark:border-red-600 p-3 rounded-lg mt-2">
              ❌ {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
