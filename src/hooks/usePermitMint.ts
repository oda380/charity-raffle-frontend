import { useState } from "react";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import axios from "../lib/axiosInstance";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;
const USDC_NAME = "USD Coin";
const USDC_VERSION = "2";

// The address of your deployed CharityRaffle smart contract.
const SPENDER_CONTRACT_ADDRESS = "0xCBDF97E844afDbF26f5e21e139e045dE72077023" as `0x${string}`;

export function usePermitMint(quantity: number, mintPrice: number) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintWithPermit = async (): Promise<string | null> => {
    if (!isConnected || !address || quantity < 1 || quantity > 10) {
      setError("Please connect your wallet and enter a valid quantity.");
      return null;
    }

    if (!walletClient || !publicClient) {
      setError("Wallet or network not available.");
      return null;
    }

    const normalizedAddress = address.toLowerCase();

    // --- ‼️ THE DEFINITIVE FIX ‼️ ---
    // The "spender" must be your CharityRaffle contract, not the relayer's wallet.
    // We are hardcoding it here to ensure the correct address is always used.
    const spender = SPENDER_CONTRACT_ADDRESS;

    // Runtime guard for the spender address
    if (!spender) {
      setError("Spender contract address is not set.");
      console.error("❌ SPENDER_CONTRACT_ADDRESS is missing");
      return null;
    }

    console.log("🧾 Permit mint setup:", {
      address: normalizedAddress,
      walletClientAccount: walletClient.account,
      quantity,
      mintPrice,
      spender, // This should now be your CharityRaffle contract address
    });

    setLoading(true);
    setError(null);

    try {
      const value = BigInt(quantity) * BigInt(mintPrice);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800); // 30 mins from now

      const nonce: bigint = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: [
          {
            name: "nonces",
            type: "function",
            stateMutability: "view",
            inputs: [{ name: "owner", type: "address" }],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "nonces",
        args: [normalizedAddress as `0x${string}`],
      });

      const domain = {
        name: USDC_NAME,
        version: USDC_VERSION,
        chainId: await walletClient.getChainId(),
        verifyingContract: USDC_ADDRESS,
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };
      
      const signature = await walletClient.signTypedData({
        domain,
        types,
        primaryType: "Permit",
        message: {
          owner: normalizedAddress,
          spender,
          value,
          nonce,
          deadline,
        },
      });

      const { r, s, v } = splitSignature(signature);

      const { data } = await axios.post("/mint-with-permit", {
        tokenOwner: normalizedAddress,
        nftRecipient: normalizedAddress,
        quantity,
        value: value.toString(),
        permitDeadline: deadline.toString(),
        permitV: v,
        permitR: r,
        permitS: s,
      });

      return data.txHash;
    } catch (err: any) {
      console.error("Permit mint failed:", err);
      const msg = err?.response?.data?.error || err.message || "Permit mint failed";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mintWithPermit, loading, error };
}

function splitSignature(signature: string) {
  return {
    r: `0x${signature.slice(2, 66)}` as `0x${string}`,
    s: `0x${signature.slice(66, 130)}` as `0x${string}`,
    v: parseInt(signature.slice(130, 132), 16),
  };
}