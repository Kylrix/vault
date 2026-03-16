"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  alpha 
} from '@mui/material';

import Logo from '@/components/common/Logo';
import { ecosystemSecurity } from '@/lib/ecosystem/security';
import { AppwriteService } from '@/lib/appwrite';
import { useAppwriteVault } from '@/context/appwrite-context';
import SudoModal from '@/components/overlays/SudoModal';
import { useEffect } from 'react';

/**
 * VaultStatus Contribution
 * Allows monitoring and locking the vault from anywhere in the ecosystem.
 */
export const VaultStatus = () => {
    const { user } = useAppwriteVault();
    const [isInitialized, setIsInitialized] = React.useState<boolean | null>(null);
    const [isLocked, setIsLocked] = useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [sudoIntent, setSudoIntent] = React.useState<"unlock" | "initialize" | "reset">("unlock");

    useEffect(() => {
        if (user?.$id) {
            AppwriteService.hasMasterpass(user.$id).then(setIsInitialized);
        }
        setIsLocked(!ecosystemSecurity.status.isUnlocked);
    }, [user?.$id, ecosystemSecurity.status.isUnlocked]);

    const handleAction = () => {
        if (isInitialized === false) {
            setSudoIntent("initialize");
        } else {
            setSudoIntent("unlock");
        }
        setIsModalOpen(true);
    };

    if (isInitialized === null) return null;

    return (
        <>
            <Paper
                elevation={0}
                onClick={handleAction}
                sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Logo app="vault" variant="icon" size={24} />
                        </Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: 'white' }}>
                            {isInitialized === false ? 'Setup Vault' : (isLocked ? 'Vault Locked' : 'Vault Active')}
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: '6px', 
                        bgcolor: isInitialized === false ? alpha('#F59E0B', 0.1) : (isLocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
                        border: `1px solid ${isInitialized === false ? alpha('#F59E0B', 0.2) : (isLocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)')}`
                    }}>
                        <Typography sx={{ 
                            fontSize: '10px', 
                            fontWeight: 900, 
                            color: isInitialized === false ? '#F59E0B' : (isLocked ? '#ef4444' : '#10b981'),
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {isInitialized === false ? 'Action Required' : (isLocked ? 'Locked' : 'Active')}
                        </Typography>
                    </Box>
                </Box>

                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
                    {isInitialized === false ? 'Initialize MasterPass to secure your Vault' : (isLocked ? 'Tap to unlock your ecosystem security' : 'Identity verified & monitoring active')}
                </Typography>
            </Paper>

            <SudoModal 
                isOpen={isModalOpen}
                intent={sudoIntent}
                onSuccess={() => {
                    setIsModalOpen(false);
                    if (user?.$id) AppwriteService.hasMasterpass(user.$id).then(setIsInitialized);
                }}
                onCancel={() => setIsModalOpen(false)}
            />
        </>
    );
};
