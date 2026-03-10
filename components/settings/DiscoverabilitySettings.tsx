'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Stack, 
    Switch, 
    Divider,
    CircularProgress,
    alpha,
    useTheme
} from '@mui/material';
import { User } from 'lucide-react';
import { useAppwriteVault } from '@/context/appwrite-context';
import { appwriteDatabases } from '@/lib/appwrite';
import toast from 'react-hot-toast';

// Constants match connect/lib/appwrite/config.ts
const CONNECT_DB_ID = 'chat';
const CONNECT_USERS_TABLE = 'users';

export const DiscoverabilitySettings = () => {
    const theme = useTheme();
    const { user } = useAppwriteVault();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    const loadProfile = useCallback(async () => {
        try {
            // Document ID in the users table is mapped to the Appwrite Account ID
            const p = await appwriteDatabases.getDocument(CONNECT_DB_ID, CONNECT_USERS_TABLE, user!.$id);
            setProfile(p);
        } catch (_e) {
            console.error("Failed to load profile from Connect", _e);
        } finally {
            setLoading(false);
        }
    }, [user?.$id]);

    useEffect(() => {
        if (user?.$id) {
            loadProfile();
        }
    }, [user?.$id, loadProfile]);

    const handleToggleDiscoverability = async (checked: boolean) => {
        if (!user?.$id || !profile) return;
        
        setSaving(true);
        try {
            // For Vault, we can add 'vault' to the appsActive or just use 'connect' as the baseline
            const appsActive = checked ? ['connect', 'vault'] : [];
            await appwriteDatabases.updateDocument(CONNECT_DB_ID, CONNECT_USERS_TABLE, user.$id, { 
                appsActive,
                updatedAt: new Date().toISOString()
            });
            setProfile({ ...profile, appsActive });
            toast.success(checked ? "Discovery enabled across Kylrix" : "Discovery disabled");
        } catch (_e) {
            toast.error("Failed to update discovery preference");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <CircularProgress size={24} />;
    if (!profile) return null;

    const isDiscoverable = profile?.appsActive?.includes('connect') || profile?.appsActive?.includes('vault');

    return (
        <Box>
            <Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.main', mb: 2, display: 'block', letterSpacing: '0.1em' }}>
                ECOSYSTEM DISCOVERABILITY
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
                            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--font-space-grotesk)' }}>Global Handle</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.6 }}>Allow others to find you by your universal username</Typography>
                        </Box>
                        <Switch 
                            checked={!!isDiscoverable} 
                            onChange={(e) => handleToggleDiscoverability(e.target.checked)}
                            disabled={saving}
                            color="primary" 
                        />
                    </Box>

                    <Divider sx={{ opacity: 0.05 }} />

                    <Box sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.03)', 
                        p: 3, 
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Box sx={{ 
                            p: 1.5, 
                            borderRadius: '12px', 
                            bgcolor: isDiscoverable ? alpha(theme.palette.primary.main, 0.1) : 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid',
                            borderColor: isDiscoverable ? alpha(theme.palette.primary.main, 0.2) : 'rgba(255, 255, 255, 0.05)',
                            display: 'flex'
                        }}>
                            <User size={24} color={isDiscoverable ? theme.palette.primary.main : "rgba(255, 255, 255, 0.2)"} />
                        </Box>
                        <Box>
                            <Typography sx={{ 
                                fontFamily: 'var(--font-jetbrains-mono)', 
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                opacity: isDiscoverable ? 1 : 0.4
                            }}>
                                @{profile.username}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.4, display: 'block', mt: 0.5 }}>
                                Identity linked to {profile.displayName || 'Universal User'}
                            </Typography>
                        </Box>
                        {isDiscoverable && (
                            <Box sx={{ 
                                ml: 'auto', 
                                px: 1.5, 
                                py: 0.5, 
                                borderRadius: '8px', 
                                bgcolor: alpha('#00F0FF', 0.1),
                                border: '1px solid',
                                borderColor: alpha('#00F0FF', 0.2)
                            }}>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#00F0FF', textTransform: 'uppercase' }}>
                                    Active
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};
