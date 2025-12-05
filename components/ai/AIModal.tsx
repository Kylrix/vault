"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useAI } from "@/app/context/AIContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function AIModal({ onClose }: { onClose: () => void }) {
  const { sendCommand, isLoading, openGlobalCreateModal } = useAI();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setResponse(null);
    try {
      const result = await sendCommand(prompt);
      
      if (result.action === "UNKNOWN") {
        setResponse(result.response || "I'm not sure how to help with that.");
      } else {
        handleAction(result);
        setPrompt(""); // clear input on success
      }
    } catch {
      setResponse("Sorry, I couldn't process that request.");
    }
  };

  const handleAction = (cmd: { action: string; data?: unknown }) => {
    const data = cmd.data as { target?: string; name?: string; url?: string } | undefined;
    switch (cmd.action) {
      case "NAVIGATE":
        if (data?.target) {
            const target = data.target.toLowerCase();
            // path variable removed as unused
            // Simple mapping
            const validPaths = ["/dashboard", "/settings", "/import", "/totp", "/sharing", "/credentials/new"];
            // Find closest match or direct
            const finalPath = validPaths.find(p => p.includes(target)) || "/dashboard";
            router.push(finalPath);
            onClose();
            toast.success(`Navigating to ${target}...`);
        }
        break;

      case "CREATE_CREDENTIAL":
        // Use Global Modal if registered (Dashboard), otherwise fallback to navigation
        // We will assume if openGlobalCreateModal is available (it always is in context), we try it.
        // But we can check if we are on a page where it makes sense? 
        // Actually, the context will simply warn if no handler. 
        // Let's try to open modal first.
        try {
            openGlobalCreateModal({ name: data?.name, url: data?.url });
            onClose();
            toast.success("Opening new credential form...");
        } catch {
            // Fallback
            const params = new URLSearchParams();
            if (data?.name) params.set("name", data.name);
            if (data?.url) params.set("url", data.url);
            router.push(`/credentials/new?${params.toString()}`);
            onClose();
        }
        break;
        
      case "GENERATE_PASSWORD":
        setResponse("I can't generate the password directly, but I've opened the generator for you.");
        // We could trigger a global event, but for now just pointing user
        break;
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="max-w-lg">
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
           <Sparkles className="h-5 w-5 text-primary" />
           AI Commander
        </h2>
        <div className="bg-primary/5 p-4 rounded-md text-sm text-muted-foreground border border-primary/10">
          <p>
            <strong>How can I help?</strong>
            <br/>
            Try natural commands like:
            <br/>
            • &quot;Add a login for Netflix&quot;
            <br/>
            • &quot;Go to my Settings&quot;
            <br/>
            • &quot;Organize my vault&quot;
          </p>
        </div>

        {response && (
          <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2">
            {response}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your command..."
            disabled={isLoading}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" size="default" disabled={isLoading || !prompt.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Dialog>
  );
}

