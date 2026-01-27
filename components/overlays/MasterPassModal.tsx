"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Box,
  Stack,
  CircularProgress,
  Paper,
  alpha,
  useTheme,
  Tooltip
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import ShieldIcon from "@mui/icons-material/Shield";
import LogoutIcon from "@mui/icons-material/Logout";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useAppwrite } from "@/app/appwrite-provider";
import { masterPassCrypto } from "@/app/(protected)/masterpass/logic";
import { useFinalizeAuth } from "@/lib/finalizeAuth";
import {
  hasMasterpass,
  setMasterpassFlag,
  logoutAppwrite,
  AppwriteService,
} from "@/lib/appwrite";
import { checkRateLimit, getBlockedDuration } from "@/lib/rate-limiter";
import toast from "react-hot-toast";
import { unlockWithPasskey } from "@/lib/passkey";

interface MasterPassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MasterPassModal({ isOpen, onClose }: MasterPassModalProps) {
  const muiTheme = useTheme();
  const [masterPassword, setMasterPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [confirmCapsLock, setConfirmCapsLock] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const { user } = useAppwrite();
  const { finalizeAuth } = useFinalizeAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([hasMasterpass(user.$id), AppwriteService.hasPasskey(user.$id)])
      .then(([masterpassPresent, passkeyPresent]) => {
        setIsFirstTime(!masterpassPresent);
        setHasPasskey(passkeyPresent);
      })
      .catch(() => {
        setIsFirstTime(true);
        setHasPasskey(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (user) {
      const rateLimitKey = `unlock_${user.$id}`;
      if (!checkRateLimit(rateLimitKey)) {
        const remainingTime = getBlockedDuration(rateLimitKey);
        toast.error(`Too many attempts. Please try again in ${remainingTime} seconds.`);
        setLoading(false);
        return;
      }
    }

    try {
      if (isFirstTime) {
        if (masterPassword !== confirmPassword) {
          toast.error("Passwords don't match");
          setLoading(false);
          return;
        }
        if (masterPassword.length < 8) {
          toast.error("Master password must be at least 8 characters");
          setLoading(false);
          return;
        }

        const success = await masterPassCrypto.unlock(
          masterPassword,
          user?.$id || "",
          true,
        );

        if (success) {
          if (user) {
            await setMasterpassFlag(user.$id, user.email);
          }
          onClose();
          await finalizeAuth({ redirect: true, fallback: "/masterpass" });
        } else {
          toast.error("Failed to set master password");
        }
      } else {
        const success = await masterPassCrypto.unlock(
          masterPassword,
          user?.$id || "",
          false,
        );

        if (success) {
          onClose();
          await finalizeAuth({ redirect: true, fallback: "/masterpass" });
        } else {
          toast.error("Incorrect master password. Please try again.");
        }
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      if (
        e?.message?.includes("Vault is locked") ||
        e?.message?.includes("master password is incorrect")
      ) {
        toast.error("Incorrect master password. Please try again.");
      } else {
        toast.error("Failed to unlock vault");
      }
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    await logoutAppwrite();
    setLoading(false);
    onClose();
    router.replace("/");
  };

  const handlePasskeyUnlock = async () => {
    if (!user?.$id) return;
    setPasskeyLoading(true);
    const success = await unlockWithPasskey(user.$id);
    if (success) {
      onClose();
      await finalizeAuth({ redirect: true, fallback: "/masterpass" });
    }
    setPasskeyLoading(false);
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={() => {}} // Prevent closing by clicking outside
      PaperProps={{
        sx: {
          borderRadius: '32px',
          bgcolor: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(25px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundImage: 'none',
          width: '100%',
          maxWidth: '440px',
          overflow: 'visible'
        }
      }}
    >
      <Box sx={{ position: 'absolute', top: -32, left: '50%', transform: 'translateX(-50%)' }}>
        <Paper sx={{ 
          width: 64, 
          height: 64, 
          borderRadius: '18px', 
          bgcolor: 'primary.main', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0, 240, 255, 0.3)',
          color: 'black'
        }}>
          <LockIcon sx={{ fontSize: 32 }} />
        </Paper>
      </Box>

      <DialogTitle sx={{ textAlign: 'center', pt: 5, pb: 1 }}>
        {user && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {user.name || user.email}
            </Typography>
            {user.email && user.name && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {user.email}
              </Typography>
            )}
          </Box>
        )}
        <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>
          {isFirstTime ? "Set Master Password" : "Unlock Vault"}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
          {isFirstTime
            ? "Create a master password to encrypt your data"
            : "Enter your master password to access encrypted data"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {isFirstTime === null || (loading && !masterPassword) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block', ml: 1 }}>
                {isFirstTime ? "CREATE MASTER PASSWORD" : "MASTER PASSWORD"}
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder={isFirstTime ? "Create a strong master password" : "Enter your master password"}
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                required
                autoFocus
                variant="filled"
                onKeyDown={(e) => {
                  if ("getModifierState" in e && (e as React.KeyboardEvent).getModifierState("CapsLock")) {
                    setCapsLock(true);
                  } else {
                    setCapsLock(false);
                  }
                }}
                InputProps={{
                  disableUnderline: true,
                  sx: { borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.05)' },
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.secondary' }}>
                      {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  )
                }}
              />
              {capsLock && (
                <Typography variant="caption" sx={{ color: 'warning.main', mt: 1, display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                  <ErrorOutlineIcon sx={{ fontSize: 12 }} /> Caps Lock is ON
                </Typography>
              )}
            </Box>

            {isFirstTime && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block', ml: 1 }}>
                  CONFIRM MASTER PASSWORD
                </Typography>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your master password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  variant="filled"
                  onKeyDown={(e) => {
                    if ("getModifierState" in e && (e as React.KeyboardEvent).getModifierState("CapsLock")) {
                      setConfirmCapsLock(true);
                    } else {
                      setConfirmCapsLock(false);
                    }
                  }}
                  InputProps={{
                    disableUnderline: true,
                    sx: { borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.05)' },
                    endAdornment: (
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: 'text.secondary' }}>
                        {showConfirmPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    )
                  }}
                />
                {confirmCapsLock && (
                  <Typography variant="caption" sx={{ color: 'warning.main', mt: 1, display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                    <ErrorOutlineIcon sx={{ fontSize: 12 }} /> Caps Lock is ON
                  </Typography>
                )}
                {confirmPassword.length > 0 && (
                  <Typography variant="caption" sx={{ color: confirmPassword === masterPassword ? 'success.main' : 'error.main', mt: 1, display: 'block', ml: 1 }}>
                    {confirmPassword === masterPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </Typography>
                )}
              </Box>
            )}

            {isFirstTime && (
              <Paper sx={{ 
                p: 2, 
                borderRadius: '16px', 
                bgcolor: alpha(muiTheme.palette.info.main, 0.05), 
                border: `1px solid ${alpha(muiTheme.palette.info.main, 0.2)}`,
                display: 'flex',
                gap: 1.5
              }}>
                <ShieldIcon sx={{ fontSize: 20, color: muiTheme.palette.info.main, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: 'info.main', fontWeight: 500 }}>
                  <strong>Important:</strong> Your master password encrypts all your data locally. We cannot recover it if you forget it.
                </Typography>
              </Paper>
            )}

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading}
              sx={{ borderRadius: '16px', py: 1.5, fontWeight: 800, fontSize: '1rem' }}
            >
              {loading ? <CircularProgress size={24} /> : (isFirstTime ? "Set Master Password" : "Unlock Vault")}
            </Button>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ flexDirection: 'column', p: 4, pt: 0, gap: 2 }}>
        {!isFirstTime && hasPasskey && (
          <Button
            variant="outlined"
            fullWidth
            onClick={handlePasskeyUnlock}
            disabled={passkeyLoading || loading}
            startIcon={passkeyLoading ? <CircularProgress size={18} /> : <FingerprintIcon sx={{ fontSize: 18 }} />}
            sx={{ 
              borderRadius: '16px', 
              py: 1.5, 
              fontWeight: 700,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'primary.main'
              }
            }}
          >
            {passkeyLoading ? "Unlocking..." : "Unlock with Passkey"}
          </Button>
        )}

        <Button 
          variant="text" 
          size="small" 
          onClick={handleLogout}
          startIcon={<LogoutIcon sx={{ fontSize: 14 }} />}
          sx={{ color: 'text.secondary', fontWeight: 600 }}
        >
          Logout from Account
        </Button>
      </DialogActions>
    </Dialog>
  );
}
