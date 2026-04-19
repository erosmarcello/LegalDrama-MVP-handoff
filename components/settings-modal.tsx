"use client"

import { useState, useEffect } from "react"
import { X, Check, Copy, ExternalLink, RefreshCw, AlertCircle, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { LegalButton } from "@/components/legal-ui"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

// Court options for CM/ECF
const COURT_OPTIONS = [
  { value: "nysd", label: "S.D.N.Y. - Southern District of NY" },
  { value: "nyed", label: "E.D.N.Y. - Eastern District of NY" },
  { value: "nynd", label: "N.D.N.Y. - Northern District of NY" },
  { value: "nywd", label: "W.D.N.Y. - Western District of NY" },
  { value: "cacd", label: "C.D. Cal. - Central District of CA" },
  { value: "cand", label: "N.D. Cal. - Northern District of CA" },
  { value: "casd", label: "S.D. Cal. - Southern District of CA" },
  { value: "dcd", label: "D.D.C. - District of Columbia" },
  { value: "ilnd", label: "N.D. Ill. - Northern District of IL" },
  { value: "txsd", label: "S.D. Tex. - Southern District of TX" },
  { value: "txnd", label: "N.D. Tex. - Northern District of TX" },
  { value: "flsd", label: "S.D. Fla. - Southern District of FL" },
  { value: "mad", label: "D. Mass. - District of Massachusetts" },
  { value: "paed", label: "E.D. Pa. - Eastern District of PA" },
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"pacer" | "ecf" | "docketbird">("pacer")
  
  // Integration connection states
  const [pacerConnected, setPacerConnected] = useState(true)
  const [ecfConnected, setEcfConnected] = useState(false)
  const [docketbirdConnected, setDocketbirdConnected] = useState(false)
  
  // PACER form state
  const [pacerUsername, setPacerUsername] = useState("user@court.gov")
  const [pacerPassword, setPacerPassword] = useState("password123")
  const [showPacerPassword, setShowPacerPassword] = useState(false)
  const [generatedEcfEmail] = useState("case@ecf.legaldrama.ai")
  
  // CM/ECF form state
  const [selectedCourt, setSelectedCourt] = useState("nysd")
  const [ecfLogin, setEcfLogin] = useState("")
  const [ecfPassword, setEcfPassword] = useState("")
  const [showEcfPassword, setShowEcfPassword] = useState(false)
  
  // DocketBird form state
  const [docketbirdApiKey, setDocketbirdApiKey] = useState("")
  const [webhookUrl] = useState("https://api.legaldrama.ai/webhooks/db/usr_7k2x")
  const [alerts, setAlerts] = useState({
    newFiling: true,
    crossCase: true,
    judgeReassign: false,
    opposingCounsel: false,
  })
  
  // Loading states
  const [isConnecting, setIsConnecting] = useState(false)
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  
  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2000)
  }
  
  const handlePacerConnect = async () => {
    setIsConnecting(true)
    await new Promise(r => setTimeout(r, 1500))
    setPacerConnected(true)
    setIsConnecting(false)
  }
  
  const handlePacerDisconnect = async () => {
    setIsConnecting(true)
    await new Promise(r => setTimeout(r, 1000))
    setPacerConnected(false)
    setPacerUsername("")
    setPacerPassword("")
    setIsConnecting(false)
  }
  
  const handleEcfConnect = async () => {
    if (!ecfLogin || !ecfPassword) return
    setIsConnecting(true)
    await new Promise(r => setTimeout(r, 1500))
    setEcfConnected(true)
    setIsConnecting(false)
  }
  
  const handleDocketbirdConnect = async () => {
    if (!docketbirdApiKey) return
    setIsConnecting(true)
    await new Promise(r => setTimeout(r, 1500))
    setDocketbirdConnected(true)
    setIsConnecting(false)
  }
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop — deep black with cinema grain */}
      <div
        className="absolute inset-0 bg-black/85 cinema-grain animate-fade-in"
        onClick={onClose}
      />

      {/* Modal — noir card with gold top-rule */}
      <div
        className={cn(
          "relative w-full max-w-2xl mx-4",
          "bg-[#0f0f0f] border border-[var(--border)]",
          "animate-scale-in",
          "shadow-[0_40px_100px_rgba(0,0,0,0.7)]",
          "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-[var(--gold)]",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--border)]">
          <div>
            <div className="cinema-label text-[9px] text-[var(--gold)] mb-1">
              Chambers · Integrations
            </div>
            <h2 className="cinema-title text-[22px] text-white">
              Court Connections
            </h2>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "w-9 h-9 flex items-center justify-center",
              "border border-[var(--border)] bg-transparent",
              "text-white/60 hover:text-[var(--red)] hover:border-[var(--red)]",
              "transition-colors duration-150",
            )}
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Status Chips */}
        <div className="flex items-center gap-3 px-6 py-4">
          <StatusChip 
            label="PACER" 
            connected={pacerConnected} 
            onClick={() => setActiveTab("pacer")}
            active={activeTab === "pacer"}
          />
          <StatusChip 
            label="ECF" 
            connected={ecfConnected} 
            onClick={() => setActiveTab("ecf")}
            active={activeTab === "ecf"}
          />
          <StatusChip 
            label="DocketBird" 
            connected={docketbirdConnected} 
            onClick={() => setActiveTab("docketbird")}
            active={activeTab === "docketbird"}
          />
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <TabButton 
            label="PACER" 
            active={activeTab === "pacer"} 
            onClick={() => setActiveTab("pacer")}
            connected={pacerConnected}
          />
          <TabButton 
            label="CM/ECF" 
            active={activeTab === "ecf"} 
            onClick={() => setActiveTab("ecf")}
            connected={ecfConnected}
          />
          <TabButton 
            label="DocketBird" 
            active={activeTab === "docketbird"} 
            onClick={() => setActiveTab("docketbird")}
            connected={docketbirdConnected}
          />
        </div>
        
        {/* Tab Content */}
        <div className="p-6 min-h-[400px]">
          {/* PACER Tab */}
          {activeTab === "pacer" && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-muted-foreground leading-relaxed">
                Link PACER to auto-fetch docket entries and sync new activity. Uses your billing.
              </p>
              
              <div className="space-y-4">
                <FormField label="PACER USERNAME">
                  <input
                    type="text"
                    value={pacerUsername}
                    onChange={(e) => setPacerUsername(e.target.value)}
                    placeholder="user@court.gov"
                    disabled={pacerConnected}
                    className={cn(
                      "w-full px-4 py-3 font-mono text-sm",
                      "bg-surface-alt border-2 border-border",
                      "text-foreground placeholder:text-muted-foreground/50",
                      "focus:outline-none focus:border-cyan",
                      "disabled:opacity-60 disabled:cursor-not-allowed",
                      "transition-all duration-150",
                      ""
                    )}
                  />
                </FormField>
                
                <FormField label="PACER PASSWORD">
                  <div className="relative">
                    <input
                      type={showPacerPassword ? "text" : "password"}
                      value={pacerPassword}
                      onChange={(e) => setPacerPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={pacerConnected}
                      className={cn(
                        "w-full px-4 py-3 pr-12 font-mono text-sm",
                        "bg-surface-alt border-2 border-border",
                        "text-foreground placeholder:text-muted-foreground/50",
                        "focus:outline-none focus:border-cyan",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                        "transition-all duration-150",
                        ""
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPacerPassword(!showPacerPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPacerPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormField>
                
                {pacerConnected && (
                  <FormField label="GENERATED ECF EMAIL">
                    <div className={cn(
                      "w-full px-4 py-3 font-mono text-sm",
                      "bg-cyan/20 border-2 border-cyan",
                      "text-cyan",
                      ""
                    )}>
                      {generatedEcfEmail}
                    </div>
                  </FormField>
                )}
              </div>
              
              <div className="pt-4">
                {pacerConnected ? (
                  <LegalButton
                    color="var(--red)"
                    onClick={handlePacerDisconnect}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin" />
                        Disconnecting...
                      </span>
                    ) : (
                      "Disconnect PACER"
                    )}
                  </LegalButton>
                ) : (
                  <LegalButton
                    color="var(--green)"
                    onClick={handlePacerConnect}
                    disabled={isConnecting || !pacerUsername || !pacerPassword}
                  >
                    {isConnecting ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin" />
                        Connecting...
                      </span>
                    ) : (
                      "Connect PACER"
                    )}
                  </LegalButton>
                )}
              </div>
            </div>
          )}
          
          {/* CM/ECF Tab */}
          {activeTab === "ecf" && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-muted-foreground leading-relaxed">
                Link CM/ECF for real-time NEF alerts and free PDF access.
              </p>
              
              <div className="space-y-4">
                <FormField label="SELECT COURT">
                  <select
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 font-mono text-sm",
                      "bg-surface-alt border-2 border-border",
                      "text-foreground",
                      "focus:outline-none focus:border-orange",
                      "transition-all duration-150 cursor-pointer",
                      ""
                    )}
                  >
                    {COURT_OPTIONS.map((court) => (
                      <option key={court.value} value={court.value}>
                        {court.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                
                <FormField label="ECF LOGIN">
                  <input
                    type="text"
                    value={ecfLogin}
                    onChange={(e) => setEcfLogin(e.target.value)}
                    placeholder="ecf-user"
                    className={cn(
                      "w-full px-4 py-3 font-mono text-sm",
                      "bg-surface-alt border-2 border-border",
                      "text-foreground placeholder:text-muted-foreground/50",
                      "focus:outline-none focus:border-orange",
                      "transition-all duration-150",
                      ""
                    )}
                  />
                </FormField>
                
                <FormField label="ECF PASSWORD">
                  <div className="relative">
                    <input
                      type={showEcfPassword ? "text" : "password"}
                      value={ecfPassword}
                      onChange={(e) => setEcfPassword(e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        "w-full px-4 py-3 pr-12 font-mono text-sm",
                        "bg-surface-alt border-2 border-border",
                        "text-foreground placeholder:text-muted-foreground/50",
                        "focus:outline-none focus:border-orange",
                        "transition-all duration-150",
                        ""
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEcfPassword(!showEcfPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showEcfPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormField>
              </div>
              
              <div className="pt-4">
                <LegalButton
                  color="var(--foreground)"
                  onClick={handleEcfConnect}
                  disabled={isConnecting || !ecfLogin || !ecfPassword}
                >
                  {isConnecting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      Connecting...
                    </span>
                  ) : ecfConnected ? (
                    "Reconnect ECF"
                  ) : (
                    "Connect ECF"
                  )}
                </LegalButton>
              </div>
            </div>
          )}
          
          {/* DocketBird Tab */}
          {activeTab === "docketbird" && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-muted-foreground leading-relaxed">
                Connect DocketBird for cross-case alerts and automated discovery.
              </p>
              
              <div className="space-y-4">
                <FormField label="API KEY">
                  <input
                    type="text"
                    value={docketbirdApiKey}
                    onChange={(e) => setDocketbirdApiKey(e.target.value)}
                    placeholder="db_live_k8x..."
                    className={cn(
                      "w-full px-4 py-3 font-mono text-sm",
                      "bg-surface-alt border-2 border-border",
                      "text-foreground placeholder:text-muted-foreground/50",
                      "focus:outline-none focus:border-purple",
                      "transition-all duration-150",
                      ""
                    )}
                  />
                </FormField>
                
                <FormField label="WEBHOOK URL">
                  <div className="relative">
                    <input
                      type="text"
                      value={webhookUrl}
                      readOnly
                      className={cn(
                        "w-full px-4 py-3 pr-12 font-mono text-sm",
                        "bg-green/10 border-2 border-green/50",
                        "text-green",
                        "cursor-text select-all",
                        ""
                      )}
                    />
                    <button
                      type="button"
                      onClick={handleCopyWebhook}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-green hover:text-green/80 transition-colors"
                    >
                      {copiedWebhook ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </FormField>
                
                <FormField label="ALERTS">
                  <div className="space-y-3">
                    <AlertToggle
                      label="New filing alerts"
                      checked={alerts.newFiling}
                      onChange={(checked) => setAlerts(a => ({ ...a, newFiling: checked }))}
                    />
                    <AlertToggle
                      label="Cross-case discovery"
                      checked={alerts.crossCase}
                      onChange={(checked) => setAlerts(a => ({ ...a, crossCase: checked }))}
                    />
                    <AlertToggle
                      label="Judge reassignment"
                      checked={alerts.judgeReassign}
                      onChange={(checked) => setAlerts(a => ({ ...a, judgeReassign: checked }))}
                    />
                    <AlertToggle
                      label="Opposing counsel"
                      checked={alerts.opposingCounsel}
                      onChange={(checked) => setAlerts(a => ({ ...a, opposingCounsel: checked }))}
                    />
                  </div>
                </FormField>
              </div>
              
              <div className="pt-4">
                <LegalButton
                  color="var(--foreground)"
                  onClick={handleDocketbirdConnect}
                  disabled={isConnecting || !docketbirdApiKey}
                >
                  {isConnecting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      Connecting...
                    </span>
                  ) : docketbirdConnected ? (
                    "Reconnect DocketBird"
                  ) : (
                    "Connect DocketBird"
                  )}
                </LegalButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Status Chip Component
function StatusChip({ 
  label, 
  connected, 
  onClick,
  active 
}: { 
  label: string
  connected: boolean
  onClick: () => void
  active: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 flex items-center gap-2",
        "font-mono text-xs font-medium",
        "border-2 transition-all duration-150 click-scale",
        "",
        connected 
          ? "bg-green/20 border-green text-green" 
          : "bg-surface-alt border-border text-muted-foreground",
        active && "ring-2 ring-offset-2 ring-offset-surface ring-purple/50"
      )}
    >
      <span className={cn(
        "w-2 h-2 rounded-full",
        connected ? "bg-green animate-pulse" : "bg-muted-foreground/50"
      )} />
      <span>{label}</span>
      <span className="opacity-70">{connected ? "On" : "Off"}</span>
    </button>
  )
}

// Tab Button Component
function TabButton({ 
  label, 
  active, 
  onClick,
  connected
}: { 
  label: string
  active: boolean
  onClick: () => void
  connected: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 px-6 py-3",
        "font-mono text-sm font-medium",
        "border-b-2 transition-all duration-150",
        active 
          ? connected
            ? "text-green border-green bg-green/5"
            : "text-orange border-orange bg-orange/5"
          : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/10"
      )}
    >
      {label}
    </button>
  )
}

// Form Field Component
function FormField({ 
  label, 
  children 
}: { 
  label: string
  children: React.ReactNode 
}) {
  return (
    <div className="space-y-2">
      <label className="block font-mono text-xs font-bold text-orange tracking-wider">
        {label}
      </label>
      {children}
    </div>
  )
}

// Alert Toggle Component
function AlertToggle({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3",
      "bg-surface-alt border-2 border-border",
      ""
    )}>
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-12 h-6 rounded-full transition-all duration-200",
          checked 
            ? "bg-purple" 
            : "bg-muted-foreground/30"
        )}
      >
        <span className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200",
          checked ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  )
}
