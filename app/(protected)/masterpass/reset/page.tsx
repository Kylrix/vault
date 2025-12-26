"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  CircularProgress,
  alpha,
} from "@mui/material";
import { AlertTriangle, CheckCircle2, ArrowLeft, ShieldAlert } from "lucide-react";
import { useAppwrite } from "@/app/appwrite-provider";
import { resetMasterpassAndWipe } from "@/lib/appwrite";
import toast from "react-hot-toast";
import VaultGuard from "@/components/layout/VaultGuard";

export default function MasterpassResetPage() {
  const router = useRouter();
  const { user } = useAppwrite();
  const [step, setStep] = useState<"reset" | "done">("reset");
  const [loading, setLoading] = useState(false);

  // Redirect to masterpass if not logged in
  useEffect(() => {
    if (!user) {
      router.replace("/masterpass");
    }
  }, [user, router]);

  const handleReset = async () => {
    setLoading(true);
    try {
      if (user) {
        await resetMasterpassAndWipe(user.$id);
        setStep("done");
      }
    } catch {
      toast.error("Failed to reset master password");
    }
    setLoading(false);
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <VaultGuard>
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#000',
        p: 4
      }}>
        <Paper sx={{
          width: '100%',
          maxWidth: '450px',
          borderRadius: '28px',
          bgcolor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(25px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundImage: 'none',
          p: 4,
          textAlign: 'center'
        }}>
          <Box sx={{ 
            display: 'inline-flex', 
            p: 2, 
            borderRadius: '20px', 
            bgcolor: alpha(step === 'reset' ? '#FF4D4D' : '#00F5FF', 0.1),
            color: step === 'reset' ? '#FF4D4D' : '#00F5FF',
            mb: 3
          }}>
            {step === 'reset' ? <ShieldAlert size={40} /> : <CheckCircle2 size={40} />}
          </Box>

          <Typography variant="h4" sx={{ 
            fontWeight: 900, 
            letterSpacing: '-0.03em',
            fontFamily: 'var(--font-space-grotesk)',
            color: 'white',
            mb: 1
          }}>
            {step === 'reset' ? "Reset Master Password" : "Vault Wiped"}
          </Typography>

          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 4 }}>
            {step === "reset"
              ? "This action is irreversible and will wipe all your encrypted data."
              : "Your master password and all encrypted data have been successfully wiped."}
          </Typography>

          {step === "reset" && (
            <Stack spacing={2}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: '16px', 
                bgcolor: alpha('#FF4D4D', 0.05), 
                border: '1px solid rgba(255, 77, 77, 0.2)',
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start',
                textAlign: 'left'
              }}>
                <AlertTriangle size={20} color="#FF4D4D" style={{ flexShrink: 0, marginTop: '2px' }} />
                <Typography variant="caption" sx={{ color: '#FF4D4D', fontWeight: 500 }}>
                  WARNING: This will permanently delete all your credentials, notes, and folders. This cannot be undone.
                </Typography>
              </Paper>

              <Button
                fullWidth
                variant="contained"
                onClick={handleReset}
                disabled={loading}
                sx={{
                  py: 1.8,
                  borderRadius: '14px',
                  bgcolor: '#FF4D4D',
                  color: 'white',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: '#D32F2F',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 20px rgba(255, 77, 77, 0.3)'
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(255, 77, 77, 0.2)',
                    color: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Reset & Wipe Everything"}
              </Button>

              <Button
                fullWidth
                variant="text"
                startIcon={<ArrowLeft size={18} />}
                onClick={() => router.back()}
                disabled={loading}
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.05)' }
                }}
              >
                Cancel and Go Back
              </Button>
            </Stack>
          )}

          {step === "done" && (
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => router.replace("/masterpass")}
                sx={{
                  py: 1.8,
                  borderRadius: '14px',
                  bgcolor: '#00F5FF',
                  color: '#000',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: '#00D1DA',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 20px rgba(0, 245, 255, 0.3)'
                  }
                }}
              >
                Set New Master Password
              </Button>
            </Stack>
          )}
        </Paper>
      </Box>
    </VaultGuard>
  );
}
