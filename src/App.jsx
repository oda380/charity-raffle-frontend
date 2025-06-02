import WinnerStatus from "./components/WinnerStatus";
import MintSection from "./components/MintSection";
import MintedCount from "./components/MintedCount";
import WinnersList from "./components/WinnersList";
import AdminPanel from "./components/AdminPanel";
import TokenBalance from "./components/TokenBalance";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-6 space-y-6 text-center">
      <ConnectButton />
      <TokenBalance />
      <div className="max-w-md mx-auto space-y-4">
        <AdminPanel />
        <MintedCount />
        <WinnerStatus />
        <WinnersList />
        <MintSection />
        
      </div>
    </div>
  );
}