"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AppwriteProvider } from "./appwrite-provider";
import { BackgroundTaskProvider } from "./context/BackgroundTaskContext";
import { AIProvider } from "./context/AIContext";
import { SudoProvider } from "./context/SudoContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Toaster } from "react-hot-toast";
import { ThemeProvider as MuiThemeProvider, CssBaseline, Box } from "@mui/material";
import { darkTheme } from "@/theme/theme";
import EcosystemPortal from "@/components/common/EcosystemPortal";
import { useEcosystemNode } from "@/hooks/useEcosystemNode";

function GlobalEcosystemHandler() {
  const [open, setOpen] = useState(false);
  useEcosystemNode('vault');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <EcosystemPortal open={open} onClose={() => setOpen(false)} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <MuiThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppwriteProvider>
        <NotificationProvider>
          <SudoProvider>
            <BackgroundTaskProvider>
              <AIProvider>
                <GlobalEcosystemHandler />
                <Box
                  style={{
                    visibility: mounted ? "visible" : "hidden",
                    opacity: mounted ? 1 : 0,
                    transition: "opacity 0.5s ease-in-out",
                  }}
                >
                  {children}
                </Box>
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
        </NotificationProvider>
      </AppwriteProvider>
    </MuiThemeProvider>
  );
}
