"use client";

import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  Typography, 
  Tooltip,
  alpha 
} from '@mui/material';
import { 
  Send as SendIcon, 
  Description as NoteIcon
} from '@mui/icons-material';

export const QuickNote = () => {
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!note.trim()) return;
        setIsSaving(true);
        setTimeout(() => {
            setNote('');
            setIsSaving(false);
            alert('Note saved to WhisperrNote!');
        }, 800);
    };

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ 
                    p: 1, 
                    borderRadius: '10px', 
                    bgcolor: alpha('#00F5FF', 0.1),
                    color: '#00F5FF'
                }}>
                    <NoteIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: 'white' }}>
                    Quick Note
                </Typography>
            </Box>

            <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Send to Note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                variant="standard"
                InputProps={{
                    disableUnderline: true,
                    sx: { color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8125rem' }
                }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <IconButton onClick={handleSave} disabled={!note.trim()} size="small" sx={{ color: '#00F5FF' }}>
                    <SendIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Box>
        </Paper>
    );
};
