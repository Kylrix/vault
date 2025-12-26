"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppwrite } from "@/app/appwrite-provider";
import { MasterPassModal } from "@/components/overlays/MasterPassModal";
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper,
  alpha,
  useTheme
} from "@mui/material";
import { Shield } from "lucide-react";

export default function MasterPassPage() {
  const [showModal, setShowModal] = useState(false);
  const { user, isAuthReady, openIDMWindow } = useAppwrite();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (!isAuthReady) return;

    if (user) {
      setShowModal(true);
    }
  }, [user, isAuthReady]);

  const handleModalClose = () => {
    router.replace("/dashboard");
  };

  if (!isAuthReady) return null;

  if (!user) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3
      }}>
        <Container maxWidth="sm">
          <Paper sx={{
            p: 6,
            borderRadius: '32px',
            bgcolor: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3
          }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '24px', 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              mb: 1
            }}>
              <Shield size={40} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'var(--font-space-grotesk)', mb: 1 }}>
                Authentication Required
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Please log in to access your secure vault.
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                try {
                  openIDMWindow();
                } catch (err) {
                  console.error("Failed to open auth popup:", err);
                }
              }}
              sx={{ 
                borderRadius: '16px', 
                px: 6, 
                py: 2, 
                fontWeight: 800,
                fontSize: '1.1rem',
                textTransform: 'none'
              }}
            >
              Connect Account
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return <MasterPassModal isOpen={showModal} onClose={handleModalClose} />;
}
