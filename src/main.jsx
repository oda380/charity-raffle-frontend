import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Web3Provider } from "./wagmi.jsx"; // ✅ Your custom wrapper
import "@rainbow-me/rainbowkit/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(

    <Web3Provider>
      <App />
    </Web3Provider>

);
