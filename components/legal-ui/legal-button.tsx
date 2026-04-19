"use client"

import { cn } from "@/lib/utils"
import { forwardRef, type ButtonHTMLAttributes } from "react"

interface LegalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string
  active?: boolean
  small?: boolean
  variant?: "default" | "ghost" | "outline"
}

/**
 * Cinema-noir button.
 *
 * Thin 1px borders, no offset shadow. Active state fills with the accent
 * color (red/gold/white) against pure black. Hover transitions border color
 * only — no translate, no shadow.
 */
export const LegalButton = forwardRef<HTMLButtonElement, LegalButtonProps>(
  (
    {
      children,
      color,
      active = false,
      small = false,
      variant = "default",
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-1.5",
          "cinema-label transition-colors duration-150",
          "border cursor-pointer select-none",
          small ? "px-3 py-1 text-[10px]" : "px-4 py-1.5 text-[11px]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        style={{
          backgroundColor: active
            ? color || "var(--gold)"
            : variant === "ghost"
              ? "transparent"
              : "transparent",
          color: active
            ? "#0a0a0a"
            : color || "var(--foreground)",
          borderColor:
            active || variant === "outline"
              ? color || "var(--gold)"
              : "var(--border)",
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

LegalButton.displayName = "LegalButton"

interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex",
        "[&>button]:border-r-0 [&>button:last-child]:border-r",
        className
      )}
    >
      {children}
    </div>
  )
}
