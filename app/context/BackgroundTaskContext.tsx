"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { ImportService, ImportProgress, ImportResult } from "@/utils/import/import-service";
import { FloatingContainer } from "@/components/ui/FloatingContainer";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BackgroundTaskContextType {
  startImport: (type: string, data: string, userId: string) => Promise<void>;
  isImporting: boolean;
}

const BackgroundTaskContext = createContext<BackgroundTaskContextType | undefined>(undefined);

export function useBackgroundTask() {
  const context = useContext(BackgroundTaskContext);
  if (!context) {
    throw new Error("useBackgroundTask must be used within a BackgroundTaskProvider");
  }
  return context;
}

export function BackgroundTaskProvider({ children }: { children: ReactNode }) {
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

  const startImport = useCallback(async (type: string, data: string, userId: string) => {
    console.log("[BackgroundTask] startImport called:", { type, dataLength: data.length, userId });
    
    setIsImporting(true);
    setShowWidget(true);
    setImportProgress(null);
    setImportResult(null);

    const service = new ImportService((progress) => {
      setImportProgress(progress);
    });

    try {
      let result: ImportResult;
      if (type === "bitwarden") {
        result = await service.importBitwardenData(data, userId);
      } else if (type === "whisperrkeep") {
        console.log("[BackgroundTask] Calling importWhisperrKeepData...");
        result = await service.importWhisperrKeepData(data, userId);
        console.log("[BackgroundTask] importWhisperrKeepData returned:", result.summary);
      } else {
        throw new Error("Unsupported import type");
      }
      setImportResult(result);
    } catch (error) {
      console.error("Import failed ungracefully:", error);
      // Ensure we set a result even on crash
      setImportResult({
        success: false,
        summary: { 
            foldersCreated: 0, 
            credentialsCreated: 0, 
            totpSecretsCreated: 0, 
            errors: 1, 
            skipped: 0,
            skippedExisting: 0
        },
        errors: [(error as Error).message || "Unknown error"],
        folderMapping: new Map(),
      });
    } finally {
      setIsImporting(false);
    }
  }, []);

  const closeWidget = () => {
    if (isImporting) {
        if (!confirm("Import is in progress. Are you sure you want to hide the widget? The import will continue in the background.")) {
            return;
        }
    }
    setShowWidget(false);
    // Reset state if finished
    if (!isImporting) {
        setImportProgress(null);
        setImportResult(null);
    }
  };

  return (
    <BackgroundTaskContext.Provider value={{ startImport, isImporting }}>
      {children}
      {showWidget && (
        <FloatingContainer
          title={isImporting ? "Importing Data..." : "Import Complete"}
          onClose={closeWidget}
          defaultPosition={
            typeof window !== "undefined"
              ? { x: window.innerWidth - 340, y: window.innerHeight - 400 }
              : { x: 20, y: 20 }
          }
        >
          <div className="space-y-4">
            {!importResult ? (
              // Progress View
              <div className="space-y-3">
                {importProgress ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{importProgress.message}</span>
                      <span className="text-muted-foreground">
                        {Math.round((importProgress.currentStep / importProgress.totalSteps) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${(importProgress.currentStep / importProgress.totalSteps) * 100}%` }}
                      />
                    </div>
                    {importProgress.itemsTotal > 0 && (
                        <div className="text-xs text-muted-foreground">
                            Processed {importProgress.itemsProcessed} of {importProgress.itemsTotal} items
                        </div>
                    )}
                    <div className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                        Please do not close this tab or disconnect your internet.
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Initializing import...
                  </div>
                )}
              </div>
            ) : (
              // Result View
              <div className="space-y-3">
                <div className={`flex items-center gap-2 p-3 rounded-md ${importResult.success ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {importResult.success ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                    <span className="font-medium">{importResult.success ? "Import Successful" : "Import Failed"}</span>
                </div>
                
                <div className="text-sm space-y-1">
                    <p>Credentials: {importResult.summary.credentialsCreated}</p>
                    <p>Folders: {importResult.summary.foldersCreated}</p>
                    <p>TOTP Secrets: {importResult.summary.totpSecretsCreated}</p>
                    {importResult.summary.skippedExisting > 0 && (
                        <p className="text-yellow-600 dark:text-yellow-400">Skipped (Existing): {importResult.summary.skippedExisting}</p>
                    )}
                    {importResult.summary.errors > 0 && (
                        <p className="text-destructive font-medium">Errors: {importResult.summary.errors}</p>
                    )}
                </div>

                {importResult.errors.length > 0 && (
                    <div className="text-xs text-destructive max-h-24 overflow-y-auto border border-destructive/20 rounded p-2">
                        {importResult.errors.map((e, i) => <div key={i}>• {e}</div>)}
                    </div>
                )}

                <Button className="w-full" size="sm" onClick={closeWidget}>
                    Close
                </Button>
              </div>
            )}
          </div>
        </FloatingContainer>
      )}
    </BackgroundTaskContext.Provider>
  );
}

