"use client";

import { useEffect } from "react";
import { Box, Container, Stack, Typography, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAppwriteVault } from "@/context/appwrite-context";
import PasswordGenerator from "@/components/ui/PasswordGenerator";

export default function LandingPage() {
  const { user, openIDMWindow, isAuthenticating } = useAppwriteVault();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <Box sx={{ bgcolor: '#0A0908', minHeight: '100vh', color: 'white' }}>
      <Container maxWidth="md" sx={{ pt: 8, pb: 8 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
              Password Generator
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Generate strong, random passwords instantly. No account needed.
            </Typography>
          </Box>

          {/* Password Generator Component */}
          <PasswordGenerator />

          {/* Sign In Section */}
          {!user && (
            <Box sx={{ textAlign: 'center', pt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
                Ready to securely store your passwords?
              </Typography>
              <Button
                variant="contained"
                size="large"
                style={{ backgroundColor: '#10B981', color: '#000' }}
                endIcon={isAuthenticating ? <CircularProgress size={20} color="inherit" /> : undefined}
                onClick={() => {
                  try {
                    openIDMWindow();
                  } catch (err: unknown) {
                    alert(err instanceof Error ? err.message : "Failed to open authentication");
                  }
                }}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 800,
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Sign In
              </Button>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
