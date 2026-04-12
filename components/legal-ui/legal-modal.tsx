"use client"

import { cn } from "@/lib/utils"
import { useEffect, useCallback } from "react"
import { X } from "lucide-react"

interface LegalModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  shake?: boolean
  className?: string
  maxWidth?: string
}

export function LegalModal({ 
  open, 
  onClose, 
  title, 
  subtitle, 
  children, 
  footer, 
  shake = false,
  className,
  maxWidth = "580px"
}: LegalModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, handleEscape])

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/70" />
      
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full mx-4 bg-card border border-border",
          "max-h-[80vh] overflow-hidden flex flex-col",
          // Light mode
          "shadow-[8px_8px_0_var(--shadow-color)]",
          // Dark mode
          " dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
          shake ? "animate-shake" : "animate-modal-in",
          className
        )}
        style={{ maxWidth }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-surface flex items-center justify-between">
          <div>
            <h2 className="font-sans text-base font-black text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="font-serif text-sm text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={cn(
              "w-7 h-7 flex items-center justify-center",
              "bg-surface-alt border border-border",
              "font-mono text-sm font-black text-foreground",
              "transition-all duration-150 cursor-pointer",
              // Light mode
              "hover:bg-destructive hover:text-white",
              // Dark mode
              " hover:dark:bg-destructive hover:dark:text-white"
            )}
          >
            <X size={14} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-border/30 bg-surface">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
