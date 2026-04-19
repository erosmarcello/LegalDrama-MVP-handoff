"use client"

import { cn } from "@/lib/utils"
import { forwardRef, type InputHTMLAttributes, useState } from "react"

interface LegalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

/**
 * Cinema-noir input. Bottom-rule underline on focus, gold on active,
 * tiny contract-font label above.
 */
export const LegalInput = forwardRef<HTMLInputElement, LegalInputProps>(
  ({ label, error, className, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false)

    return (
      <div className="mb-3">
        {label && (
          <div className="cinema-label text-[9px] text-[var(--gold)] mb-1.5">
            {label}
          </div>
        )}
        <input
          ref={ref}
          onFocus={e => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={e => {
            setFocused(false)
            onBlur?.(e)
          }}
          className={cn(
            "w-full px-3 py-2.5",
            "cinema-label text-[11px] text-white",
            "bg-transparent border transition-colors duration-150",
            "placeholder:text-[var(--muted-foreground)] placeholder:tracking-[0.12em]",
            focused
              ? "border-[var(--gold)]"
              : "border-[var(--border)] hover:border-[var(--muted-foreground)]",
            error && "border-[var(--red)]",
            className
          )}
          {...props}
        />
        {error && (
          <div className="mt-1.5 cinema-label text-[9px]" style={{ color: "var(--red)" }}>
            {error}
          </div>
        )}
      </div>
    )
  }
)

LegalInput.displayName = "LegalInput"
// LegalSelect lives in ./legal-select (avoid duplicate export)
