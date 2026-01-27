"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  CircularProgress,
  Stack,
  Fade,
  alpha,
  InputAdornment,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import CloseIcon from "@mui/icons-material/Close";
import ShieldIcon from "@mui/icons-material/Shield";
import { masterPassCrypto } from "@/app/(protected)/masterpass/logic";
import { unlockWithPasskey } from "@/lib/passkey";
import { useAppwrite } from "@/app/appwrite-provider";
import { AppwriteService } from "@/lib/appwrite";
import toast from "react-hot-toast";

interface SudoModalProps {
    isOpen: boolean;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function SudoModal({
    isOpen,
    onSuccess,
    onCancel,
}: SudoModalProps) {
    const { user } = useAppwrite();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [passkeyLoading, setPasskeyLoading] = useState(false);
    const [hasPasskey, setHasPasskey] = useState(false);
    const [mode, setMode] = useState<"passkey" | "password">("password");

    // Check if user has passkey set up
    useEffect(() => {
        if (isOpen && user?.$id) {
            AppwriteService.hasPasskey(user.$id).then(setHasPasskey);
            // Reset state on open
            setPassword("");
            setLoading(false);
            setPasskeyLoading(false);
            setMode("password");
        }
    }, [isOpen, user]);

    // Auto-trigger passkey if available
    useEffect(() => {
        if (isOpen && hasPasskey) {
            setMode("passkey");
        }
    }, [isOpen, hasPasskey]);

    const handlePasswordVerify = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!user?.$id) return;
        if (!password) return;

        setLoading(true);
        try {
            const isValid = await masterPassCrypto.unlock(password, user.$id);
            if (isValid) {
                toast.success("Verified");
                onSuccess();
            } else {
                toast.error("Incorrect master password");
            }
        } catch (error) {
            console.error(error);
            toast.error("Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePasskeyVerify = async () => {
        if (!user?.$id) return;
        setPasskeyLoading(true);
        try {
            const success = await unlockWithPasskey(user.$id);
            if (success) {
                onSuccess();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setPasskeyLoading(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            TransitionComponent={Fade}
            PaperProps={{
                sx: {
                    borderRadius: '28px',
                    bgcolor: 'rgba(10, 10, 10, 0.95)',
                    backdropFilter: 'blur(25px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundImage: 'none',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 1, position: 'relative' }}>
                <IconButton
                    onClick={onCancel}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.05)' }
                    }}
                >
                    <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>

                <Box sx={{ 
                    display: 'inline-flex', 
                    p: 1.5, 
                    borderRadius: '16px', 
                    bgcolor: alpha('#00F5FF', 0.1),
                    color: '#00F5FF',
                    mb: 2
                }}>
                    <ShieldIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h5" sx={{ 
                    fontWeight: 900, 
                    letterSpacing: '-0.03em',
                    fontFamily: 'var(--font-space-grotesk)',
                    color: 'white'
                }}>
                    Security Check
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1 }}>
                    Please verify your identity to continue
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pb: 4 }}>
                {mode === "passkey" ? (
                    <Stack spacing={3} sx={{ mt: 2, alignItems: 'center' }}>
                        <Box
                            onClick={handlePasskeyVerify}
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                border: '2px dashed',
                                borderColor: passkeyLoading ? '#00F5FF' : 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                animation: passkeyLoading ? 'pulse 2s infinite' : 'none',
                                '&:hover': {
                                    borderColor: '#00F5FF',
                                    bgcolor: alpha('#00F5FF', 0.05)
                                },
                                '@keyframes pulse': {
                                    '0%': { boxShadow: '0 0 0 0 rgba(0, 245, 255, 0.4)' },
                                    '70%': { boxShadow: '0 0 0 15px rgba(0, 245, 255, 0)' },
                                    '100%': { boxShadow: '0 0 0 0 rgba(0, 245, 255, 0)' }
                                }
                            }}
                        >
                            <FingerprintIcon sx={{ fontSize: 40, color: passkeyLoading ? '#00F5FF' : 'rgba(255, 255, 255, 0.4)' }} />
                        </Box>
                        
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                Use Face ID / Touch ID
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                Authenticate with your device security
                            </Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handlePasskeyVerify}
                            disabled={passkeyLoading}
                            sx={{
                                py: 1.5,
                                borderRadius: '14px',
                                bgcolor: '#00F5FF',
                                color: '#000',
                                fontWeight: 700,
                                '&:hover': {
                                    bgcolor: '#00D1DA',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 8px 20px rgba(0, 245, 255, 0.3)'
                                }
                            }}
                        >
                            {passkeyLoading ? <CircularProgress size={24} color="inherit" /> : "Verify with Passkey"}
                        </Button>

                        <Box sx={{ width: '100%', position: 'relative', py: 1 }}>
                            <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                            <Typography variant="caption" sx={{ 
                                position: 'relative', 
                                bgcolor: 'rgba(10, 10, 10, 1)', 
                                px: 2, 
                                mx: 'auto', 
                                display: 'table',
                                color: 'rgba(255, 255, 255, 0.3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Or
                            </Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="text"
                            size="small"
                            onClick={() => setMode("password")}
                            sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: 'white' } }}
                        >
                            Use Master Password
                        </Button>
                    </Stack>
                ) : (
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <form onSubmit={handlePasswordVerify}>
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, mb: 1, display: 'block' }}>
                                        MASTER PASSWORD
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        placeholder="Enter your master password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon sx={{ fontSize: 18, color: "rgba(255, 255, 255, 0.3)" }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '14px',
                                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: '#00F5FF' },
                                            },
                                            '& .MuiInputBase-input': { color: 'white' }
                                        }}
                                    />
                                </Box>

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || !password}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: '14px',
                                        bgcolor: '#00F5FF',
                                        color: '#000',
                                        fontWeight: 700,
                                        '&:hover': {
                                            bgcolor: '#00D1DA',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 8px 20px rgba(0, 245, 255, 0.3)'
                                        }
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : "Confirm Password"}
                                </Button>
                            </Stack>
                        </form>

                        {hasPasskey && (
                            <>
                                <Box sx={{ width: '100%', position: 'relative', py: 1 }}>
                                    <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                                    <Typography variant="caption" sx={{ 
                                        position: 'relative', 
                                        bgcolor: 'rgba(10, 10, 10, 1)', 
                                        px: 2, 
                                        mx: 'auto', 
                                        display: 'table',
                                        color: 'rgba(255, 255, 255, 0.3)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}>
                                        Or
                                    </Typography>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="text"
                                    startIcon={<FingerprintIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => setMode("passkey")}
                                    sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: 'white' } }}
                                >
                                    Use Passkey
                                </Button>
                            </>
                        )}
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}
