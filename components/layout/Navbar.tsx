"use client";

import Link from "next/link";
import { useAppwriteVault } from "@/context/appwrite-context";
import {
  GridViewOutlined as GripIcon,
  AutoAwesomeOutlined as SparklesIcon,
  VpnKeyOutlined as KeyIcon,
  PersonOutline as UserIcon,
  SettingsOutlined as SettingsIcon,
  LockOutlined as LockIcon,
  LogoutOutlined as LogOutIcon,
} from "@mui/icons-material";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { useAI } from "@/app/context/AIContext";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import EcosystemPortal from "../common/EcosystemPortal";
import Logo from "../common/Logo";

const PasswordGenerator = dynamic(() => import("@/components/ui/PasswordGenerator"), { 
  loading: () => <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>,
  ssr: false 
});

export function Navbar() {
  const { user, logout, openIDMWindow } = useAppwriteVault();
  const { openAIModal } = useAI();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEcosystemPortalOpen, setIsEcosystemPortalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setIsEcosystemPortalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isCorePage = [
    "/dashboard",
    "/credentials",
    "/totp",
    "/import",
    "/sharing",
    "/overview"
  ].some(path => pathname?.startsWith(path));

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'rgba(5, 5, 5, 0.03)',
        backdropFilter: 'blur(25px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'none',
        backgroundImage: 'none'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 88 }}>
        <Logo 
          size={32} 
          app="vault" 
          component={Link} 
          href="/" 
          sx={{ 
            color: 'inherit',
            '&:hover': { opacity: 0.8 },
            fontFamily: 'var(--font-clash)',
            fontWeight: 900,
            letterSpacing: '-0.04em'
          }} 
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Kylrix Portal (Ctrl+Space)">
            <IconButton
              onClick={() => setIsEcosystemPortalOpen(true)}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                '&:hover': { color: '#00F5FF', bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(0, 245, 255, 0.2)' } 
              }}
            >
              <GripIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {user && isCorePage && (
            <Tooltip title="AI Assistant">
              <IconButton
                onClick={openAIModal}
                sx={{ 
                  color: '#00F5FF', 
                  bgcolor: 'rgba(0, 245, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 245, 255, 0.1)',
                  '&:hover': { bgcolor: alpha('#00F5FF', 0.1), border: '1px solid rgba(0, 245, 255, 0.3)' } 
                }}
              >
                <SparklesIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}

          <DropdownMenu
            trigger={
              <IconButton title="Password Generator" sx={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)' } 
              }}>
                <KeyIcon sx={{ fontSize: 20 }} />
              </IconButton>
            }
            width="400px"
            align="right"
          >
            <Box sx={{ p: 3, bgcolor: 'rgba(5, 5, 5, 0.03)', backdropFilter: 'blur(25px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px' }}>
              <PasswordGenerator />
            </Box>
          </DropdownMenu>

          {!user ? (
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                window.location.href = `https://accounts.kylrix.space/login?source=${encodeURIComponent(window.location.origin)}`;
              }}
              sx={{ 
                background: 'linear-gradient(135deg, #00F5FF 0%, #00D1DA 100%)',
                color: '#000',
                fontWeight: 800,
                fontFamily: 'var(--font-satoshi)',
                borderRadius: '14px',
                textTransform: 'none',
                px: 4,
                py: 1,
                boxShadow: '0 8px 20px rgba(0, 245, 255, 0.15)',
                '&:hover': { background: 'linear-gradient(135deg, #00E5FF 0%, #00C1CA 100%)', transform: 'translateY(-1px)' }
              }}
            >
              Connect
            </Button>
          ) : (
            <Box>
              <Button
                variant="text"
                onClick={handleOpenMenu}
                startIcon={<UserIcon size={18} strokeWidth={1.5} />}
                sx={{ 
                  color: 'white',
                  fontWeight: 700,
                  fontFamily: 'var(--font-satoshi)',
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  borderRadius: '14px',
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)' }
                }}
              >
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'inline' }, fontWeight: 700 }}>
                  {user.name || user.email}
                </Typography>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                  sx: {
                    mt: 2,
                    minWidth: 260,
                    bgcolor: 'rgba(5, 5, 5, 0.05)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
                    backgroundImage: 'none',
                    color: 'white',
                    p: 1
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2.5, py: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', fontFamily: 'var(--font-satoshi)' }}>
                    {user.name || user.email}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                    {user.email}
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 1 }} />
                <MenuItem 
                  onClick={() => {
                    window.location.href = `https://accounts.kylrix.space/settings?source=${encodeURIComponent(window.location.origin)}`;
                    handleCloseMenu();
                  }} 
                  sx={{ py: 1.8, px: 2.5, gap: 2, borderRadius: '14px', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }}
                >
                  <SettingsIcon sx={{ fontSize: 18, color: "rgba(255, 255, 255, 0.6)" }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Account Settings</Typography>
                </MenuItem>
                <MenuItem
                  sx={{ py: 1.8, px: 2.5, gap: 2, borderRadius: '14px', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }}
                  onClick={() => {
                    import("@/app/(protected)/masterpass/logic").then(({ masterPassCrypto }) => {
                      masterPassCrypto.lockNow();
                      sessionStorage.setItem("masterpass_return_to", window.location.pathname);
                      window.location.replace("/masterpass");
                    });
                    handleCloseMenu();
                  }}
                >
                  <LockIcon sx={{ fontSize: 18, color: "rgba(255, 255, 255, 0.6)" }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Lock Vault</Typography>
                </MenuItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 1 }} />
                <MenuItem
                  onClick={async () => {
                    handleCloseMenu();
                    await logout();
                  }}
                  sx={{ py: 1.8, px: 2.5, gap: 2, borderRadius: '14px', color: '#FF4D4D', '&:hover': { bgcolor: 'rgba(255, 77, 77, 0.05)' } }}
                >
                  <LogOutIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      </Toolbar>
      <EcosystemPortal 
        open={isEcosystemPortalOpen} 
        onClose={() => setIsEcosystemPortalOpen(false)} 
      />
    </AppBar>
  );
}
