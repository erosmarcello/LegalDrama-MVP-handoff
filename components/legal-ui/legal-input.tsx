"use client"

import { cn } from "@/lib/utils"
import { forwardRef, type InputHTMLAttributes, useState } from "react"

interface LegalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const LegalInput = forwardRef<HTMLInputElement, LegalInputProps>(
  ({ label, error, className, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false)

    return (
      <div className="mb-2.5">
        {label && (
          <div className="font-mono text-[8px] font-bold text-muted-foreground mb-1 tracking-wider uppercase">
            {label}
          </div>
        )}
        <input
          ref={ref}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          className={cn(
            "w-full px-3.5 py-2.5",
            "font-mono text-xs text-foreground",
            "bg-input border transition-all duration-150",
            // Light mode
            "rounded-none",
            // Dark mode
            "",
            focused 
              ? "border-primary ring-2 ring-primary/20" 
              : "border-border/60 hover:border-border",
            error && "border-destructive",
            className
          )}
          {...props}
        />
        {error && (
          <div className="mt-1 font-mono text-[10px] text-destructive">
            {error}
          </div>
        )}
      </div>
    )
  }
)

LegalInput.displayName = "LegalInput"

interface LegalSelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  error?: string
  className?: string
}

export function LegalSelect({ label, value, onChange, options, placeholder, error, className }: LegalSelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn("relative", className)}>
      {label && (
        <div className="font-mono text-[8px] font-bold text-muted-foreground mb-1 tracking-wider uppercase">
          {label}
        </div>
      )}
      <div
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full px-3.5 py-2.5 cursor-pointer",
          "font-mono text-xs",
          "bg-input border transition-all duration-150",
          "flex items-center justify-between",
          // Light mode
          "rounded-none",
          // Dark mode
          "",
          open ? "border-primary" : "border-border/60 hover:border-border",
          error && "border-destructive"
        )}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || placeholder || "Select..."}
        </span>
        <span className="text-muted-foreground text-[10px]">
          {open ? "▲" : "▼"}
        </span>
      </div>
      
      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 mt-0.5 z-50",
            "bg-card border border-border",
            "max-h-40 overflow-y-auto",
            "shadow-brut",
            // Light mode
            "rounded-none",
            // Dark mode
            ""
          )}
        >
          {options.map((option, i) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn(
                "px-3 py-2 cursor-pointer",
                "font-mono text-[10px] text-foreground",
                "transition-colors duration-100",
                value === option.value 
                  ? "bg-primary/15" 
                  : "hover:bg-surface-alt",
                i < options.length - 1 && "border-b border-border/25"
              )}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <div className="mt-1 font-mono text-[10px] text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
