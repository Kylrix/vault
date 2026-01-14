import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/AppShell";
import { Box } from "@mui/material";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "700", "900"],
});

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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="preconnect" href="https://fra.cloud.appwrite.io" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#000' }}>
        <Providers>
          <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#000' }}>
            <AppShell>{children}</AppShell>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
