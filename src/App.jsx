// src/App.jsx
import MintSection from "./components/MintSection";
import MintedCount from "./components/MintedCount";
import WinnersList from "./components/WinnersList";
import WinnerStatus from "./components/WinnerStatus";
import TokenBalance from "./components/TokenBalance";
import AdminPanel from "./components/AdminPanel";
import Card from "./components/Card";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAdminStatus } from "./hooks/useAdminStatus";
import { Toaster } from "react-hot-toast";

export default function App() {
  const {
    isAdmin,
    isConnected,
    isLoadingAdminStatus,
    isAdminStatusError,
  } = useAdminStatus();

  return (   
    <div className="min-h-screen bg-gradient-to-br from-[#E0F2FF] via-[#E5D4FF] to-[#F0E7FF] dark:from-[#1e1b4b] dark:to-[#312e81] text-text-dark dark:text-dark-text font-primary">
    <Toaster position="top-center" />

    <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <h1 className="text-2xl sm:text-3xl font-headings text-indigo-700 dark:text-indigo-300">
        🎟️ Yolo Summer Event Charity Raffle
      </h1>
      <ConnectButton />
    </header>

    <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Card title="Join the Raffle!">
        <TokenBalance />
        <MintedCount />
        <MintSection />
      </Card>

      <Card title="Raffle Results">
        <WinnerStatus />
        <WinnersList />
      </Card>

      {isAdmin && !isLoadingAdminStatus && !isAdminStatusError && (
        <Card
          title="Admin Controls"
          className="border-pastel-purple dark:border-indigo-500 border-2"
          titleClassName="text-purple-700 dark:text-purple-400"
        >
          <AdminPanel />
        </Card>
      )}
    </main>

    <footer className="text-center text-sm text-gray-600 dark:text-gray-400 py-8">
      Powered by Base. 70% donated. 30% rewarded. ❤️ <br />
      Built with fun by the Yolo Charity Team.
    </footer>
  </div>
  );
}
