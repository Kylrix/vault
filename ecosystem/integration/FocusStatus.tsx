"use client";

import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Paper, 
  Typography, 
  LinearProgress,
  alpha 
} from '@mui/material';
import { 
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

export const FocusStatus = () => {
    const [isActive, setIsActive] = useState(false);
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }}>
                        <TimerIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: 'white' }}>Flow Timer</Typography>
                </Box>
                <IconButton size="small" onClick={() => setIsActive(!isActive)} sx={{ color: '#3b82f6' }}>
                    {isActive ? <PauseIcon sx={{ fontSize: 18 }} /> : <PlayIcon sx={{ fontSize: 18 }} />}
                </IconButton>
            </Box>
            <LinearProgress variant="determinate" value={45} sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6' } }} />
        </Paper>
    );
};
