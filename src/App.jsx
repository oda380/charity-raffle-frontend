import MintSection from "./components/MintSection";
import MintedCount from "./components/MintedCount";
import WinnersList from "./components/WinnersList";
import WinnerStatus from "./components/WinnerStatus";
import TokenBalance from "./components/TokenBalance";
import AdminPanel from "./components/AdminPanel";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F2FF] via-[#E5D4FF] to-[#F0E7FF] dark:from-[#1e1b4b] dark:to-[#312e81] text-gray-800 dark:text-gray-100 font-sans">
      <header className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-fun text-indigo-600 dark:text-indigo-300">
          🎟️ Yolo Summer Day Charity Raffle
        </h1>
        <ConnectButton />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <TokenBalance />
        <MintedCount />
        <MintSection />
        <WinnerStatus />
        <WinnersList />
        <AdminPanel />
      </main>

      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
        Powered by Base. 70% donated. 30% rewarded. ❤️
      </footer>
    </div>
  );
}
