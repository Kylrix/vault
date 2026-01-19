"use client";

import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { QuickNote } from './QuickNote';
import { MiniChat } from './MiniChat';
import { VaultStatus } from '../contributions/VaultStatus';
import { FocusStatus } from './FocusStatus';

export const EcosystemWidgets = () => {
    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="overline" sx={{ 
                color: 'rgba(255, 255, 255, 0.3)', 
                fontWeight: 900, 
                letterSpacing: '0.2em',
                mb: 2,
                display: 'block'
            }}>
                Ecosystem Command Center
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <QuickNote />
                </Grid>
                <Grid item xs={12} md={6}>
                    <MiniChat />
                </Grid>
                <Grid item xs={12} md={6}>
                    <VaultStatus />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FocusStatus />
                </Grid>
            </Grid>
        </Box>
    );
};
