import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/AppShell";
import { Box } from "@mui/material";
import { EcosystemClient } from "@/components/ecosystem/EcosystemClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "WhisperrKeep - Premium Password Vault",
  description: "Secure, simple password management for individuals and teams. Your digital life, protected.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;700&display=swap" 
          rel="stylesheet" 
        />
        <link rel="preconnect" href="https://fra.cloud.appwrite.io" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#000' }}>
        <Providers>
          <EcosystemClient nodeId="keep" />
          <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#000' }}>
            <Suspense fallback={null}>
              <AppShell>
                {children}
              </AppShell>
            </Suspense>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
