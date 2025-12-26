"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Slider,
  TextField,
  IconButton,
  Stack,
  Switch,
  FormControlLabel,
  Paper,
  alpha,
  CircularProgress,
  List,
  ListItem,
  Tooltip,
} from "@mui/material";
import {
  Copy,
  RefreshCw,
  Clock,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { generateRandomPassword } from "@/utils/password";
import { useAI } from "@/app/context/AIContext";
import toast from "react-hot-toast";

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState(() => generateRandomPassword(16));
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<{ value: string; ts: number }[]>([]);
  
  const { analyze, isLoading: isAnalyzing } = useAI();

  const handleAnalyze = async () => {
    if (!password) return;
    const toastId = toast.loading("Analyzing password strength...");
    try {
        const result = (await analyze('PASSWORD_AUDIT', password)) as { score: number; timeToCrack: string; feedback: string };
        if (result) {
            toast.dismiss(toastId);
            toast(() => (
                <Box sx={{ color: 'white' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>Security Score: {result.score}/10</Typography>
                    <Typography variant="body2">Crack Time: {result.timeToCrack}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 0.5, display: 'block' }}>{result.feedback}</Typography>
                </Box>
            ), { 
              duration: 5000, 
              icon: <ShieldCheck size={20} color="#00F5FF" />,
              style: {
                background: 'rgba(10, 10, 10, 0.95)',
                backdropFilter: 'blur(25px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                color: 'white'
              }
            });
        }
    } catch {
        toast.error("Analysis failed", { id: toastId });
    }
  };

  useEffect(() => {
    const newPassword = generateRandomPassword(length);
    setPassword(newPassword);
  }, [length]);

  const handleGenerate = () => {
    const newPassword = generateRandomPassword(length);
    setPassword(newPassword);
    setCopied(false);
    setHistory((prev) => {
      const next = [{ value: newPassword, ts: Date.now() }, ...prev];
      return next.slice(0, 20);
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
    toast.success("Copied to clipboard", {
      style: {
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: 'white'
      }
    });
  };

  const handleLengthChange = (_: any, val: number | number[]) => {
    setLength(val as number);
  };

  return (
    <Paper sx={{ 
      p: 3, 
      width: '100%', 
      maxWidth: 400, 
      bgcolor: 'rgba(10, 10, 10, 0.95)', 
      backdropFilter: 'blur(25px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      backgroundImage: 'none'
    }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Password Generator
          </Typography>
          <FormControlLabel
            control={
              <Switch 
                size="small" 
                checked={showHistory} 
                onChange={(e) => setShowHistory(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#00F5FF' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#00F5FF' }
                }}
              />
            }
            label={<Typography variant="caption" sx={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)' }}>History</Typography>}
            labelPlacement="start"
          />
        </Box>

        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            value={password}
            variant="outlined"
            InputProps={{
              readOnly: true,
              sx: {
                fontFamily: 'var(--font-mono)',
                fontSize: '1.1rem',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#00F5FF' },
                pr: 10
              }
            }}
          />
          <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <Tooltip title="Copy">
              <IconButton onClick={handleCopy} size="small" sx={{ color: copied ? '#00F5FF' : 'rgba(255, 255, 255, 0.4)' }}>
                <Copy size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Regenerate">
              <IconButton onClick={handleGenerate} size="small" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                <RefreshCw size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)' }}>LENGTH</Typography>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#00F5FF' }}>{length} characters</Typography>
          </Box>
          <Slider
            value={length}
            min={8}
            max={64}
            onChange={handleLengthChange}
            sx={{
              color: '#00F5FF',
              height: 6,
              '& .MuiSlider-thumb': {
                width: 18,
                height: 18,
                bgcolor: '#00F5FF',
                '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 8px rgba(0, 245, 255, 0.16)' }
              },
              '& .MuiSlider-track': { border: 'none' },
              '& .MuiSlider-rail': { opacity: 0.1, bgcolor: 'white' }
            }}
          />
        </Box>

        <Stack spacing={1.5}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleGenerate}
            sx={{
              bgcolor: '#00F5FF',
              color: '#000',
              fontWeight: 800,
              borderRadius: '14px',
              py: 1.5,
              '&:hover': { bgcolor: '#00D1DA' }
            }}
          >
            Generate Password
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            startIcon={isAnalyzing ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={16} />}
            sx={{
              borderColor: alpha('#00F5FF', 0.2),
              color: '#00F5FF',
              fontWeight: 700,
              borderRadius: '14px',
              py: 1.2,
              '&:hover': { borderColor: '#00F5FF', bgcolor: alpha('#00F5FF', 0.05) }
            }}
          >
            {isAnalyzing ? "Analyzing..." : "Check Strength with AI"}
          </Button>
        </Stack>

        {showHistory && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Clock size={14} color="rgba(255, 255, 255, 0.4)" />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)' }}>RECENT PASSWORDS</Typography>
            </Stack>
            {history.length === 0 ? (
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontStyle: 'italic' }}>No history yet.</Typography>
            ) : (
              <List sx={{ p: 0, maxHeight: 160, overflowY: 'auto' }}>
                {history.map((item, i) => (
                  <ListItem
                    key={i}
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: '10px',
                      mb: 0.5,
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                    }}
                  >
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.65rem' }}>
                        {new Date(item.ts).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        navigator.clipboard.writeText(item.value);
                        toast.success("Copied from history");
                      }}
                      sx={{ color: 'rgba(255, 255, 255, 0.3)' }}
                    >
                      <Copy size={14} />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
