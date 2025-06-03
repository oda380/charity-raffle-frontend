import { useState } from "react";

const nftImages = [
  "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeicdm7g2nhllr47dei42l355nahuzebm6uzoowf5kd5ymxikf2tkcq/001.png",
  "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeicdm7g2nhllr47dei42l355nahuzebm6uzoowf5kd5ymxikf2tkcq/002.png",
  "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeicdm7g2nhllr47dei42l355nahuzebm6uzoowf5kd5ymxikf2tkcq/003.png",
  "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeicdm7g2nhllr47dei42l355nahuzebm6uzoowf5kd5ymxikf2tkcq/004.png",
  "https://scarlet-worried-toad-640.mypinata.cloud/ipfs/bafybeicdm7g2nhllr47dei42l355nahuzebm6uzoowf5kd5ymxikf2tkcq/005.png",
];

export function NFTPreviewCarousel() {
  const [index, setIndex] = useState(0);

  const handlePrev = () =>
    setIndex((prev) => (prev - 1 + nftImages.length) % nftImages.length);
  const handleNext = () =>
    setIndex((prev) => (prev + 1) % nftImages.length);

  return (
    <div className="relative flex flex-col items-center space-y-2">
      <img
        src={nftImages[index]}
        alt={`NFT preview ${index + 1}`}
        className="w-full max-w-[220px] sm:max-w-[250px] mx-auto rounded-xl shadow-md object-contain"
      />
      <div className="flex justify-center gap-4 pt-1">
        <button
          onClick={handlePrev}
          className="px-3 py-1 text-sm rounded-full bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-200"
        >
          ◀ Prev
        </button>
        <button
          onClick={handleNext}
          className="px-3 py-1 text-sm rounded-full bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-200"
        >
          Next ▶
        </button>
      </div>
      <div className="flex justify-center gap-1 pt-1">
        {nftImages.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${
              i === index
                ? "bg-indigo-600 dark:bg-indigo-300"
                : "bg-indigo-200 dark:bg-indigo-700"
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
}
