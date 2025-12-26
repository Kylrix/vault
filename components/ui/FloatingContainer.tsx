"use client";

import { Box, Paper, Typography, IconButton, alpha } from "@mui/material";
import { X as CloseIcon, Minus as MinimizeIcon, Maximize2 as MaximizeIcon } from "lucide-react";

interface FloatingContainerProps {
  children: React.ReactNode;
  title: string;
  onClose?: () => void;
  defaultPosition?: { x: number; y: number };
  className?: string;
}

export function FloatingContainer({
  children,
  title,
  onClose,
  defaultPosition = { x: 20, y: 20 },
}: FloatingContainerProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 1300,
        touchAction: "none",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: 320,
          overflow: 'hidden',
          bgcolor: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Header / Drag Handle */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            p: 1.5,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            cursor: 'move',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8rem' }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} onMouseDown={(e) => e.stopPropagation()}>
            <IconButton size="small" onClick={toggleMinimize} sx={{ color: 'text.secondary' }}>
              {isMinimized ? <MaximizeIcon size={14} /> : <MinimizeIcon size={14} />}
            </IconButton>
            {onClose && (
              <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                <CloseIcon size={14} />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Content */}
        {!isMinimized && (
          <Box sx={{ p: 2, maxHeight: 400, overflowY: 'auto' }}>
            {children}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

