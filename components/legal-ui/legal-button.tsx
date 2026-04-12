"use client"

import { cn } from "@/lib/utils"
import { forwardRef, type ButtonHTMLAttributes } from "react"

interface LegalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string
  active?: boolean
  small?: boolean
  variant?: "default" | "ghost" | "outline"
}

export const LegalButton = forwardRef<HTMLButtonElement, LegalButtonProps>(
  ({ children, color, active = false, small = false, variant = "default", className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-1.5",
          "font-mono font-extrabold transition-all duration-150",
          "border cursor-pointer",
          // Sizing
          small ? "px-2.5 py-1 text-[10px]" : "px-3.5 py-1.5 text-[11px]",
          // Light mode
          "border-border",
          // Dark mode
          "",
          // States
          active
            ? "translate-x-0.5 translate-y-0.5"
            : "hover:translate-x-0 hover:translate-y-0 active:translate-x-0.5 active:translate-y-0.5",
          // Disabled
          disabled && "opacity-50 cursor-not-allowed",
          // Variant styles are applied via inline style for color flexibility
          className
        )}
        style={{
          backgroundColor: active 
            ? (color || "var(--primary)") 
            : variant === "ghost" 
              ? "transparent" 
              : "var(--card)",
          color: active 
            ? "var(--primary-foreground)" 
            : (color || "var(--foreground)"),
          borderColor: active || variant === "outline"
            ? (color || "var(--primary)")
            : "var(--border)",
          boxShadow: active 
            ? "none" 
            : "var(--shadow-color) 3px 3px 0px",
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

LegalButton.displayName = "LegalButton"

// Button group for joined buttons
interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
  return (
    <div 
      className={cn(
        "inline-flex",
        "[&>button]:[&>button]:border-r-0 [&>button:last-child]:border-r",
        "[&>button:first-child]:rounded-l [&>button:last-child]:rounded-r",
        "dark:[&>button:first-child]:rounded-l dark:[&>button:last-child]:rounded-r",
        className
      )}
    >
      {children}
    </div>
  )
}
