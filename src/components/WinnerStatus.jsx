// src/components/WinnerStatus.jsx
import { useEffect, useState } from "react";
import { useAccount, useContractRead, useReadContracts } from "wagmi";
import InfoCard from "./InfoCard";
import CharityRaffleABI from "../abis/CharityRaffleABI.json";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const RELAYER_BASE_URL = "https://charity-raffle-relayer.onrender.com";
const CONTRACT_ADDRESS = "0xCBDF97E844afDbF26f5e21e139e045dE72077023";
const BASE_CID = "bafybeihc6d6jdpbf6ai7yggjrfssto35wsdexzkdud4xqsasylufg34tle";
const BASE_GATEWAY = "https://scarlet-worried-toad-640.mypinata.cloud/ipfs";

export default function WinnerStatus() {
  const { address, isConnected } = useAccount();
  const [isWinner, setIsWinner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [tokenMetadata, setTokenMetadata] = useState({});
  const [winnerTokenIds, setWinnerTokenIds] = useState([]);

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

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await fetch(`${RELAYER_BASE_URL}/winners`);
        const data = await res.json();
        if (Array.isArray(data.winners)) {
          setWinnerTokenIds(data.winners.map((id) => Number(id)));
        }
      } catch (e) {
        console.warn("Failed to fetch winners list", e);
      }
    };

    fetchWinners();
  }, []);

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

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenResults || tokenResults.length === 0) return;

      const metadata = {};
      for (const res of tokenResults) {
        const tokenId = res?.result?.toString();
        if (!tokenId) continue;

        const paddedId = tokenId.padStart(3, "0");
        const url = `${BASE_GATEWAY}/${BASE_CID}/${paddedId}.json`;

        try {
          const res = await fetch(url);
          const data = await res.json();
          metadata[tokenId] = data;
        } catch (e) {
          console.warn("Failed to load metadata for token", tokenId);
        }
      }

      setTokenMetadata(metadata);
    };

    fetchMetadata();
  }, [tokenResults]);

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
      </div>

      {tokenResults && tokenResults.length > 0 && (
        <div className="pt-4 space-y-2 text-sm text-text-dark/80 dark:text-dark-text/80">
          <p className="font-medium text-center">🎫 You own the following ticket(s):</p>
          <Swiper
            spaceBetween={16}
            slidesPerView={tokenResults.length === 1 ? 1 : 1.2}
            centeredSlides={tokenResults.length === 1}
            navigation
            pagination={{ clickable: true }}
            modules={[Navigation, Pagination]}
            className="w-full max-w-sm mx-auto"
          >
            {tokenResults.map((res, i) => {
              const tokenId = res?.result?.toString();
              const meta = tokenMetadata[tokenId];
              const imageUrl = meta?.image?.replace("ipfs://", `${BASE_GATEWAY}/`);
              const isWinnerToken = winnerTokenIds.includes(Number(tokenId));

              return tokenId ? (
                <SwiperSlide key={i}>
                  <div className="flex flex-col items-center text-center gap-2 transition-all">
                    <div
                      className={`rounded-xl overflow-hidden ${
                        isWinnerToken
                          ? "shadow-[0_0_12px_rgba(255,215,0,0.8)]"
                          : "shadow-sm dark:shadow-none"
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`Ticket #${tokenId}`}
                        className={`w-48 h-48 object-cover rounded-xl border ${
                          isWinnerToken
                            ? "border-yellow-400"
                            : "border-indigo-300 dark:border-indigo-700"
                        }`}
                      />
                    </div>

                    <span
                      className={`text-sm ${
                        isWinnerToken
                          ? "text-yellow-600 font-bold dark:text-yellow-400"
                          : "text-indigo-600 dark:text-indigo-300"
                      }`}
                    >
                      Ticket #{tokenId}
                    </span>

                    {isWinnerToken && (
                      <span className="text-xs text-yellow-500 dark:text-yellow-300 font-semibold">
                        🎉 Winner!
                      </span>
                    )}
                  </div>
                </SwiperSlide>
              ) : null;
            })}
          </Swiper>
        </div>
      )}
    </InfoCard>
  );
}
