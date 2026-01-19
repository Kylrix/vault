"use client";

import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  Typography, 
  Avatar,
  Badge,
  alpha 
} from '@mui/material';
import { 
  Send as SendIcon, 
} from '@mui/icons-material';

export const MiniChat = () => {
    const [message, setMessage] = useState('');
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#7c3aed', fontSize: '0.75rem', fontWeight: 800 }}>AR</Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: 'white' }} noWrap>Alex Rivera</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }} noWrap>Hey, did you see the new flow docs?</Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    placeholder="Reply via Connect..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                        sx: { color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8125rem', bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', px: 1 }
                    }}
                />
                <IconButton size="small" sx={{ color: '#7c3aed' }}><SendIcon sx={{ fontSize: 16 }} /></IconButton>
            </Box>
        </Paper>
    );
};
