"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AppwriteProvider } from "./appwrite-provider";
import { BackgroundTaskProvider } from "./context/BackgroundTaskContext";
import { AIProvider } from "./context/AIContext";
import { SudoProvider } from "./context/SudoContext";
import { Toaster } from "react-hot-toast";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { darkTheme } from "@/theme/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppwriteProvider>
        <SudoProvider>
          <BackgroundTaskProvider>
            <AIProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className: "font-mono border-2 border-border shadow-floating rounded-xl",
                  style: {
                    background: "var(--card)",
                    color: "var(--foreground)",
                  },
                }}
              />
            </AIProvider>
          </BackgroundTaskProvider>
        </SudoProvider>
      </AppwriteProvider>
    </MuiThemeProvider>
  );
}
