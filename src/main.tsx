import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./scss/main.scss";
import App from "./App.tsx";
import QueryProvider from "./components/QueryProvider.tsx";
import axios from "axios";
// import "mimic";

if (import.meta.env.PROD) {
  axios.defaults.baseURL = window.location.pathname.split('/', 3).join('/');
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
      <App />
    </QueryProvider>
  </StrictMode>
);
