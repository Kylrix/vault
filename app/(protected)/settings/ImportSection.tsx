"use client";
import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  CircularProgress,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { AppwriteService } from "@/lib/appwrite";
import { ImportService } from "@/utils/import/import-service";
import { useAppwrite } from "@/app/appwrite-provider";

function parseBitwardenCSV() {
  // TODO: Implement Bitwarden CSV parsing
  return [];
}
function parseZohoCSV() {
  // TODO: Implement Zoho Vault CSV parsing
  return [];
}
function parseProtonCSV() {
  // TODO: Implement Proton Pass CSV parsing
  return [];
}
function parseJSON(json: string) {
  try {
    const data = JSON.parse(json);
    return Array.isArray(data) ? data : [data];
  } catch {
    return [];
  }
}

export default function ImportSection() {
  const { user } = useAppwrite();
  type ImportVendor = "bitwarden" | "zoho" | "proton" | "json" | "whisperrkeep";
  const [importType, setImportType] = useState<ImportVendor>("bitwarden");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
    setSuccess(null);
  };

  const handleImport = async () => {
    if (!user) {
      setError("You must be logged in.");
      return;
    }
    if (!file) {
      setError("Please select a file to import.");
      return;
    }
    setImporting(true);
    setError(null);
    setSuccess(null);
    try {
      const text = await file.text();
      type Imported = Record<string, unknown>;
      let credentials: Imported[] = [];
      if (importType === "bitwarden") credentials = parseBitwardenCSV();
      else if (importType === "zoho") credentials = parseZohoCSV();
      else if (importType === "proton") credentials = parseProtonCSV();
      else if (importType === "json") credentials = parseJSON(text);
      if (!credentials.length && importType !== "bitwarden" && importType !== "whisperrkeep") throw new Error("No credentials found in file.");
      
      credentials = credentials.map((c) => ({ ...c, userId: user.$id }));
      
      if (
        importType === "bitwarden" &&
        file.name.toLowerCase().endsWith(".json")
      ) {
        const service = new ImportService();
        const result = await service.importBitwardenData(text, user.$id);
        if (!result.success) {
          setError(result.errors.join("\n") || "Import encountered issues.");
        } else {
          setSuccess(
            `Imported ${result.summary.credentialsCreated} credentials, ${result.summary.totpSecretsCreated} TOTP secrets, created ${result.summary.foldersCreated} folders. Skipped: ${result.summary.skipped}. Skipped (Existing): ${result.summary.skippedExisting}.`,
          );
        }
        setImporting(false);
        return;
      }
      
      if (importType === "whisperrkeep") {
         const service = new ImportService();
         const result = await service.importWhisperrKeepData(text, user.$id);
         if (!result.success && result.errors.length > 0) {
            setError(result.errors.join("\n") || "Import failed.");
         } else {
            setSuccess(`Successfully restored ${result.summary.credentialsCreated} credentials, ${result.summary.totpSecretsCreated} secrets, and ${result.summary.foldersCreated} folders. Skipped (Existing): ${result.summary.skippedExisting}.`);
         }
         setImporting(false);
         return;
      }

      await AppwriteService.bulkCreateCredentials(
        credentials as unknown as Parameters<
          typeof AppwriteService.bulkCreateCredentials
        >[0],
      );
      setSuccess(`Successfully imported ${credentials.length} credentials!`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Import failed.";
      setError(msg);
    }
    setImporting(false);
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Select Vendor
        </Typography>
        <ToggleButtonGroup
          value={importType}
          exclusive
          onChange={(_, val) => val && setImportType(val)}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            '& .MuiToggleButton-root': {
              border: '1px solid rgba(255, 255, 255, 0.1) !important',
              borderRadius: '12px !important',
              color: 'rgba(255, 255, 255, 0.5)',
              px: 2,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-selected': {
                bgcolor: alpha('#00F5FF', 0.1),
                color: '#00F5FF',
                borderColor: '#00F5FF !important',
              },
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              }
            }
          }}
        >
          <ToggleButton value="bitwarden">Bitwarden</ToggleButton>
          <ToggleButton value="whisperrkeep">WhisperrNote Backup</ToggleButton>
          <ToggleButton value="zoho">Zoho Vault</ToggleButton>
          <ToggleButton value="proton">Proton Pass</ToggleButton>
          <ToggleButton value="json">JSON</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Select File
        </Typography>
        <Box
          component="label"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            borderRadius: '20px',
            border: '2px dashed',
            borderColor: file ? '#00F5FF' : 'rgba(255, 255, 255, 0.1)',
            bgcolor: file ? alpha('#00F5FF', 0.02) : 'rgba(255, 255, 255, 0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#00F5FF',
              bgcolor: alpha('#00F5FF', 0.05),
            }
          }}
        >
          <input
            type="file"
            hidden
            accept={importType === "json" || importType === "whisperrkeep" || (importType === "bitwarden" && !file) ? ".json,.csv" : ".csv"}
            onChange={handleFileChange}
          />
          {file ? (
            <>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha('#00F5FF', 0.1), color: '#00F5FF', mb: 2 }}>
                {file.name.endsWith('.json') ? <FileJson size={32} /> : <FileSpreadsheet size={32} />}
              </Box>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                {file.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                {(file.size / 1024).toFixed(2)} KB • Click to change
              </Typography>
            </>
          ) : (
            <>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }}>
                <Upload size={32} />
              </Box>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                Click to upload file
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                {importType === "json" || importType === "whisperrkeep" ? "JSON files supported" : "CSV files supported"}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      <Button
        fullWidth
        variant="contained"
        onClick={handleImport}
        disabled={importing || !file}
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
          },
          '&.Mui-disabled': {
            bgcolor: 'rgba(0, 245, 255, 0.1)',
            color: 'rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        {importing ? <CircularProgress size={24} color="inherit" /> : "Start Import"}
      </Button>

      {error && (
        <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha('#FF4D4D', 0.05), border: '1px solid rgba(255, 77, 77, 0.2)', display: 'flex', gap: 2, alignItems: 'center' }}>
          <AlertCircle size={20} color="#FF4D4D" />
          <Typography variant="body2" sx={{ color: '#FF4D4D' }}>{error}</Typography>
        </Paper>
      )}

      {success && (
        <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: alpha('#00F5FF', 0.05), border: '1px solid rgba(0, 245, 255, 0.2)', display: 'flex', gap: 2, alignItems: 'center' }}>
          <CheckCircle2 size={20} color="#00F5FF" />
          <Typography variant="body2" sx={{ color: '#00F5FF' }}>{success}</Typography>
        </Paper>
      )}

      <Box sx={{ p: 3, borderRadius: '20px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Info size={18} color="#00F5FF" />
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
            Supported Formats
          </Typography>
        </Stack>
        <List dense sx={{ p: 0 }}>
          {[
            { label: 'WhisperrNote', desc: 'Restore from a previous export (.json)' },
            { label: 'Bitwarden', desc: 'Tools > Export Vault > .json' },
            { label: 'Zoho Vault', desc: 'Export as .csv' },
            { label: 'Proton Pass', desc: 'Export as .csv' },
            { label: 'JSON', desc: 'Custom format (array of credentials)' },
          ].map((item, idx) => (
            <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
              <ListItemText 
                primary={item.label} 
                secondary={item.desc}
                primaryTypographyProps={{ variant: 'caption', sx: { color: '#00F5FF', fontWeight: 700 } }}
                secondaryTypographyProps={{ variant: 'caption', sx: { color: 'rgba(255, 255, 255, 0.4)' } }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Stack>
  );
}
