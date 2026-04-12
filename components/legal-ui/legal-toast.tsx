"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  message: string
  color?: string
}

interface ToastContextType {
  toast: (message: string, color?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, color?: string) => {
    const id = Math.random().toString(36).slice(2, 11)
    setToasts((prev) => [...prev, { id, message, color }])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 left-1/2 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "px-5 py-2.5",
            "font-mono text-[11px] font-extrabold",
            "border animate-toast whitespace-nowrap",
            // Light mode
            "shadow-brut",
            // Dark mode
            " dark:shadow-brut"
          )}
          style={{
            backgroundColor: t.color || "var(--green)",
            color: "var(--background)",
            borderColor: t.color || "var(--green)",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
