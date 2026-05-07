import React from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "@/app/providers/app-providers";
import { AppRouter } from "@/app/router/app-router";
import { applyPersistedTheme } from "@/shared/utils/theme";
import "@/styles/globals.css";

applyPersistedTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>
);
