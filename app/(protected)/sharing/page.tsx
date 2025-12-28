"use client";

import { Box, Typography, Paper, Stack, alpha } from "@mui/material";
import EngineeringIcon from "@mui/icons-material/Engineering";
import SecurityIcon from "@mui/icons-material/Security";
import VaultGuard from "@/components/layout/VaultGuard";

export default function SharingPage() {
  return (
    <VaultGuard>
      <Box sx={{ 
        width: '100%', 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 4
      }}>
        <Paper sx={{ 
          p: 6, 
          borderRadius: '32px', 
          bgcolor: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(25px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '600px',
          textAlign: 'center',
          backgroundImage: 'none'
        }}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '24px', 
              bgcolor: alpha('#00F5FF', 0.1), 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 2
            }}>
              <EngineeringIcon sx={{ fontSize: 40, color: "#00F5FF" }} />
            </Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 900, 
              fontFamily: 'var(--font-space-grotesk)',
              letterSpacing: '-0.02em'
            }}>
              Sharing Center
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6 }}>
              This feature is currently under development. We are building a secure, end-to-end encrypted way for you to share credentials with trusted contacts.
            </Typography>
            <Box sx={{ 
              p: 2, 
              borderRadius: '16px', 
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              width: '100%'
            }}>
              <SecurityIcon sx={{ fontSize: 20, color: "rgba(255, 255, 255, 0.4)" }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
                Security is our priority. Sharing will require MasterPass verification.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </VaultGuard>
  );
}
