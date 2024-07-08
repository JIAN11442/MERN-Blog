import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import "./index.css";

import ToasterProvider from "./providers/toaster.provider.tsx";
import ScrollProvider from "./providers/scroll.provider.tsx";
import NetworkMonitor from "./providers/network.provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <NetworkMonitor>
        <ToasterProvider>
          <ScrollProvider>
            <App />
          </ScrollProvider>
        </ToasterProvider>
      </NetworkMonitor>
    </BrowserRouter>
  </React.StrictMode>
);
