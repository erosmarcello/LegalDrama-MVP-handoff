"use client"

import { useState } from "react"
import { LegalModal } from "@/components/legal-ui"
import { LegalInput } from "@/components/legal-ui"
import { LegalButton } from "@/components/legal-ui"
import { cn } from "@/lib/utils"

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onAuth: (user: { email: string; name: string }) => void
  initialMode?: "signin" | "signup"
}

export function AuthModal({ open, onClose, onAuth, initialMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [shake, setShake] = useState(false)

  const handleSubmit = () => {
    if (!email || !password) {
      setError("All fields required")
      triggerShake()
      return
    }
    if (!email.includes("@")) {
      setError("Valid email required")
      triggerShake()
      return
    }
    if (password.length < 4) {
      setError("Password too short")
      triggerShake()
      return
    }
    if (mode === "signup" && !name) {
      setError("Name is required")
      triggerShake()
      return
    }
    
    setError("")
    onAuth({
      email,
      name: name || email.split("@")[0],
    })
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin")
    setError("")
  }

  return (
    <LegalModal
      open={open}
      onClose={onClose}
      title=""
      shake={shake}
      maxWidth="400px"
    >
      <div className="-m-5">
        {/* Brand header */}
        <div className="px-6 py-5 border-b border-border bg-surface">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="font-sans text-lg font-black text-foreground">legal</span>
            <span className="font-sans text-lg font-black text-red">drama</span>
            <span className="font-mono text-sm text-pink">.ai</span>
          </div>
          <p className="font-serif text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to your account" : "Create your free account"}
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
          {/* Mode tabs */}
          <div className="flex mb-4">
            {[
              { key: "signin", label: "Sign In" },
              { key: "signup", label: "Sign Up" },
            ].map((m, i) => (
              <div
                key={m.key}
                onClick={() => {
                  setMode(m.key as "signin" | "signup")
                  setError("")
                }}
                className={cn(
                  "flex-1 py-2 text-center cursor-pointer",
                  "font-mono text-[11px] font-extrabold",
                  "border transition-all duration-150",
                  mode === m.key
                    ? "bg-primary/20 text-primary border-primary dark:bg-primary/20 dark:text-primary dark:border-primary"
                    : "bg-surface-alt text-muted-foreground border-border",
                  i === 0 
                    ? "rounded-l-none -l border-r-0" 
                    : "rounded-r-none -r"
                )}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Form fields */}
          {mode === "signup" && (
            <LegalInput
              label="FULL NAME"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          
          <LegalInput
            label="EMAIL"
            placeholder="you@email.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <LegalInput
            label="PASSWORD"
            placeholder={mode === "signin" ? "Enter password" : "Create password"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Error message */}
          {error && (
            <div className="mb-2 p-2 font-mono text-[10px] text-destructive bg-destructive/10 border border-destructive/30 ">
              {error}
            </div>
          )}

          {/* Submit button */}
          <LegalButton
            color="var(--red)"
            active
            onClick={handleSubmit}
            className="w-full justify-center py-2.5 mt-1"
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </LegalButton>

          {/* Additional links */}
          {mode === "signin" && (
            <div className="text-center mt-3">
              <span className="font-mono text-[9px] text-cyan cursor-pointer hover:underline">
                Forgot password?
              </span>
            </div>
          )}

          {mode === "signup" && (
            <div className="text-center mt-3 font-mono text-[8px] text-muted-foreground leading-relaxed">
              By signing up you agree to our Terms.
              <br />
              Start with <strong className="text-yellow">5 free searches</strong>.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/30 bg-surface">
          <div className="font-mono text-[9px] text-muted-foreground text-center">
            {mode === "signin" ? "No account? " : "Have an account? "}
            <span 
              onClick={switchMode}
              className="text-cyan cursor-pointer font-bold hover:underline"
            >
              {mode === "signin" ? "Sign up free" : "Sign in"}
            </span>
          </div>
        </div>
      </div>
    </LegalModal>
  )
}
