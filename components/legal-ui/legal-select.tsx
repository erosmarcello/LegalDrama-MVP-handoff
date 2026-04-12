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

export function LegalSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  disabled = false,
}: LegalSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find((o) => o.value === value)

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 flex items-center justify-between gap-2",
          "border-2 border-border bg-surface text-foreground",
          "font-mono text-xs",
          "transition-all duration-150",
          "hover:border-primary focus:border-primary focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "",
          isOpen && "border-primary"
        )}
      >
        <span className={cn(!selectedOption && "text-muted-foreground")}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 z-50 mt-1",
            "border-2 border-border bg-surface",
            "shadow-brutal dark:shadow-none",
            "max-h-60 overflow-auto",
            "",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-3 py-2 text-left",
                "font-mono text-xs",
                "transition-colors duration-100",
                option.value === value
                  ? "bg-primary/15 text-primary"
                  : "text-foreground hover:bg-surface-alt"
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
