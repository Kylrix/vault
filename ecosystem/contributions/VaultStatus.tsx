"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  alpha 
} from '@mui/material';
import { 
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';

/**
 * VaultStatus Contribution
 * Allows monitoring and locking the vault from anywhere in the ecosystem.
 */
export const VaultStatus = () => {
    const [isLocked, setIsLocked] = useState(false);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.3s ease',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                        p: 1, 
                        borderRadius: '10px', 
                        bgcolor: alpha('#F59E0B', 0.1),
                        color: '#F59E0B'
                    }}>
                        <ShieldIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: 'white' }}>
                        Vault Security
                    </Typography>
                </Box>
                <Box sx={{ 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: '6px', 
                    bgcolor: isLocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    border: `1px solid ${isLocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                }}>
                    <Typography sx={{ 
                        fontSize: '10px', 
                        fontWeight: 900, 
                        color: isLocked ? '#ef4444' : '#10b981',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {isLocked ? 'Locked' : 'Active'}
                    </Typography>
                </Box>
            </Box>

            <Button
                fullWidth
                variant="outlined"
                startIcon={isLocked ? <UnlockIcon sx={{ fontSize: 16 }} /> : <LockIcon sx={{ fontSize: 16 }} />}
                onClick={() => setIsLocked(!isLocked)}
                sx={{
                    borderRadius: '12px',
                    color: isLocked ? '#10b981' : '#F2F2F2',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    py: 1,
                    '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: isLocked ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                    }
                }}
            >
                {isLocked ? 'Unlock Vault' : 'Lock Vault Now'}
            </Button>
        </Paper>
    );
};
