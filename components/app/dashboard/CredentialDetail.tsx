import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import {
  Copy,
  Eye,
  EyeOff,
  ArrowLeft,
  X,
  Globe,
  Calendar,
  Tag,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Credentials } from "@/types/appwrite";
import { useAI } from "@/app/context/AIContext";
import { useSudo } from "@/app/context/SudoContext";

export default function CredentialDetail({
  credential,
  onClose,
  isMobile,
}: {
  credential: Credentials;
  onClose: () => void;
  isMobile: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { requestSudo } = useSudo();

  const { analyze } = useAI();
  const [urlSafety, setUrlSafety] = useState<{ safe: boolean; riskLevel: string; reason: string } | null>(null);
  const [checkingUrl, setCheckingUrl] = useState(false);

  const checkUrlSafety = useCallback(async (url: string) => {
    setCheckingUrl(true);
    try {
      const result = (await analyze('URL_SAFETY', { url })) as { safe: boolean; riskLevel: string; reason: string };
      if (result) {
        setUrlSafety(result);
      }
    } catch (e) {
      console.error("Failed to check URL safety", e);
    } finally {
      setCheckingUrl(false);
    }
  }, [analyze]);

  // Check URL safety on mount if URL exists
  useEffect(() => {
    if (credential.url && !urlSafety && !checkingUrl) {
      checkUrlSafety(credential.url);
    }
  }, [credential.url, checkUrlSafety, checkingUrl, urlSafety]);

  // Animation effect - show component after mount
  const rootRef = useRef<HTMLDivElement | null>(null);

  // unified close that animates out then calls onClose
  const closeWithAnimation = useCallback(() => {
    // trigger CSS class hide
    setIsVisible(false);
    // if we have ref, also set transform to ensure swipe-out look
    if (rootRef.current) {
      rootRef.current.style.transition = "transform 300ms ease-out";
      rootRef.current.style.transform = "translateX(100%)";
    }
    setTimeout(onClose, 300); // Wait for animation
  }, [onClose]);

  useEffect(() => {
    if (!rootRef.current) return;

    // Desktop: outside-click to close
    const onDocumentPointerDown = (e: PointerEvent) => {
      if (isMobile) return;
      const node = rootRef.current!;
      if (!node) return;
      if (e.target instanceof Node && !node.contains(e.target)) {
        // clicked outside
        closeWithAnimation();
      }
    };

    document.addEventListener("pointerdown", onDocumentPointerDown);

    // Mobile: swipe to close (pointer gesture)
    if (isMobile) {
      let startX = 0;
      let currentX = 0;
      let startY = 0;
      let isTouching = false;
      let startTime = 0;

      const onPointerDown = (e: PointerEvent) => {
        if (e.pointerType === "mouse") return;
        isTouching = true;
        startX = e.clientX;
        startY = e.clientY;
        currentX = startX;
        startTime = Date.now();
        // (e.target as Element).setPointerCapture?.(e.pointerId);
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isTouching || !rootRef.current) return;
        currentX = e.clientX;
        const deltaX = currentX - startX;
        const deltaY = e.clientY - startY;
        // Ignore mostly-vertical moves
        if (Math.abs(deltaY) > Math.abs(deltaX)) return;
        // update transform
        rootRef.current.style.transition = "none";
        rootRef.current.style.transform = `translateX(${Math.max(0, deltaX)}px)`;
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!isTouching || !rootRef.current) return;
        isTouching = false;
        const endX = e.clientX;
        const deltaX = endX - startX;
        const elapsed = Date.now() - startTime;
        const velocity = deltaX / (elapsed || 1);
        rootRef.current.style.transition = "transform 200ms ease-out";
        if (deltaX > 80 || velocity > 0.5) {
          // animate off and close
          rootRef.current.style.transform = `translateX(100%)`;
          setTimeout(() => closeWithAnimation(), 190);
        } else {
          // snap back
          rootRef.current.style.transform = "";
        }
      };

      const node = rootRef.current;
      node.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);

      return () => {
        document.removeEventListener("pointerdown", onDocumentPointerDown);
        node.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };
    }

    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown);
    };
  }, [isMobile, closeWithAnimation]);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  if (!credential) return null;

  const handleCopy = (value: string, field: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };



  // Parse custom fields if they exist
  let customFields = [];
  try {
    if (credential.customFields) {
      customFields = JSON.parse(credential.customFields);
    }
  } catch {
    customFields = [];
  }

  // Format timestamps
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Get favicon URL
  const getFaviconUrl = (url: string) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(credential.url || "");

  return (
    <div
      ref={rootRef}
      className={`
        ${isMobile
          ? "fixed inset-0 z-50 bg-background"
          : "fixed top-0 right-0 h-full w-[440px] z-40 bg-background border-l-4 border-border rounded-l-[2rem]"
        }
        shadow-floating flex flex-col transition-transform duration-300 ease-out shadow-ceramic
        ${isVisible
          ? "translate-x-0"
          : isMobile
            ? "translate-x-full"
            : "translate-x-full"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center p-6 border-b-2 border-border bg-card/80 backdrop-blur-md rounded-tl-[2rem]">
        {isMobile ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={closeWithAnimation}
            className="mr-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-1 font-mono uppercase font-bold text-xs tracking-wider">Back</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={closeWithAnimation}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {!isMobile && (
          <span className="font-bold text-lg font-mono uppercase tracking-tight">Credential Details</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Info */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-card border-2 border-border flex items-center justify-center mr-4 overflow-hidden shadow-resting">
              {faviconUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={faviconUrl} alt="" className="w-9 h-9" />
              ) : (
                <span className="text-xl font-bold text-muted-foreground">
                  {credential.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {credential.name}
              </h1>
              {credential.url && (
                <div className="flex flex-col gap-1 items-start">
                  <a
                    href={credential.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm inline-flex items-center font-mono font-bold"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    {(() => {
                      try {
                        return new URL(credential.url).hostname;
                      } catch {
                        return credential.url;
                      }
                    })()}
                  </a>
                  {urlSafety && (
                    <div className={`text-[10px] px-2 py-0.5 rounded-sm flex items-center gap-1 border-2 font-mono font-bold uppercase ${urlSafety.safe
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}>
                      {urlSafety.safe ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                      <span>{urlSafety.riskLevel} Risk: {urlSafety.reason}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="p-6 space-y-6">
          {/* Username */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                Username / Email
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(credential.username, "username")}
                className="h-6 px-2"
              >
                <Copy className="h-3 w-3" />
                {copied === "username" && (
                  <span className="ml-1 text-xs">Copied!</span>
                )}
              </Button>
            </div>
            <div className="bg-card border-2 border-border rounded-xl px-4 py-3 font-mono text-sm shadow-inner shadow-ceramic select-all break-all">
              {credential.username || (
                <span className="text-muted-foreground italic">
                  VAULT_NULL
                </span>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                Password
              </label>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!showPassword) {
                      requestSudo({
                        onSuccess: () => setShowPassword(true)
                      });
                    } else {
                      setShowPassword(false);
                    }
                  }}
                  className="h-6 px-2"
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    requestSudo({
                      onSuccess: () => handleCopy(credential.password, "password")
                    });
                  }}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                  {copied === "password" && (
                    <span className="ml-1 text-xs">Copied!</span>
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-card border-2 border-border rounded-xl px-4 py-3 font-mono text-sm shadow-inner shadow-ceramic select-all">
              {credential.password ? (
                showPassword ? (
                  credential.password
                ) : (
                  "•".repeat(16)
                )
              ) : (
                <span className="text-muted-foreground italic">
                  VAULT_NULL
                </span>
              )}
            </div>
          </div>

          {/* Website URL */}
          {credential.url && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Website
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(credential.url || "", "url")}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                  {copied === "url" && (
                    <span className="ml-1 text-xs">Copied!</span>
                  )}
                </Button>
              </div>
              <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                <a
                  href={credential.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 break-all"
                >
                  {credential.url}
                </a>
              </div>
            </div>
          )}

          {/* Notes */}
          {credential.notes && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Notes
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(credential.notes || "", "notes")}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                  {copied === "notes" && (
                    <span className="ml-1 text-xs">Copied!</span>
                  )}
                </Button>
              </div>
              <div className="bg-muted rounded-lg px-3 py-2 text-sm whitespace-pre-wrap">
                {credential.notes}
              </div>
            </div>
          )}

          {/* Tags */}
          {credential.tags && credential.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {credential.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Custom Fields
              </label>
              <div className="space-y-3">
                {customFields.map(
                  (
                    field: { id?: string; label?: string; value?: string },
                    index: number,
                  ) => (
                    <div key={field.id || index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {field.label || `Field ${index + 1}`}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopy(field.value || "", `custom-${index}`)
                          }
                          className="h-5 px-1"
                        >
                          <Copy className="h-3 w-3" />
                          {copied === `custom-${index}` && (
                            <span className="ml-1 text-xs">Copied!</span>
                          )}
                        </Button>
                      </div>
                      <div className="bg-muted rounded px-2 py-1 font-mono text-xs select-all">
                        {field.value || (
                          <span className="text-muted-foreground italic">
                            Empty
                          </span>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-border">
            <label className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Information
            </label>
            <div className="space-y-2 text-xs text-muted-foreground">
              {credential.createdAt && (
                <div>Created: {formatDate(credential.createdAt)}</div>
              )}
              {credential.updatedAt && (
                <div>Updated: {formatDate(credential.updatedAt)}</div>
              )}
              {credential.folderId && (
                <div>Folder ID: {credential.folderId}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
