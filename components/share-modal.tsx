"use client"

import { useState, useEffect } from "react"
import { X, Copy, Check, Link2, Mail, Users, Lock, Globe, Share2, Download, FileText, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { LegalButton } from "@/components/legal-ui"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  caseTitle?: string
  caseNumber?: string
}

type AccessLevel = "private" | "team" | "link" | "public"

interface Collaborator {
  id: string
  name: string
  email: string
  role: "owner" | "editor" | "viewer"
  avatar?: string
}

export function ShareModal({ isOpen, onClose, caseTitle = "USA v. Mangione", caseNumber = "1:25-cr-00176-MMG" }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<"share" | "export" | "activity">("share")
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("team")
  const [shareLink, setShareLink] = useState("https://app.legaldrama.ai/case/usa-v-mangione/share/xK9m2pL")
  const [copiedLink, setCopiedLink] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("viewer")
  const [isInviting, setIsInviting] = useState(false)
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: "1", name: "You", email: "you@lawfirm.com", role: "owner" },
    { id: "2", name: "Raj Anand", email: "raj@lawfirm.com", role: "editor" },
    { id: "3", name: "Eros Ianucci", email: "eros@lawfirm.com", role: "viewer" },
  ])
  
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
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }
  
  const handleInvite = async () => {
    if (!inviteEmail) return
    setIsInviting(true)
    await new Promise(r => setTimeout(r, 1000))
    setCollaborators([
      ...collaborators,
      {
        id: String(Date.now()),
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
      }
    ])
    setInviteEmail("")
    setIsInviting(false)
  }
  
  const handleRemoveCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id))
  }
  
  const handleRoleChange = (id: string, role: "editor" | "viewer") => {
    setCollaborators(collaborators.map(c => 
      c.id === id ? { ...c, role } : c
    ))
  }
  
  const handleExport = async (format: string) => {
    // Generate export content based on format
    const exportData = {
      caseTitle,
      caseNumber,
      exportedAt: new Date().toISOString(),
      accessLevel,
      collaborators: collaborators.map(c => ({ name: c.name, email: c.email, role: c.role }))
    }
    
    let content: string
    let mimeType: string
    let filename: string
    
    switch (format) {
      case "PDF":
        // For now, generate a text file (PDF generation would require a library)
        content = `LegalDrama.ai Export\n\n${caseTitle}\nCase #: ${caseNumber}\nExported: ${new Date().toLocaleString()}\n\nThis is a placeholder for PDF export.`
        mimeType = "text/plain"
        filename = `${caseTitle.replace(/\s+/g, "-")}-export.txt`
        break
      case "DOCX":
        content = `LegalDrama.ai Export\n\n${caseTitle}\nCase #: ${caseNumber}\nExported: ${new Date().toLocaleString()}`
        mimeType = "text/plain"
        filename = `${caseTitle.replace(/\s+/g, "-")}-export.txt`
        break
      case "CSV":
        content = [
          "Field,Value",
          `Case Title,"${caseTitle}"`,
          `Case Number,"${caseNumber}"`,
          `Exported At,"${new Date().toLocaleString()}"`,
          `Access Level,"${accessLevel}"`,
          "",
          "Collaborators",
          "Name,Email,Role",
          ...collaborators.map(c => `"${c.name}","${c.email}","${c.role}"`)
        ].join("\n")
        mimeType = "text/csv"
        filename = `${caseTitle.replace(/\s+/g, "-")}-export.csv`
        break
      case "ZIP":
        // ZIP would require a library, for now export JSON
        content = JSON.stringify(exportData, null, 2)
        mimeType = "application/json"
        filename = `${caseTitle.replace(/\s+/g, "-")}-export.json`
        break
      default:
        return
    }
    
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-xl mx-4",
        "bg-surface border-2 border-border",
        "shadow-brutal-lg",
        "animate-scale-in",
        ""
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border">
          <div>
            <h2 className="font-sans text-xl font-bold text-foreground flex items-center gap-2">
              <Share2 size={20} className="text-purple" />
              Share Case
            </h2>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              {caseTitle} &middot; {caseNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "w-10 h-10 flex items-center justify-center",
              "border-2 border-border bg-surface-alt",
              "text-muted-foreground hover:text-foreground hover:bg-muted/20",
              "transition-all duration-150 click-scale",
              ""
            )}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("share")}
            className={cn(
              "flex-1 px-4 py-3 font-mono text-sm font-medium",
              "border-b-2 transition-all duration-150",
              "flex items-center justify-center gap-2",
              activeTab === "share"
                ? "text-purple border-purple bg-purple/5"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <Users size={14} />
            Share
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={cn(
              "flex-1 px-4 py-3 font-mono text-sm font-medium",
              "border-b-2 transition-all duration-150",
              "flex items-center justify-center gap-2",
              activeTab === "export"
                ? "text-purple border-purple bg-purple/5"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={cn(
              "flex-1 px-4 py-3 font-mono text-sm font-medium",
              "border-b-2 transition-all duration-150",
              "flex items-center justify-center gap-2",
              activeTab === "activity"
                ? "text-purple border-purple bg-purple/5"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <Clock size={14} />
            Activity
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {/* Share Tab */}
          {activeTab === "share" && (
            <div className="space-y-6 animate-fade-in">
              {/* Share Link — all cases are private by default */}
              {(
                <div className="space-y-2">
                  <label className="block font-mono text-xs font-bold text-orange tracking-wider">
                    SHARE LINK
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className={cn(
                        "flex-1 px-4 py-3 font-mono text-sm",
                        "bg-surface-alt border-2 border-border",
                        "text-foreground truncate",
                        ""
                      )}
                    />
                    <button
                      onClick={handleCopyLink}
                      className={cn(
                        "px-4 py-3 flex items-center gap-2",
                        "border-2 border-border bg-surface-alt",
                        "text-muted-foreground hover:text-foreground hover:bg-muted/20",
                        "transition-all duration-150 click-scale",
                        ""
                      )}
                    >
                      {copiedLink ? <Check size={18} className="text-green" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Invite by Email */}
              <div className="space-y-2">
                <label className="block font-mono text-xs font-bold text-orange tracking-wider">
                  INVITE BY EMAIL
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@lawfirm.com"
                    className={cn(
                      "flex-1 px-4 py-3 font-mono text-sm",
                      "bg-surface-alt border-2 border-border",
                      "text-foreground placeholder:text-muted-foreground/50",
                      "focus:outline-none focus:border-purple",
                      "transition-all duration-150",
                      ""
                    )}
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "editor" | "viewer")}
                    className={cn(
                      "px-3 py-3 font-mono text-sm",
                      "bg-surface-alt border-2 border-border",
                      "text-foreground",
                      ""
                    )}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <LegalButton
                    color="var(--purple)"
                    onClick={handleInvite}
                    disabled={!inviteEmail || isInviting}
                    small
                  >
                    {isInviting ? "..." : "Invite"}
                  </LegalButton>
                </div>
              </div>
              
              {/* Collaborators List */}
              <div className="space-y-2">
                <label className="block font-mono text-xs font-bold text-orange tracking-wider">
                  COLLABORATORS ({collaborators.length})
                </label>
                <div className="space-y-2">
                  {collaborators.map((collab) => (
                    <div
                      key={collab.id}
                      className={cn(
                        "flex items-center justify-between px-4 py-3",
                        "bg-surface-alt border-2 border-border",
                        ""
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          "font-mono text-xs font-bold",
                          collab.role === "owner" 
                            ? "bg-purple/20 text-purple" 
                            : collab.role === "editor"
                            ? "bg-cyan/20 text-cyan"
                            : "bg-muted/20 text-muted-foreground"
                        )}>
                          {collab.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{collab.name}</p>
                          <p className="text-xs text-muted-foreground">{collab.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {collab.role === "owner" ? (
                          <span className="px-2 py-1 text-xs font-mono bg-purple/20 text-purple rounded">
                            Owner
                          </span>
                        ) : (
                          <>
                            <select
                              value={collab.role}
                              onChange={(e) => handleRoleChange(collab.id, e.target.value as "editor" | "viewer")}
                              className={cn(
                                "px-2 py-1 text-xs font-mono",
                                "bg-transparent border border-border",
                                "text-foreground",
                                "rounded"
                              )}
                            >
                              <option value="viewer">Viewer</option>
                              <option value="editor">Editor</option>
                            </select>
                            <button
                              onClick={() => handleRemoveCollaborator(collab.id)}
                              className="p-1 text-muted-foreground hover:text-red transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Export Tab */}
          {activeTab === "export" && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-muted-foreground text-sm">
                Export this case in various formats for offline access or sharing outside the platform.
              </p>
              
              <div className="space-y-3">
                <ExportOption
                  icon={FileText}
                  label="PDF Report"
                  description="Full case summary with timeline and docket"
                  format="PDF"
                  onClick={() => handleExport("PDF")}
                />
                <ExportOption
                  icon={FileText}
                  label="Screenplay"
                  description="Dramatized narrative in screenplay format"
                  format="DOCX"
                  onClick={() => handleExport("DOCX")}
                />
                <ExportOption
                  icon={FileText}
                  label="Timeline Data"
                  description="All events and docket entries"
                  format="CSV"
                  onClick={() => handleExport("CSV")}
                />
                <ExportOption
                  icon={FileText}
                  label="Full Archive"
                  description="Complete case data including files"
                  format="ZIP"
                  onClick={() => handleExport("ZIP")}
                />
              </div>
            </div>
          )}
          
          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-muted-foreground text-sm">
                Activity log for this shared case.
              </p>
              
              <div className="space-y-3">
                <HistoryItem
                  action="Raj Anand viewed the case"
                  time="2 hours ago"
                />
                <HistoryItem
                  action="You shared with Eros Ianucci"
                  time="Yesterday at 3:45 PM"
                />
                <HistoryItem
                  action="Raj Anand edited screenplay Chapter 2"
                  time="2 days ago"
                />
                <HistoryItem
                  action="You created the share link"
                  time="3 days ago"
                />
                <HistoryItem
                  action="Case imported from PACER"
                  time="1 week ago"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Access Button Component
function AccessButton({
  icon: Icon,
  label,
  description,
  active,
  onClick
}: {
  icon: React.ElementType
  label: string
  description: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-3 flex items-center gap-3 text-left",
        "border-2 transition-all duration-150 click-scale",
        "",
        active
          ? "border-purple bg-purple/10"
          : "border-border bg-surface-alt hover:bg-muted/10"
      )}
    >
      <Icon size={18} className={active ? "text-purple" : "text-muted-foreground"} />
      <div>
        <p className={cn(
          "text-sm font-medium",
          active ? "text-purple" : "text-foreground"
        )}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}

// Export Option Component
function ExportOption({
  icon: Icon,
  label,
  description,
  format,
  onClick
}: {
  icon: React.ElementType
  label: string
  description: string
  format: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 flex items-center justify-between",
        "border-2 border-border bg-surface-alt",
        "hover:bg-muted/10 hover:border-cyan",
        "transition-all duration-150 click-scale",
        ""
      )}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className="text-cyan" />
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <span className="px-2 py-1 text-xs font-mono bg-muted/20 text-muted-foreground rounded">
        {format}
      </span>
    </button>
  )
}

// History Item Component
function HistoryItem({
  action,
  time
}: {
  action: string
  time: string
}) {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3",
      "border-l-2 border-purple/30 bg-surface-alt",
      "-r-lg"
    )}>
      <p className="text-sm text-foreground">{action}</p>
      <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">{time}</p>
    </div>
  )
}
