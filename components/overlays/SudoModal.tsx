"use client";

import { useState } from "react";
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
import AppsIcon from "@mui/icons-material/Apps";
import { AppwriteService } from "@/lib/appwrite";
import { ecosystemSecurity } from "@/lib/ecosystem/security";
import { PasskeySetup } from "./passkeySetup";
import { useAppwriteVault } from "@/context/appwrite-context";
import toast from "react-hot-toast";
import { masterPassCrypto } from "@/app/(protected)/masterpass/logic";
import React from "react";

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
    const { user } = useAppwriteVault();
    const [password, setPassword] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasPasskey] = useState(false);
    const [hasPin] = useState(false);
    const [hasMasterpass] = useState<boolean | null>(null);
    const [mode, setMode] = useState<"passkey" | "password" | "pin" | "initialize" | null>(null);
    const [isDetecting] = useState(true);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasskeyIncentive, setShowPasskeyIncentive] = useState(false);

    const handlePasskeyVerify = () => {
        // Mock implementation since passkey auth logic seems incomplete or unused here
        toast.error("Passkey authentication not available here yet.");
    };

    const handleSuccessWithSync = React.useCallback(async () => {
        if (user?.$id) {
            try {
                // Sudo Hook: Ensure E2E Identity is created and published upon successful MasterPass unlock
                console.log("Synchronizing Identity...");
                await ecosystemSecurity.ensureE2EIdentity(user.$id);
            } catch (e) {
                console.error("Failed to sync identity on unlock", e);
            }
        }
        onSuccess();
    }, [user?.$id, onSuccess]);

    const handleInitializeMasterPass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.$id || !user?.email) return;
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            // 1. Generate new MEK
            const mek = await ecosystemSecurity.generateRandomMEK();
            
            // 2. Wrap it with the password
            const salt = crypto.getRandomValues(new Uint8Array(32));
            const wrappedKey = await ecosystemSecurity.wrapMEK(mek, password, salt);
            
            // 3. Create Keychain Entry
            await AppwriteService.createKeychainEntry({
                userId: user.$id,
                type: 'password',
                credentialId: null,
                wrappedKey: wrappedKey,
                salt: btoa(String.fromCharCode(...salt)),
                params: JSON.stringify({ iterations: 600000, hash: "SHA-256" }),
                isBackup: false
            } as any);

            // 4. Set Masterpass Flag on User Doc
            await AppwriteService.setMasterpassFlag(user.$id, user.email);
            
            // 5. Unlock MasterPassCrypto locally
            const rawMek = await crypto.subtle.exportKey("raw", mek);
            await masterPassCrypto.importKey(rawMek);
            await masterPassCrypto.unlockWithImportedKey();

            toast.success("MasterPass initialized successfully");
            handleSuccessWithSync();
        } catch (err) {
            console.error(err);
            toast.error("Initialization failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordVerify = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!user?.$id) return;

        if (hasMasterpass === false) {
            setMode("initialize");
            return;
        }

        setLoading(true);
        try {
            const isValid = await masterPassCrypto.unlock(password, user.$id);
            if (isValid) {
                if (!hasPasskey) {
                    setShowPasskeyIncentive(true);
                } else {
                    toast.success("Verified");
                    handleSuccessWithSync();
                }
            } else {
                toast.error("Incorrect master password");
            }
        } catch (_error: unknown) {
            console.error(_error);
            toast.error("Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePinVerify = async (pinValue: string) => {
        if (pinValue.length !== 4 || loading) return;

        setLoading(true);
        try {
            const success = await ecosystemSecurity.unlockWithPin(pinValue);
            if (success) {
                if (!hasPasskey) {
                    setShowPasskeyIncentive(true);
                } else {
                    toast.success("Verified via PIN");
                    handleSuccessWithSync();
                }
            } else {
                toast.error("Incorrect PIN");
                setPin("");
            }
        } catch (_error: unknown) {
            console.error(_error);
            toast.error("PIN verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        setPin(val);
        if (val.length === 4) {
            handlePinVerify(val);
        }
    };

    if (showPasskeyIncentive && user) {
        return (
            <PasskeySetup
                isOpen={true}
                onClose={() => {
                    setShowPasskeyIncentive(false);
                    handleSuccessWithSync();
                }}
                userId={user.$id}
                onSuccess={() => {
                    setShowPasskeyIncentive(false);
                    handleSuccessWithSync();
                }}
                trustUnlocked={true}
            />
        );
    }

    return (
        <Dialog
            open={isOpen}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            TransitionComponent={Fade}
            PaperProps={{
                sx: {
                    borderRadius: '32px',
                    bgcolor: 'rgba(5, 5, 5, 0.03)',
                    backdropFilter: 'blur(25px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundImage: 'none',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pt: 5, pb: 1, position: 'relative' }}>
                <IconButton
                    onClick={onCancel}
                    sx={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        color: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.05)' }
                    }}
                >
                    <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>

                <Box sx={{
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '20px',
                    bgcolor: alpha('#A855F7', 0.05),
                    color: '#A855F7',
                    border: '1px solid rgba(168, 85, 247, 0.1)',
                    mb: 3
                }}>
                    <ShieldIcon sx={{ fontSize: 36 }} />
                </Box>
                <Typography variant="h5" sx={{
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    fontFamily: 'var(--font-clash)',
                    color: 'white'
                }}>
                    Security Check
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', mt: 1, fontFamily: 'var(--font-satoshi)' }}>
                    Please verify your identity to continue
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pb: 4 }}>
                {isDetecting ? (
                    <Stack spacing={3} sx={{ mt: 4, mb: 2, alignItems: 'center' }}>
                        <CircularProgress size={48} sx={{ color: '#A855F7' }} />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, letterSpacing: '0.1em' }}>
                                PREPARING SECURITY CHECK...
                            </Typography>
                        </Box>
                    </Stack>
                ) : mode === "initialize" ? (
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <form onSubmit={handleInitializeMasterPass}>
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, mb: 1, display: 'block' }}>
                                        SET MASTER PASSWORD
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        placeholder="Create a strong password"
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
                                                '&.Mui-focused fieldset': { borderColor: '#A855F7' },
                                            },
                                            '& .MuiInputBase-input': { color: 'white' }
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, mb: 1, display: 'block' }}>
                                        CONFIRM PASSWORD
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        placeholder="Repeat your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <ShieldIcon sx={{ fontSize: 18, color: "rgba(255, 255, 255, 0.3)" }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '14px',
                                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: '#A855F7' },
                                            },
                                            '& .MuiInputBase-input': { color: 'white' }
                                        }}
                                    />
                                </Box>

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || !password || !confirmPassword}
                                    sx={{
                                        py: 1.8,
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
                                        color: '#FFFFFF',
                                        fontWeight: 800,
                                        fontFamily: 'var(--font-satoshi)',
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #9333EA 0%, #6B21A8 100%)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 8px 25px rgba(168, 85, 247, 0.25)'
                                        }
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : "Initialize Ecosystem Vault"}
                                </Button>
                                
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', textAlign: 'center', mt: 1 }}>
                                    Your MasterPass is the key to all your secure data. <br/> It cannot be recovered if lost.
                                </Typography>
                            </Stack>
                        </form>
                    </Stack>
                ) : mode === "pin" ? (
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, mb: 1, display: 'block', textAlign: 'center' }}>
                                ENTER 4-DIGIT PIN
                            </Typography>
                            <TextField
                                fullWidth
                                type="password"
                                placeholder="••••"
                                value={pin}
                                onChange={handlePinChange}
                                autoFocus
                                inputProps={{
                                    maxLength: 4,
                                    inputMode: 'numeric',
                                    style: { textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5em' }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AppsIcon sx={{ fontSize: 18, color: "rgba(255, 255, 255, 0.3)" }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '14px',
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                        '&.Mui-focused fieldset': { borderColor: '#A855F7' },
                                    },
                                    '& .MuiInputBase-input': { color: 'white' }
                                }}
                            />
                        </Box>

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
                ) : mode === "passkey" ? (
                    <Stack spacing={3} sx={{ mt: 2, alignItems: 'center' }}>
                        <Box
                            onClick={handlePasskeyVerify}
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                border: '2px dashed',
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                animation: 'none',
                                '&:hover': {
                                    borderColor: '#A855F7',
                                    bgcolor: alpha('#A855F7', 0.05)
                                },
                                '@keyframes pulse': {
                                    '0%': { boxShadow: '0 0 0 0 rgba(168, 85, 247, 0.4)' },
                                    '70%': { boxShadow: '0 0 0 15px rgba(168, 85, 247, 0)' },
                                    '100%': { boxShadow: '0 0 0 0 rgba(168, 85, 247, 0)' }
                                }
                            }}
                        >
                            <FingerprintIcon sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.4)' }} />
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
                            disabled={false}
                            sx={{
                                py: 1.5,
                                borderRadius: '14px',
                                bgcolor: '#A855F7',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                '&:hover': {
                                    bgcolor: alpha('#A855F7', 0.8),
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)'
                                },
                                '&.Mui-disabled': {
                                    bgcolor: alpha('#A855F7', 0.1),
                                    color: 'rgba(255, 255, 255, 0.3)'
                                }
                            }}
                        >
                            Verify with Passkey
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
                                                '&.Mui-focused fieldset': { borderColor: '#A855F7' },
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
                                        py: 1.8,
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
                                        color: '#FFFFFF',
                                        fontWeight: 800,
                                        fontFamily: 'var(--font-satoshi)',
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #9333EA 0%, #6B21A8 100%)',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 8px 25px rgba(168, 85, 247, 0.25)'
                                        }
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : "Confirm Security Entry"}
                                </Button>
                            </Stack>
                        </form>

                        {hasPasskey && (
                            <>
                                <Box sx={{ width: '100%', position: 'relative', py: 1.5 }}>
                                    <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', bgcolor: 'rgba(255, 255, 255, 0.05)' }} />
                                    <Typography variant="caption" sx={{
                                        position: 'relative',
                                        bgcolor: 'rgba(5, 5, 5, 1)',
                                        px: 2.5,
                                        mx: 'auto',
                                        display: 'table',
                                        color: 'rgba(255, 255, 255, 0.25)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.65rem'
                                    }}>
                                        Or
                                    </Typography>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="text"
                                    startIcon={<FingerprintIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => setMode("passkey")}
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        py: 1.5,
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        textTransform: 'none',
                                        fontFamily: 'var(--font-satoshi)',
                                        fontWeight: 600,
                                        '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.15)' }
                                    }}
                                >
                                    Use Passkey
                                </Button>
                            </>
                        )}

                        {hasPin && mode !== "pin" && (
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
                                    startIcon={<AppsIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => setMode("pin")}
                                    sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: 'white' } }}
                                >
                                    Use PIN
                                </Button>
                            </>
                        )}
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}
