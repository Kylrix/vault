"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Home,
  PlusCircle,
  Share2,
  Upload,
  Lock,
} from "lucide-react";
import { 
  Button, 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography, 
  Paper,
  alpha,
  useTheme as useMuiTheme
} from "@mui/material";
import { useTheme } from "@/app/providers";
import { useAppwrite } from "@/app/appwrite-provider";
import { masterPassCrypto } from "@/app/(protected)/masterpass/logic";
import { Navbar } from "./Navbar";
import dynamic from "next/dynamic";
import type { Models } from "appwrite";

const PasskeySetup = dynamic(() => import("@/components/overlays/passkeySetup").then(mod => mod.PasskeySetup), { ssr: false });

interface ExtendedUser extends Models.User<Models.Preferences> {
  isPasskey?: boolean;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Sharing", href: "/sharing", icon: Share2 },
  { name: "New", href: "/credentials/new", icon: PlusCircle, big: true },
  { name: "TOTP", href: "/totp", icon: Shield },
  { name: "Import", href: "/import", icon: Upload },
  { name: "Settings", href: "/settings", icon: Settings },
];

const SIMPLIFIED_LAYOUT_PATHS = [
  "/",
  "/masterpass",
  "/masterpass/reset",
  "/twofa/access",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const { user, loading, logout, refresh } = useAppwrite();
  const [showPasskeySetup, setShowPasskeySetup] = useState(false);

  const isSimplifiedLayout = SIMPLIFIED_LAYOUT_PATHS.includes(pathname);

  useEffect(() => {
    if (user && !loading) {
      const extendedUser = user as ExtendedUser;
      const shouldEnforcePasskey =
        process.env.NEXT_PUBLIC_PASSKEY_ENFORCE === "true" && !extendedUser.isPasskey;
      if (shouldEnforcePasskey && masterPassCrypto.isVaultUnlocked()) {
        setShowPasskeySetup(true);
      }
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && !user && !isSimplifiedLayout) {
      router.replace("/masterpass");
    }
  }, [loading, user, isSimplifiedLayout, router]);

  useEffect(() => {
    if (user && !isSimplifiedLayout) {
      masterPassCrypto.updateActivity();
      let intervalId: number | undefined;

      const keepAlive = () => masterPassCrypto.updateActivity();

      const startWatcher = () => {
        clearInterval(intervalId as number);
        intervalId = window.setInterval(() => {
          if (!masterPassCrypto.isVaultUnlocked()) {
            sessionStorage.setItem("masterpass_return_to", pathname);
            router.replace("/masterpass");
            clearInterval(intervalId as number);
          }
        }, 1000);
      };

      const handleActivity = () => keepAlive();

      window.addEventListener("mousemove", handleActivity);
      window.addEventListener("mousedown", handleActivity);
      window.addEventListener("keydown", handleActivity);
      window.addEventListener("scroll", handleActivity, { passive: true });
      window.addEventListener("touchstart", handleActivity, { passive: true });
      window.addEventListener("focus", handleActivity);
      window.addEventListener("click", handleActivity);

      const handleVisibility = () => {
        if (!masterPassCrypto.isVaultUnlocked()) {
          sessionStorage.setItem("masterpass_return_to", pathname);
          router.replace("/masterpass");
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);

      startWatcher();

      if (!masterPassCrypto.isVaultUnlocked()) {
        sessionStorage.setItem("masterpass_return_to", pathname);
        router.replace("/masterpass");
      }

      return () => {
        window.removeEventListener("mousemove", handleActivity);
        window.removeEventListener("mousedown", handleActivity);
        window.removeEventListener("keydown", handleActivity);
        window.removeEventListener("scroll", handleActivity);
        window.removeEventListener("touchstart", handleActivity);
        window.removeEventListener("focus", handleActivity);
        window.removeEventListener("click", handleActivity);
        document.removeEventListener("visibilitychange", handleVisibility);
        clearInterval(intervalId as number);
      };
    }
  }, [user, isSimplifiedLayout, pathname, router]);

  const ThemeIcon = () => {
    switch (theme) {
      case "light":
        return Sun;
      case "dark":
        return Moon;
      default:
        return Monitor;
    }
  };

  const ThemeSymbol = ThemeIcon();

  if (isSimplifiedLayout) {
    return <Box sx={{ minHeight: '100vh', bgcolor: '#000' }}>{children}</Box>;
  }

  if (!loading && !user) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <Navbar />

      <Box sx={{ flex: 1, display: 'flex', width: '100%', overflowX: 'hidden', pt: '72px' }}>
        <Box
          component="aside"
          sx={{
            display: { xs: 'none', lg: 'block' },
            position: 'fixed',
            left: 0,
            top: 72,
            height: 'calc(100vh - 72px)',
            width: 280,
            bgcolor: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(25px) saturate(180%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            overflowY: 'auto',
            zIndex: 30,
            p: 2
          }}
          aria-label="Primary sidebar navigation"
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <List sx={{ flex: 1, py: 0 }}>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      sx={{
                        borderRadius: '16px',
                        bgcolor: isActive ? alpha('#00F5FF', 0.1) : 'transparent',
                        color: isActive ? '#00F5FF' : 'rgba(255, 255, 255, 0.6)',
                        border: isActive ? '1px solid rgba(0, 245, 255, 0.2)' : '1px solid transparent',
                        '&:hover': {
                          bgcolor: isActive ? alpha('#00F5FF', 0.15) : 'rgba(255, 255, 255, 0.05)',
                          color: 'white'
                        },
                        py: item.big ? 2 : 1.5,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 44 }}>
                        <item.icon size={item.big ? 24 : 20} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: isActive ? 800 : 600,
                          fontFamily: 'var(--font-space-grotesk)',
                          letterSpacing: '0.02em'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
            
            <Box sx={{ mt: 'auto', pt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', mb: 2 }} />
              
              <Button
                variant="text"
                fullWidth
                startIcon={<ThemeSymbol size={18} />}
                onClick={() => {
                  const themes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
                  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
                  setTheme(nextTheme);
                }}
                sx={{ 
                  justifyContent: 'flex-start', 
                  color: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'white' }
                }}
              >
                {`${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode`}
              </Button>

              <Button
                variant="text"
                fullWidth
                startIcon={<Lock size={18} />}
                onClick={() => {
                  masterPassCrypto.lockNow();
                  if (!masterPassCrypto.isVaultUnlocked()) {
                    sessionStorage.setItem("masterpass_return_to", pathname);
                    router.replace("/masterpass");
                  }
                }}
                sx={{ 
                  justifyContent: 'flex-start', 
                  color: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'white' }
                }}
              >
                Lock Vault
              </Button>

              <Button
                variant="text"
                fullWidth
                startIcon={<LogOut size={18} />}
                onClick={logout}
                sx={{ 
                  justifyContent: 'flex-start', 
                  color: '#FF4D4D',
                  borderRadius: '12px',
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { bgcolor: alpha('#FF4D4D', 0.1) }
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden', ml: { lg: '280px' } }}>
          <Box component="main" sx={{ flex: 1, px: { xs: 2, sm: 4, md: 6 }, py: 6, pb: { xs: 12, lg: 6 }, overflowX: 'hidden', maxWidth: '100%' }}>
            {children}
          </Box>
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      <Paper
        component="nav"
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          right: 20,
          zIndex: 50,
          bgcolor: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(25px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          display: { xs: 'flex', lg: 'none' },
          justifyContent: 'space-around',
          alignItems: 'center',
          height: 72,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          overflow: 'visible'
        }}
      >
        {navigation
          .filter((item) => item.name !== "Import" && item.name !== "Settings")
          .map((item) => {
            const isActive = pathname === item.href;
            const isBig = item.big;

            if (isBig) {
              return (
                <Box
                  key={item.name}
                  component={Link}
                  href={item.href}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: -6,
                    textDecoration: 'none'
                  }}
                >
                  <Box
                    sx={{
                      height: 64,
                      width: 64,
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#00F5FF',
                      color: '#000',
                      boxShadow: '0 0 20px rgba(0, 245, 255, 0.4)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:active': { transform: 'scale(0.9) translateY(4px)' }
                    }}
                  >
                    <item.icon size={28} strokeWidth={2.5} />
                  </Box>
                </Box>
              );
            }

            return (
              <Box
                key={item.name}
                component={Link}
                href={item.href}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1,
                  minWidth: 64,
                  textDecoration: 'none',
                  color: isActive ? '#00F5FF' : 'rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: 10, 
                    fontWeight: isActive ? 800 : 500, 
                    mt: 0.5,
                    fontFamily: 'var(--font-space-grotesk)'
                  }}
                >
                  {item.name}
                </Typography>
              </Box>
            );
          })}
      </Paper>

      {user && (
        <PasskeySetup
          isOpen={showPasskeySetup}
          onClose={() => setShowPasskeySetup(false)}
          userId={user.$id}
          isEnabled={false}
          onSuccess={() => {
            setShowPasskeySetup(false);
            refresh();
          }}
          trustUnlocked={true}
        />
      )}
    </Box>
  );
}
