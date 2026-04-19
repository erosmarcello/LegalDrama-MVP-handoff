"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface LegalSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

/**
 * Cinema-noir select. Thin border, gold on hover/open, contract-font items.
 */
export function LegalSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
  disabled = false,
}: LegalSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 flex items-center justify-between gap-2",
          "border border-[var(--border)] bg-transparent",
          "cinema-label text-[11px] text-white",
          "transition-colors duration-150",
          "hover:border-[var(--gold)] focus:border-[var(--gold)] focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen && "border-[var(--gold)]"
        )}
      >
        <span
          className={cn(
            !selectedOption && "text-[var(--muted-foreground)]"
          )}
        >
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={12}
          className={cn(
            "transition-transform duration-200 text-[var(--muted-foreground)]",
            isOpen && "rotate-180 text-[var(--gold)]"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 z-50 mt-0.5",
            "border border-[var(--border)] bg-[#141414]",
            "max-h-60 overflow-auto",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}
        >
          {options.map((option, i) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-3 py-2 text-left",
                "cinema-label text-[10px]",
                "transition-colors duration-100",
                option.value === value
                  ? "bg-[color:color-mix(in_srgb,var(--gold)_14%,transparent)] text-[var(--gold)]"
                  : "text-white hover:bg-[#1a1a1a]",
                i < options.length - 1 && "border-b border-[var(--border)]"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
