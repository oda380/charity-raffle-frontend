
---

### ✅ `README.md`

````markdown
# 🎟️ Charity Raffle dApp (Frontend)

This is the frontend application for the **Yolo Summer Day Charity Raffle** built on [Base](https://base.org). Users can connect their wallet, mint up to 3 NFT raffle tickets, and potentially win real-world prizes — with proceeds split between winners and charity.

---

## 🚀 Features

- ✅ Mint up to **3 NFT tickets** using USDC
- ✅ Gasless minting via relayer (sponsored by backend)
- ✅ Live **supply tracker** (`totalMinted / 300`)
- ✅ **Winner status checker** per wallet
- ✅ Display of all **winning ticket IDs + wallet addresses**
- ✅ Admin panel for triggering `selectWinners()`
- ✅ Clean pastel blue–lavender–purple design 🌈
- ✅ Built on **Wagmi v2** + **RainbowKit** + **Vite**

---

## 📦 Tech Stack

- [React + Vite](https://vitejs.dev/)
- [Wagmi v2](https://wagmi.sh/)
- [RainbowKit v2](https://www.rainbowkit.com/)
- [Base Mainnet](https://basescan.org/)
- [USDC.e](https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- IPFS-hosted NFT image preview

---

## 🔧 Local Development

### 1. Clone the repo

```bash
git clone https://github.com/your-org/charity-raffle-frontend.git
cd charity-raffle-frontend
````

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

> Get your WalletConnect project ID from [walletconnect.com](https://cloud.walletconnect.com/).

### 4. Run the app

```bash
npm run dev
```

---

## 🧠 Contracts

| Contract             | Address                                      |
| -------------------- | -------------------------------------------- |
| NFT (CharityRaffle)  | `0xed81C5F9e322D1005a28393c5D93499ee2ff4e55` |
| Payment Token (USDC) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

---

## 🧪 Admin Wallet

* Connect with the contract owner wallet to access the admin panel
* Admins can call `selectWinners(count)`
* Winners are randomly selected and stored on-chain
* Token owners are displayed with ticket numbers

---

## 📁 Structure

```
src/
│
├── components/
│   ├── MintSection.jsx
│   ├── TokenBalance.jsx
│   ├── MintedCount.jsx
│   ├── WinnersList.jsx
│   ├── WinnerStatus.jsx
│   └── AdminPanel.jsx
│
├── hooks/
│   ├── useApproveUSDC.ts
│   ├── useAllowanceCheck.ts
│
├── abis/
│   ├── CharityRaffle.json
│   └── USDC.json
│
├── wagmi.jsx
└── App.jsx
```

---

## 🛡️ Security

* USDC transfers require wallet `approve()`
* All winners are randomly selected by the owner using on-chain logic
* User identities are not stored, only wallet addresses

---

## 🧾 License

MIT — feel free to use or fork.

---
