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

/**
 * Cinema-noir modal. Pure black surface, thin border, soft ambient shadow.
 * Header uses cinema-title; subtitle uses contract-font italic.
 */
export function LegalModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  shake = false,
  className,
  maxWidth = "580px",
}: LegalModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

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
      {/* Backdrop — deep theatre black w/ grain */}
      <div className="absolute inset-0 bg-black/85 cinema-grain" />

      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        className={cn(
          "relative w-full mx-4 bg-[var(--card)] border border-[var(--border)]",
          "max-h-[85vh] overflow-hidden flex flex-col",
          "shadow-[0_40px_120px_rgba(0,0,0,0.75)]",
          shake ? "animate-shake" : "animate-modal-in",
          className
        )}
        style={{ maxWidth }}
      >
        {/* Gold rule across the top */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{ background: "var(--gold)" }}
        />

        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between">
          <div>
            <h2 className="cinema-title text-[20px] text-[var(--foreground)] leading-none">
              {title}
            </h2>
            {subtitle && (
              <p className="cinema-contract-italic text-[11px] text-[var(--gold)] mt-1.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={cn(
              "w-7 h-7 flex items-center justify-center shrink-0",
              "border border-[var(--border)] bg-transparent",
              "text-[var(--muted-foreground)]",
              "transition-colors duration-150 cursor-pointer",
              "hover:border-[var(--red)] hover:text-[var(--red)]"
            )}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--card)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
