'use client';

import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Stack, 
  Switch, 
  FormControlLabel, 
  Divider,
  CircularProgress,
  alpha,
  useTheme,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from "@mui/material";
import { 
  Lock, 
  Shield, 
  Fingerprint,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useAppwriteVault } from "@/context/appwrite-context";
import { ecosystemSecurity } from "@/lib/ecosystem/security";
import { MasterPassModal } from "@/components/overlays/MasterPassModal";
import { PasskeySetup } from "@/components/overlays/passkeySetup";
import { DiscoverabilitySettings } from "@/components/settings/DiscoverabilitySettings";
import { masterPassCrypto } from "@/app/(protected)/masterpass/logic";
import { AppwriteService } from "@/lib/appwrite";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const muiTheme = useTheme();
  const { user } = useAppwriteVault();
  const [isUnlocked, setIsUnlocked] = useState(masterPassCrypto.isVaultUnlocked());
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [passkeySetupOpen, setPasskeySetupOpen] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isPinSet, setIsPinSet] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Passkey state
  const [passkeyEntries, setPasskeyEntries] = useState<any[]>([]);

  const loadPasskeys = useCallback(async () => {
    if (!user?.$id) return;
    try {
        const entries = await AppwriteService.listKeychainEntries(user.$id);
        const pkEntries = entries.filter(e => e.type === 'passkey').map(e => ({
            ...e,
            params: typeof e.params === 'string' ? JSON.parse(e.params) : e.params
        }));
        
        setPasskeyEntries(pkEntries);
    } catch (_e) {
        console.error("Failed to load passkeys", _e);
    }
  }, [user?.$id]);

  useEffect(() => {
    setIsPinSet(ecosystemSecurity.isPinSet());
    
    const interval = setInterval(() => {
      const currentUnlocked = masterPassCrypto.isVaultUnlocked();
      if (currentUnlocked !== isUnlocked) {
        setIsUnlocked(currentUnlocked);
      }
    }, 1000);
    
    if (user?.$id) {
        loadPasskeys();
    }

    return () => clearInterval(interval);
  }, [isUnlocked, user?.$id, loadPasskeys]);

  const handleRemovePasskey = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this passkey? This cannot be undone.")) return;
    try {
        await AppwriteService.deleteKeychainEntry(id);
        toast.success("Passkey removed");
        loadPasskeys();
    } catch (_e) {
        toast.error("Failed to remove passkey");
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("New PINs do not match");
      return;
    }

    if (isPinSet) {
        const verified = await ecosystemSecurity.verifyPin(oldPin);
        if (!verified) {
            toast.error("Current PIN is incorrect");
            return;
        }
    }

    if (!masterPassCrypto.isVaultUnlocked()) {
      setUnlockModalOpen(true);
      return;
    }

    await executePinSetup();
  };

  const executePinSetup = async () => {
    setLoading(true);
    try {
      const success = await ecosystemSecurity.setupPin(pin);
      if (success) {
        toast.success(isPinSet ? "PIN updated successfully!" : "Quick Unlock PIN set successfully!");
        setIsPinSet(true);
        setPin("");
        setConfirmPin("");
        setOldPin("");
      } else {
        toast.error("Failed to setup PIN. Please ensure vault is unlocked.");
      }
    } catch (_err: unknown) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleWipePin = () => {
    if (!masterPassCrypto.isVaultUnlocked()) {
      setUnlockModalOpen(true);
      return;
    }
    
    ecosystemSecurity.wipePin();
    setIsPinSet(false);
    setOldPin("");
    setPin("");
    setConfirmPin("");
    toast.success("PIN reset successful. You can now set a new one.");
  };

  const handleResetMasterPassword = async () => {
    if (!window.confirm("CRITICAL: This will PERMANENTLY delete all your Vault items, Connect DMs, and Passkeys. Your Notes and Flow tasks will be preserved. Are you absolutely sure?")) {
      return;
    }

    setLoading(true);
    try {
      const success = await (masterPassCrypto as any).resetMasterPassword();
      if (success) {
        toast.success("Vault Reset & Data Purge Complete");
        setIsUnlocked(false);
        // Force refresh to setup state
        window.location.reload();
      } else {
        toast.error("Reset failed. Please try again or contact support.");
      }
    } catch (_e) {
      toast.error("An error occurred during reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    masterPassCrypto.lockNow();
    setIsUnlocked(false);
    toast.success("Vault Locked");
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.03em' }}>
        Settings
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5, fontWeight: 500 }}>
        Manage your security preferences and application behavior.
      </Typography>

      <Stack spacing={4}>
        <DiscoverabilitySettings />
        {/* Security Section */}
        <Box>
          <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', mb: 2, display: 'block', letterSpacing: '0.1em' }}>
            SECURITY & ENCRYPTION
          </Typography>
          
          <Paper sx={{ 
            p: 4, 
            borderRadius: '32px', 
            bgcolor: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)'
          }}>
            <Stack spacing={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--font-space-grotesk)' }}>Vault Session</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.6 }}>Your current encryption status</Typography>
                </Box>
                <Button 
                  variant={isUnlocked ? "outlined" : "contained"}
                  onClick={() => isUnlocked ? handleLock() : setUnlockModalOpen(true)}
                  color={isUnlocked ? "inherit" : "primary"}
                  startIcon={isUnlocked ? <Lock size={18} /> : <Shield size={18} />}
                  sx={{ 
                    borderRadius: '14px', 
                    px: 3, 
                    py: 1, 
                    fontWeight: 700,
                    borderWidth: '2px',
                    '&:hover': { borderWidth: '2px' }
                  }}
                >
                  {isUnlocked ? "Lock Vault" : "Unlock Vault"}
                </Button>
              </Box>

              <Divider sx={{ opacity: 0.05 }} />

              {/* Passkey Management */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--font-space-grotesk)', mb: 1 }}>Passkeys</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.6 }}>
                            Use your device biometric or hardware security key to unlock your vault.
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<Fingerprint size={16} />}
                        onClick={() => setPasskeySetupOpen(true)}
                        sx={{ borderRadius: '10px' }}
                    >
                        Add Passkey
                    </Button>
                </Box>

                <List sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', p: 0, overflow: 'hidden' }}>
                {passkeyEntries.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', opacity: 0.5 }}>
                        <Typography variant="body2">No passkeys registered yet.</Typography>
                    </Box>
                ) : (
                    passkeyEntries.map((pk, idx) => (
                        <React.Fragment key={pk.$id}>
                            <ListItem 
                                secondaryAction={
                                    <IconButton edge="end" color="error" onClick={() => handleRemovePasskey(pk.$id)}>
                                        <Trash2 size={18} />
                                    </IconButton>
                                }
                            >
                                <ListItemIcon>
                                    <Fingerprint size={20} color={muiTheme.palette.primary.main} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary={pk.params?.name || `Passkey ${idx + 1}`}
                                    secondary={`Added on ${new Date(pk.$createdAt).toLocaleDateString()}`}
                                    primaryTypographyProps={{ fontWeight: 700 }}
                                />
                            </ListItem>
                            {idx < passkeyEntries.length - 1 && <Divider sx={{ opacity: 0.05 }} />}
                        </React.Fragment>
                    ))
                )}
                </List>

              </Box>

              <Divider sx={{ opacity: 0.05 }} />

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--font-space-grotesk)', mb: 1 }}>Quick Unlock (PIN)</Typography>
                <Typography variant="body2" sx={{ opacity: 0.6, mb: 4 }}>
                  {isPinSet 
                    ? "Your PIN is active. Use the form below to update it or reset if forgotten."
                    : "Enable a 4-digit PIN for instant access between sessions. PINs are wrapped by your Master Encryption Key."
                  }
                </Typography>

                <Box component="form" onSubmit={handleSetPin} sx={{ maxWidth: 360 }}>
                  <Stack spacing={2}>
                    {isPinSet && (
                        <TextField
                            fullWidth
                            type="password"
                            placeholder="Current PIN"
                            value={oldPin}
                            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            variant="filled"
                            inputProps={{ maxLength: 4, inputMode: 'numeric', style: { textAlign: 'center', fontWeight: 800, letterSpacing: '0.5em' } }}
                            InputProps={{ disableUnderline: true, sx: { borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
                        />
                    )}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        type="password"
                        placeholder={isPinSet ? "New PIN" : "Set PIN"}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        variant="filled"
                        inputProps={{ maxLength: 4, inputMode: 'numeric', style: { textAlign: 'center', fontWeight: 800, letterSpacing: '0.5em' } }}
                        InputProps={{ disableUnderline: true, sx: { borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
                      />
                      <TextField
                        fullWidth
                        type="password"
                        placeholder="Confirm"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        variant="filled"
                        inputProps={{ maxLength: 4, inputMode: 'numeric', style: { textAlign: 'center', fontWeight: 800, letterSpacing: '0.5em' } }}
                        InputProps={{ disableUnderline: true, sx: { borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
                      />
                    </Box>
                    <Button 
                      fullWidth
                      variant="contained" 
                      type="submit"
                      disabled={loading || pin.length !== 4 || pin !== confirmPin || (isPinSet && oldPin.length !== 4)}
                      sx={{ 
                        borderRadius: '16px', 
                        py: 1.8, 
                        fontWeight: 800,
                        bgcolor: isPinSet ? alpha('#00F0FF', 0.1) : 'primary.main',
                        color: isPinSet ? '#00F0FF' : 'black',
                        border: isPinSet ? '1px solid rgba(0, 240, 255, 0.3)' : 'none',
                        '&:hover': { bgcolor: isPinSet ? alpha('#00F0FF', 0.2) : alpha('#00F0FF', 0.8) }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : (isPinSet ? "Update Quick Unlock PIN" : "Setup Quick Unlock PIN")}
                    </Button>

                    {isPinSet && (
                        <Button 
                            fullWidth
                            variant="text"
                            color="error"
                            onClick={handleWipePin}
                            startIcon={<Trash2 size={16} />}
                            sx={{ textTransform: 'none', fontWeight: 700, mt: 1 }}
                        >
                            Forgot PIN? Reset with Password
                        </Button>
                    )}
                  </Stack>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Box>

        {/* Preferences Section */}
        <Box>
          <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', mb: 2, display: 'block', letterSpacing: '0.1em' }}>
            PREFERENCES
          </Typography>
          <Paper sx={{ 
            p: 4, 
            borderRadius: '32px', 
            bgcolor: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)'
          }}>
            <Stack spacing={1}>
              <FormControlLabel
                control={<Switch defaultChecked color="primary" />}
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Auto-Lock Session</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>Lock vault after 15 minutes of inactivity</Typography>
                  </Box>
                }
                sx={{ justifyContent: 'space-between', width: '100%', ml: 0, flexDirection: 'row-reverse', py: 1 }}
              />
              <Divider sx={{ opacity: 0.05 }} />
              <FormControlLabel
                control={<Switch color="primary" />}
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Clipboard Auto-Clear</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>Clear copied passwords after 30 seconds</Typography>
                  </Box>
                }
                sx={{ justifyContent: 'space-between', width: '100%', ml: 0, flexDirection: 'row-reverse', py: 1 }}
              />
            </Stack>
          </Paper>
        </Box>

        {/* Danger Zone */}
        <Box sx={{ pt: 2 }}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: '32px', 
            bgcolor: alpha('#FF4D4D', 0.02), 
            border: '1px solid rgba(255, 77, 77, 0.1)',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FF4D4D', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AlertTriangle size={20} /> Danger Zone
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.6, mb: 3 }}>
              Once you reset your master password, all currently stored local data will be wiped to protect your privacy.
            </Typography>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Trash2 size={18} />}
              onClick={handleResetMasterPassword}
              disabled={loading}
              sx={{ borderRadius: '14px', fontWeight: 700, borderColor: alpha('#FF4D4D', 0.3) }}
            >
              {loading ? "Wiping Data..." : "Reset Vault & Wipe Data"}
            </Button>
          </Paper>
        </Box>
      </Stack>

      <MasterPassModal 
        isOpen={unlockModalOpen}
        onClose={() => {
          setUnlockModalOpen(false);
        }}
      />

      <PasskeySetup 
        isOpen={passkeySetupOpen}
        onClose={() => setPasskeySetupOpen(false)}
        userId={user?.$id || ""}
        onSuccess={() => {
            setPasskeySetupOpen(false);
            loadPasskeys();
        }}
        trustUnlocked={true}
      />
    </Box>
  );
}
