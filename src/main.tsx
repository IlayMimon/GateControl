import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./scss/main.scss";
import App from "./App.tsx";
import axios from "axios";
import QueryProvider from "./components/QueryProvider.tsx";
import { GateControProvider } from "./context/GateControlContext.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { registerSW } from "virtual:pwa-register";

// Silently auto-update the service worker in the background
registerSW({ immediate: true });

if (import.meta.env.PROD) {
  axios.defaults.baseURL = window.location.pathname.split("/", 3).join("/");
  axios.interceptors.request.use((config) => {
    if (!config.url || !/^\/?_api/g.test(config.url)) {
      config.baseURL = undefined;
    }
    return config;
  });
}

axios.defaults.headers.common.Accept = "application/json;odata=verbose";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <UserProvider>
        <GateControProvider>
          <App />
        </GateControProvider>
      </UserProvider>
    </QueryProvider>
  </StrictMode>
);
