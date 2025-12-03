"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Minus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
  className,
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

  // Clamp position to viewport
  const style: React.CSSProperties = {
    position: "fixed",
    left: position.x,
    top: position.y,
    zIndex: 50,
    touchAction: "none",
  };

  return (
    <div style={style} ref={containerRef} className={className}>
      <Card className="shadow-2xl border-primary/20 w-80 overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Header / Drag Handle */}
        <div
          className="p-3 bg-muted/50 border-b cursor-move flex items-center justify-between select-none"
          onMouseDown={handleMouseDown}
        >
          <span className="font-medium text-sm flex items-center gap-2">
            {title}
          </span>
          <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6"
              onClick={toggleMinimize}
            >
              {isMinimized ? (
                <Maximize2 className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 hover:text-destructive"
                onClick={onClose}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {!isMinimized && <div className="p-4 max-h-[400px] overflow-y-auto">{children}</div>}
      </Card>
    </div>
  );
}

