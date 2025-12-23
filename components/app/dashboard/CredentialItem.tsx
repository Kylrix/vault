import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Copy, Edit, Trash2 } from "lucide-react";
import clsx from "clsx";

const MENU_EVENT = "credential-menu-open";

import type { Credentials } from "@/types/appwrite.d";
function MobileCopyMenu({
  credential,
  onCopy,
}: {
  credential: Credentials;
  onCopy: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const idRef = useRef<string>(
    `menu-${Math.random().toString(36).slice(2, 9)}`,
  );

  useEffect(() => {
    function onMenuEvent(e: Event) {
      const detail = (e as CustomEvent).detail as { id: string } | undefined;
      if (!detail) return;
      if (detail.id !== idRef.current) setOpen(false);
    }
    window.addEventListener(MENU_EVENT, onMenuEvent as EventListener);
    return () =>
      window.removeEventListener(MENU_EVENT, onMenuEvent as EventListener);
  }, []);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      setMenuStyle({ top: rect.bottom + 4, left: rect.left });
    };

    function handleDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || btnRef.current?.contains(target))
        return;
      setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function handleScroll() {
      updatePosition();
    }

    updatePosition();

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleEsc);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    window.dispatchEvent(
      new CustomEvent(MENU_EVENT, { detail: { id: idRef.current } }),
    );

    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((o) => !o);
    if (!open)
      window.dispatchEvent(
        new CustomEvent(MENU_EVENT, { detail: { id: idRef.current } }),
      );
  };

  return (
    <div className="relative">
      <Button
        ref={btnRef}
        variant="ghost"
        size="sm"
        className="rounded-full h-10 w-10"
        onClick={toggle}
        title="Copy"
      >
        <Copy className="h-6 w-6 text-primary" />
      </Button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[99999] bg-card border-2 border-border rounded-xl shadow-resting py-2 w-44 font-mono shadow-ceramic"
            style={{ top: menuStyle?.top ?? 0, left: menuStyle?.left ?? 0 }}
          >
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors uppercase font-bold"
              onClick={(e) => {
                e.stopPropagation();
                onCopy(credential.username);
                setOpen(false);
              }}
            >
              Copy username
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                onCopy(credential.password);
                setOpen(false);
              }}
            >
              Copy password
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

function MobileMoreMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const idRef = useRef<string>(
    `menu-${Math.random().toString(36).slice(2, 9)}`,
  );

  useEffect(() => {
    function onMenuEvent(e: Event) {
      const detail = (e as CustomEvent).detail as { id: string } | undefined;
      if (!detail) return;
      if (detail.id !== idRef.current) setOpen(false);
    }
    window.addEventListener(MENU_EVENT, onMenuEvent as EventListener);
    return () =>
      window.removeEventListener(MENU_EVENT, onMenuEvent as EventListener);
  }, []);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      setMenuStyle({ top: rect.bottom + 4, left: rect.left });
    };

    function handleDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || btnRef.current?.contains(target))
        return;
      setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function handleScroll() {
      updatePosition();
    }

    updatePosition();

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleEsc);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    window.dispatchEvent(
      new CustomEvent(MENU_EVENT, { detail: { id: idRef.current } }),
    );

    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((o) => !o);
    if (!open)
      window.dispatchEvent(
        new CustomEvent(MENU_EVENT, { detail: { id: idRef.current } }),
      );
  };

  return (
    <div className="relative">
      <Button
        ref={btnRef}
        variant="ghost"
        size="sm"
        className="rounded-full h-10 w-10"
        onClick={toggle}
        title="More"
      >
        <svg
          className="h-6 w-6 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </Button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[99999] bg-card border-2 border-border rounded-xl shadow-resting py-2 w-36 font-mono shadow-ceramic"
            style={{ top: menuStyle?.top ?? 0, left: menuStyle?.left ?? 0 }}
          >
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors uppercase font-bold"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                setOpen(false);
              }}
            >
              Edit
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setOpen(false);
              }}
            >
              Delete
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default function CredentialItem({
  credential,
  onCopy,
  isDesktop,
  onEdit,
  onDelete,
  onClick,
}: {
  credential: Credentials;
  onCopy: (value: string) => void;
  isDesktop: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (value: string) => {
    onCopy(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const getFaviconUrl = (url: string | null) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(credential.url);

  return (
    <div
      className={clsx(
        "rounded-3xl overflow-visible mb-3 backdrop-blur-md border-2 border-border shadow-resting cursor-pointer",
        "bg-card/80 transition-all duration-300 hover:shadow-hover hover:-translate-y-1 active:translate-y-0 text-foreground shadow-ceramic",
      )}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      onKeyDown={
        onClick
          ? (e) => {
            if (e.key === "Enter" || e.key === " ") onClick();
          }
          : undefined
      }
    >
      <div className="flex items-center px-4 py-4">
        <div className="flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border shadow-resting">
            {faviconUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={faviconUrl} alt="" className="w-6 h-6" />
            ) : (
              <span className="text-primary font-bold text-sm">
                {credential.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 ml-4 min-w-0">
          <div className="font-bold text-foreground font-mono truncate uppercase tracking-tight">
            {credential.name}
          </div>
          <div className="text-[13px] text-muted-foreground truncate">
            {credential.username}
          </div>
          {isDesktop && (
            <div className="text-[11px] text-muted-foreground font-mono mt-1 opacity-50">
              ••••••••••••
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop controls: larger icons kept */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-9 w-9"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(credential.username);
              }}
              title="Copy Username"
            >
              <Copy className="h-5 w-5 text-foreground" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-9 w-9"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(credential.password);
              }}
              title="Copy Password"
            >
              <Copy className="h-5 w-5 text-primary" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-9 w-9"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Edit"
            >
              <Edit className="h-5 w-5 text-foreground" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-9 w-9"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete"
            >
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          </div>

          {/* Mobile grouped controls */}
          <div className="flex sm:hidden items-center gap-2">
            {/* Copy dropdown */}
            <MobileCopyMenu credential={credential} onCopy={handleCopy} />

            {/* More dropdown for edit/delete */}
            <MobileMoreMenu onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>

        {copied && (
          <span className="ml-2 text-xs text-green-600 animate-fade-in-out">
            Copied!
          </span>
        )}
      </div>
    </div>
  );
}
