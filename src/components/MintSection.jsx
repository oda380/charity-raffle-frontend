import { useState } from "react";

export default function MintSection() {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMint = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("https://https://charity-raffle-relayer.onrender.com/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`✅ Minted successfully! Tx: ${data.txHash}`);
      } else {
        setStatus(`❌ Mint failed: ${data.error || "unknown error"}`);
      }
    } catch (err) {
      setStatus("❌ Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold text-center">🎟️ Mint Raffle Ticket</h2>

      <div className="flex items-center gap-2 justify-center">
        <label className="text-sm font-medium">Quantity:</label>
        <input
          type="number"
          min={1}
          max={3}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border rounded px-3 py-1 w-20 text-center"
        />
      </div>

      <button
        onClick={handleMint}
        disabled={loading}
        className={`w-full py-2 px-4 rounded text-white font-medium ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Minting..." : `Mint ${quantity} Ticket${quantity > 1 ? "s" : ""}`}
      </button>

      {status && (
        <div className="text-sm text-center text-gray-700 bg-gray-100 p-2 rounded">
          {status}
        </div>
      )}
    </div>
  );
}
