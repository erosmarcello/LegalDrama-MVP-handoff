"use client"

import { useState, useEffect, useRef } from "react"
import { 
  X, Upload, FolderOpen, Users, Play, Pause, Star, 
  FileText, Zap, Flag, Calendar, MessageSquare, Clock,
  Check, Copy, Trash2, Plus, ChevronUp, ChevronDown, 
  Sparkles, Volume2, Image as ImageIcon, Video, Archive,
  RefreshCw, Edit3, Save, Share2, Settings, Link2, Eye,
  Download, Mic, Film, Wand2, ExternalLink, MoreHorizontal,
  ChevronRight, ChevronLeft, Layers, Grid3X3, List, Search, Filter,
  Flame, Scale, Target, Gavel, Box, ImagePlus, Moon, Sun,
  Shield, AlertTriangle as AlertTriangleIcon, BarChart3, Timer,
  BookMarked, FileSearch, TrendingUp, Activity, Hash
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

interface ContentModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: "upload" | "organize" | "screenplay" | "collab"
  isDark?: boolean
  onToggleTheme?: () => void
  onOpenSettings?: () => void
}

// Case Evidence items with more detail
const CASE_EVIDENCE = [
  { id: 1, name: "Sealed Complaint (Dkt 1)", date: "12/18/24", type: "filing", tier: "T1", icon: FileText, color: "var(--red)", enabled: true },
  { id: 2, name: "Redacted Indictment (Dkt 22)", date: "04/17/25", type: "filing", tier: "T1", icon: Zap, color: "var(--yellow)", enabled: true },
  { id: 3, name: "Death Penalty Notice (Dkt 25)", date: "04/24/25", type: "notice", tier: "T1", icon: Flag, color: "var(--red)", enabled: true },
  { id: 4, name: "Motion to Dismiss (Dkt 51)", date: "09/20/25", type: "motion", tier: "T2", icon: FileText, color: "var(--muted-foreground)", enabled: true },
  { id: 5, name: "Suppression Ruling (Dkt 102)", date: "01/30/26", type: "order", tier: "T1", icon: Gavel, color: "var(--muted-foreground)", enabled: true },
  { id: 6, name: "Counts Dismissed (Dkt 103)", date: "01/30/26", type: "order", tier: "T1", icon: Gavel, color: "var(--muted-foreground)", enabled: false },
  { id: 7, name: "Scheduling Order (Dkt 105)", date: "02/03/26", type: "scheduling", tier: "T1", icon: Star, color: "var(--yellow)", enabled: true },
  { id: 8, name: "DP Dropped Letter (Dkt 113)", date: "02/27/26", type: "notice", tier: "T1", icon: Flag, color: "var(--green)", enabled: false },
]

// Secondary Evidence (user uploads)
const SECONDARY_EVIDENCE = [
  { id: 101, name: "Smith Deposition Transcript...", tag: "transcript", detail: "Witness deposition — 47 pages", icon: FileText, color: "var(--purple)", enabled: true },
  { id: 102, name: "Opposition Emails.zip", tag: "documents", detail: "Email chain — 312 messages", icon: Archive, color: "var(--cyan)", enabled: false },
  { id: 103, name: "Surveillance Video.mp4", tag: "video", detail: "Lobby camera — 4:23 duration", icon: Video, color: "var(--muted-foreground)", enabled: false },
  { id: 104, name: "Courtroom Sketch Series", tag: "photos", detail: "6 courtroom illustrations", icon: ImageIcon, color: "var(--orange)", enabled: true },
]

// Timeline events for Organize tab
const TIMELINE_EVENTS = [
  { date: "12/18/24", title: "Complaint Filed", lane: "factual", expanded: false },
  { date: "12/19/24", title: "Arrest", lane: "procedural", expanded: false },
  { date: "04/17/25", title: "Indictment", lane: "factual", expanded: true },
  { date: "04/24/25", title: "Death Penalty Sought", lane: "factual", expanded: true },
  { date: "01/30/26", title: "Suppression Denied", lane: "procedural", expanded: false },
  { date: "01/30/26", title: "Counts 3&4 Dismissed", lane: "factual", expanded: true },
  { date: "02/03/26", title: "Master Schedule", lane: "scheduling", expanded: true },
  { date: "10/13/26", title: "Trial Begins", lane: "scheduling", expanded: true },
]

// Docket entries
const DOCKET_ENTRIES = [
  { num: 1, title: "SEALED COMPLAINT — §§ 2261A, 924(j), 924(c)", date: "12/18/24" },
  { num: 0, title: "Arrest of defendant (on writ)", date: "12/19/24", indent: true },
  { num: 5, title: "Minute Entry: Initial Appearance, Detention Hearing", date: "12/19/24" },
  { num: 7, title: "Brady ORDER entered", date: "12/19/24" },
  { num: 22, title: "REDACTED INDICTMENT — 4 counts", date: "04/17/25" },
  { num: 25, title: "NOTICE: Death Penalty Sought", date: "04/24/25" },
  { num: 51, title: "MOTION TO DISMISS — AG Bondi exhibits", date: "09/20/25" },
  { num: 102, title: "OPINION & ORDER — Suppression DENIED", date: "01/30/26" },
  { num: 103, title: "OPINION & ORDER — Counts 3 & 4 DISMISSED", date: "01/30/26" },
  { num: 105, title: "SCHEDULING ORDER ★ — Master trial schedule", date: "02/03/26" },
]

// Mood board categories — expanded visual taxonomy
const MOOD_CATEGORIES = [
  { id: 1, name: "Courtroom Wide", color: "var(--red)", assets: 3, tag: "INT" },
  { id: 2, name: "Defendant Close", color: "var(--orange)", assets: 5, tag: "CHAR" },
  { id: 3, name: "Evidence Table", color: "var(--yellow)", assets: 2, tag: "PROP" },
  { id: 4, name: "Jury Box", color: "var(--green)", assets: 1, tag: "INT" },
  { id: 5, name: "Judge's Bench", color: "var(--cyan)", assets: 4, tag: "INT" },
  { id: 6, name: "Witness Stand", color: "var(--purple)", assets: 2, tag: "CHAR" },
  { id: 7, name: "Counsel Table", color: "var(--pink)", assets: 3, tag: "CHAR" },
  { id: 8, name: "Gallery / Public", color: "var(--muted-foreground)", assets: 1, tag: "INT" },
  { id: 9, name: "Exterior — Courthouse", color: "var(--green)", assets: 2, tag: "EXT" },
  { id: 10, name: "Crime Scene — Hilton", color: "var(--red)", assets: 6, tag: "EXT" },
  { id: 11, name: "Arrest — Altoona", color: "var(--orange)", assets: 4, tag: "EXT" },
  { id: 12, name: "Document Close-up", color: "var(--cyan)", assets: 9, tag: "PROP" },
  { id: 13, name: "Surveillance Footage", color: "var(--yellow)", assets: 3, tag: "VID" },
  { id: 14, name: "Manifesto Pages", color: "var(--red)", assets: 2, tag: "PROP" },
  { id: 15, name: "Victim — B. Thompson", color: "var(--pink)", assets: 1, tag: "CHAR" },
]

// Legal Intelligence — features that make lawyers say "whoa"
const LEGAL_INTELLIGENCE = [
  { id: "strength", label: "Case Strength", value: 72, unit: "%", color: "var(--green)", trend: "+3", desc: "AI-estimated prosecution strength" },
  { id: "deadline", label: "Next Deadline", value: "Apr 25", unit: "", color: "var(--red)", trend: "17d", desc: "Mot. in Limine responses due" },
  { id: "judge", label: "Judge Gentry", value: "64%", unit: "gov", color: "var(--cyan)", trend: "±4", desc: "Historical govt win rate" },
  { id: "motions", label: "Suppression Rate", value: "23%", unit: "grant", color: "var(--orange)", trend: "S.D.N.Y.", desc: "District average for this motion type" },
]

const PRECEDENT_MATCHES = [
  { case: "USA v. Tsarnaev", relevance: 89, court: "1st Cir.", tag: "DEATH PENALTY → LIFE", color: "var(--red)" },
  { case: "USA v. Roof", relevance: 84, court: "4th Cir.", tag: "HATE CRIME CAPITAL", color: "var(--orange)" },
  { case: "USA v. Holmes", relevance: 76, court: "N.D. Cal.", tag: "CEO FRAUD TRIAL", color: "var(--purple)" },
  { case: "USA v. Rittenhouse", relevance: 71, court: "E.D. Wis.", tag: "SELF-DEFENSE MEDIA", color: "var(--cyan)" },
  { case: "People v. Weinstein", relevance: 68, court: "S.D.N.Y.", tag: "HIGH-PROFILE SDNY", color: "var(--pink)" },
]

const FRCP_QUICK_REF = [
  { rule: "Rule 12(b)", title: "Motion to Dismiss", deadline: "21 days after service", active: true },
  { rule: "Rule 16", title: "Scheduling Conference", deadline: "Per court order", active: true },
  { rule: "Rule 29", title: "Stipulation for Discovery", deadline: "By agreement", active: false },
  { rule: "Rule 33", title: "Interrogatories", deadline: "30 days to respond", active: false },
  { rule: "Rule 41", title: "Search & Seizure", deadline: "Suppression: pretrial", active: true },
  { rule: "Rule 404(b)", title: "Other Acts Evidence", deadline: "Reasonable notice", active: true },
]

// Team members
const TEAM_MEMBERS = [
  { id: 1, name: "Raj A.", role: "Admin", online: true, color: "var(--green)" },
  { id: 2, name: "Eros I.", role: "Admin", online: true, color: "var(--purple)" },
  { id: 3, name: "Apoorv S.", role: "Collaborator", online: false, color: "var(--muted-foreground)" },
]

// Activity log
const ACTIVITY_LOG = [
  { time: "2 min ago", user: "Eros I.", action: "uploaded", target: "Courtroom Sketch Series", color: "var(--cyan)" },
  { time: "15 min ago", user: "Raj A.", action: "toggled bypassed", target: "Surveillance Video.mp4", color: "var(--yellow)" },
  { time: "1 hr ago", user: "Raj A.", action: "added to timeline", target: "Death Penalty Dropped", color: "var(--green)" },
  { time: "3 hrs ago", user: "Apoorv S.", action: "connected", target: "PACER account", color: "var(--purple)" },
  { time: "Yesterday", user: "Eros I.", action: "classified as T1", target: "Sealed Complaint", color: "var(--orange)" },
]

// AI Auto-labeling capabilities
const AI_CAPABILITIES = [
  { icon: Video, label: "Video → Scene detection", color: "var(--purple)" },
  { icon: Mic, label: "Audio → Transcription + summary", color: "var(--cyan)" },
  { icon: ImageIcon, label: "Photos → Descriptions + scene rewrites", color: "var(--pink)" },
  { icon: FileText, label: "Text → Classification + importance", color: "var(--green)" },
  { icon: ImagePlus, label: "Images → Character profiles", color: "var(--yellow)" },
]

// Quick Actions
const QUICK_ACTIONS = [
  { icon: Sparkles, label: "AI Summarize", color: "var(--red)" },
  { icon: Film, label: "Generate Script", color: "var(--purple)" },
  { icon: Volume2, label: "Audio Summary", color: "var(--cyan)" },
  { icon: Download, label: "Export Timeline", color: "var(--green)" },
  { icon: Users, label: "View Characters", color: "var(--pink)" },
  { icon: Wand2, label: "Scene Rewrite", color: "var(--orange)" },
]

// Lane configuration
const LANES = {
  factual: { color: "var(--red)", label: "FACTUAL" },
  procedural: { color: "var(--green)", label: "PROCEDURAL" },
  scheduling: { color: "var(--yellow)", label: "SCHEDULING" },
}

export function ContentModal({ isOpen, onClose, initialTab = "upload", isDark, onToggleTheme, onOpenSettings }: ContentModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "organize" | "screenplay" | "collab">(initialTab)
  const [dramatization, setDramatization] = useState(75)
  const [caseEvidence, setCaseEvidence] = useState(CASE_EVIDENCE)
  const [secondaryEvidence, setSecondaryEvidence] = useState(SECONDARY_EVIDENCE)
  const [isDragging, setIsDragging] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("Collaborator")
  const [uploadMode, setUploadMode] = useState<"case" | "secondary">("case")
  const [visibleLanes, setVisibleLanes] = useState(new Set(["factual", "procedural", "scheduling"]))
  const [mounted, setMounted] = useState(false)
  const [inferenceOpen, setInferenceOpen] = useState(true)
  
  // Screenplay tab state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editableScript, setEditableScript] = useState("")
  const [savedScripts, setSavedScripts] = useState<{id: string, name: string, content: string, dramatization: number, createdAt: Date}[]>([])
  const [copySuccess, setCopySuccess] = useState(false)
  
  // Upload tab state
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [uploadQueue, setUploadQueue] = useState<File[]>([])
  
  // Collab tab state
  const [teamMembers, setTeamMembers] = useState(TEAM_MEMBERS)
  const [activityLog, setActivityLog] = useState(ACTIVITY_LOG)
  const [inviteSending, setInviteSending] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Count enabled assets
  const enabledCount = [...caseEvidence, ...secondaryEvidence].filter(a => a.enabled).length
  const totalCount = caseEvidence.length + secondaryEvidence.length
  
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
  
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])
  
  if (!isOpen) return null
  
  const toggleAsset = (id: number, isCase: boolean) => {
    if (isCase) {
      setCaseEvidence(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
    } else {
      setSecondaryEvidence(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
    }
  }

  const toggleLane = (lane: string) => {
    setVisibleLanes(prev => {
      const next = new Set(prev)
      if (next.has(lane)) {
        next.delete(lane)
      } else {
        next.add(lane)
      }
      return next
    })
  }

  // ===== SCREENPLAY TAB HANDLERS =====
  
  const handleGenerateScript = async () => {
    setIsGenerating(true)
    setGeneratedScript(null)
    
    // Simulate AI generation with streaming effect
    const enabledAssets = [...caseEvidence, ...secondaryEvidence].filter(a => a.enabled)
    const assetNames = enabledAssets.map(a => a.name).join(", ")
    
    // Mock script based on dramatization level
    const scripts = {
      factual: `FADE IN:

INT. MANHATTAN FEDERAL COURTHOUSE - DAY

TITLE CARD: "December 4, 2024 - New York City"

The camera pans across the exterior of 500 Pearl Street. News vans line the street.

NARRATOR (V.O.)
On December 4, 2024, at approximately 6:45 AM, Brian Thompson, CEO of UnitedHealthcare, was shot outside the Hilton Midtown Manhattan.

CUT TO:

INT. COURTROOM 110 - DAY

Judge KATHERINE FAILLA presides. The defendant, LUIGI MANGIONE, 26, sits at the defense table.

PROSECUTOR
Your Honor, the United States charges the defendant with four counts...

Based on: ${assetNames}`,
      
      trueStory: `FADE IN:

EXT. HILTON MIDTOWN MANHATTAN - DAWN

TITLE CARD: "Based on True Events"

The glass doors reflect the first light of morning. A figure in a hoodie waits in the shadows.

NARRATOR (V.O.)
They called it the shot heard around corporate America. A single act that would expose fault lines in the American healthcare system.

The figure raises something metallic. Three shots. Silence.

CUT TO:

INT. ALTOONA, PENNSYLVANIA - MCDONALD'S - DAY (5 DAYS LATER)

A young man sits alone, laptop open. His face is calm, almost serene. This is LUIGI MANGIONE.

LUIGI (V.O.)
I wrote it all down. Every reason. Every justification. I knew they wouldn't understand at first.

Based on: ${assetNames}`,
      
      creative: `FADE IN:

BLACK SCREEN

The sound of a heartbeat. Slow. Steady. Then—three gunshots.

TITLE: "DENIAL"

INT. IVY LEAGUE LECTURE HALL - FLASHBACK - DAY

A younger LUIGI MANGIONE, brilliant and driven, sits in the front row. His back is straight, but his eyes are distant.

PROFESSOR (O.S.)
The Hippocratic oath states "first, do no harm." But what happens when the system itself becomes the harm?

Luigi's pen stops moving. Something shifts in his expression.

LUIGI (V.O.)
I was twenty-two when I understood that the American Dream had fine print. And I was twenty-six when I decided to read it aloud.

SMASH CUT TO:

EXT. NEW YORK CITY - AERIAL - DAWN

The city that never sleeps is about to wake up screaming.

Based on: ${assetNames}`
    }
    
    // Determine which script based on dramatization
    let script: string
    if (dramatization < 33) {
      script = scripts.factual
    } else if (dramatization < 66) {
      script = scripts.trueStory
    } else {
      script = scripts.creative
    }
    
    // Simulate streaming generation
    let currentText = ""
    const words = script.split(" ")
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30))
      currentText += (i === 0 ? "" : " ") + words[i]
      setGeneratedScript(currentText)
    }
    
    setIsGenerating(false)
    setEditableScript(script)
    
    // Log activity
    setActivityLog(prev => [{
      time: "Just now",
      user: "You",
      action: "generated script",
      target: `${dramLabel} (${dramatization}%)`,
      color: "var(--pink)"
    }, ...prev])
  }
  
  const handleEditScript = () => {
    setIsEditing(true)
    if (generatedScript) {
      setEditableScript(generatedScript)
    }
  }
  
  const handleSaveScript = () => {
    if (!generatedScript && !editableScript) return
    
    const newScript = {
      id: Date.now().toString(),
      name: `${dramLabel} Script - ${new Date().toLocaleDateString()}`,
      content: isEditing ? editableScript : (generatedScript || ""),
      dramatization,
      createdAt: new Date()
    }
    
    setSavedScripts(prev => [newScript, ...prev])
    setIsEditing(false)
    
    // Log activity
    setActivityLog(prev => [{
      time: "Just now",
      user: "You",
      action: "saved script",
      target: newScript.name,
      color: "var(--cyan)"
    }, ...prev])
  }
  
  const handleRegenerateScript = () => {
    setGeneratedScript(null)
    setEditableScript("")
    setIsEditing(false)
    handleGenerateScript()
  }
  
  const handleCopyScript = async () => {
    const textToCopy = isEditing ? editableScript : generatedScript
    if (!textToCopy) return
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }
  
  const handleShareScript = () => {
    // TODO: Integrate with share modal
    const textToShare = isEditing ? editableScript : generatedScript
    if (!textToShare) return
    
    // For now, copy a shareable summary
    const shareText = `LegalDrama.ai Script (${dramLabel} - ${dramatization}%)\n\n${textToShare.slice(0, 500)}...`
    navigator.clipboard.writeText(shareText)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  // ===== UPLOAD TAB HANDLERS =====
  
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const fileArray = Array.from(files)
    setUploadQueue(prev => [...prev, ...fileArray])
    
    // Simulate upload progress for each file
    fileArray.forEach((file, index) => {
      const fileId = `${file.name}-${Date.now()}-${index}`
      let progress = 0
      
      const interval = setInterval(() => {
        progress += Math.random() * 20
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          
          // Add to secondary evidence when complete
          const newEvidence = {
            id: Date.now() + index,
            name: file.name,
            tag: file.type.startsWith("video") ? "video" 
              : file.type.startsWith("audio") ? "audio"
              : file.type.startsWith("image") ? "photos"
              : "documents",
            detail: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            icon: file.type.startsWith("video") ? Video
              : file.type.startsWith("image") ? ImageIcon
              : file.type.startsWith("audio") ? Mic
              : FileText,
            color: "var(--cyan)",
            enabled: true
          }
          
          if (uploadMode === "case") {
            // Would need different structure, for now add to secondary
          }
          setSecondaryEvidence(prev => [...prev, newEvidence])
          
          // Log activity
          setActivityLog(prev => [{
            time: "Just now",
            user: "You",
            action: "uploaded",
            target: file.name,
            color: "var(--cyan)"
          }, ...prev])
          
          // Remove from progress tracking
          setTimeout(() => {
            setUploadProgress(prev => {
              const next = {...prev}
              delete next[fileId]
              return next
            })
          }, 500)
        }
        setUploadProgress(prev => ({...prev, [fileId]: progress}))
      }, 200)
    })
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = () => {
    setIsDragging(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  // ===== COLLAB TAB HANDLERS =====
  
  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return
    
    setInviteSending(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newMember = {
      id: Date.now(),
      name: inviteEmail.split("@")[0],
      role: inviteRole,
      online: false,
      color: "var(--cyan)"
    }
    
    setTeamMembers(prev => [...prev, newMember])
    setActivityLog(prev => [{
      time: "Just now",
      user: "You",
      action: "invited",
      target: inviteEmail,
      color: "var(--green)"
    }, ...prev])
    
    setInviteEmail("")
    setInviteSending(false)
  }
  
  const handleRemoveMember = (memberId: number) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return
    
    setTeamMembers(prev => prev.filter(m => m.id !== memberId))
    setActivityLog(prev => [{
      time: "Just now",
      user: "You",
      action: "removed",
      target: member.name,
      color: "var(--red)"
    }, ...prev])
  }
  
  const handleExportTimeline = () => {
    const timelineData = TIMELINE_EVENTS.map(e => ({
      date: e.date,
      title: e.title,
      lane: e.lane
    }))
    
    const csv = [
      "Date,Title,Lane",
      ...timelineData.map(e => `${e.date},"${e.title}",${e.lane}`)
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "legaldrama-timeline.csv"
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleExportDocket = () => {
    const docketData = DOCKET_ENTRIES.map(e => ({
      number: e.num,
      title: e.title,
      date: e.date
    }))
    
    const csv = [
      "Docket #,Title,Date",
      ...docketData.map(e => `${e.number},"${e.title}",${e.date}`)
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "legaldrama-docket.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // ===== QUICK ACTIONS HANDLERS =====
  
  const handleQuickAction = async (action: string) => {
    switch (action) {
      case "AI Summarize":
        // TODO: Integrate with AI summarization
        setActivityLog(prev => [{
          time: "Just now",
          user: "AI",
          action: "summarizing",
          target: "case materials",
          color: "var(--red)"
        }, ...prev])
        break
      case "Generate Script":
        setActiveTab("screenplay")
        handleGenerateScript()
        break
      case "Audio Summary":
        // TODO: Integrate with TTS
        break
      case "Export Timeline":
        handleExportTimeline()
        break
      case "View Characters":
        // TODO: Integrate with character profiles
        break
      case "Scene Rewrite":
        setActiveTab("screenplay")
        break
    }
  }
  
  const tabs = [
    { id: "upload", label: "UPLOAD", icon: Upload },
    { id: "organize", label: "ORGANIZE", icon: FolderOpen },
    { id: "screenplay", label: "SCREENPLAY", icon: Film },
    { id: "collab", label: "COLLAB", icon: Users },
  ] as const
  
  // Dramatization labels and colors
  const dramLabel = dramatization < 33 ? "Factual" : dramatization < 66 ? "True Story" : "Creative"
  const dramColor = dramatization < 33 ? "var(--green)" : dramatization < 66 ? "var(--orange)" : "var(--purple)"
  const dramText = dramatization < 33 
    ? "On December 4, 2024, Brian Thompson was shot outside the Hilton Midtown. Luigi Mangione was arrested and charged with four counts."
    : dramatization < 66 
    ? "The killing of a healthcare CEO sends shockwaves. Investigators piece together a manifesto and a portrait of calculated rage."
    : "A young graduate plans an act that will force the nation to confront corporate indifference. A manhunt, a trial, a reckoning."
  
  return (
    <div className="fixed inset-0 z-[100] animate-fade-in" style={{ animationDuration: '0.2s' }}>
      {/* Full-screen backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Full-screen modal container */}
      <div className="relative h-full flex flex-col animate-enter-up" style={{ animationDuration: '0.35s' }}>
        {/* Top Nav Bar */}
        <div className="relative z-10 bg-foreground dark:bg-surface border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-xl font-black text-background dark:text-foreground">legal</span>
              <span className="font-sans text-xl font-black text-red dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-pink dark:via-purple dark:to-cyan">drama</span>
              <span className="font-mono text-sm text-pink">.ai</span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Dark / Light mode toggle — always clickable */}
              <button
                onClick={onToggleTheme}
                className={cn(
                  "px-3 py-1.5 flex items-center gap-2",
                  "border-2 font-mono text-[10px] font-bold",
                  "transition-all duration-200 cursor-pointer",
                  isDark
                    ? "border-purple text-purple hover:bg-purple/20 shadow-[0_0_8px_var(--purple)]"
                    : "border-border text-muted-foreground hover:border-purple hover:text-purple"
                )}
              >
                <Moon size={12} />
                {mounted && isDark && <span className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse" />}
                DARK
              </button>
              <button
                onClick={onToggleTheme}
                className={cn(
                  "px-3 py-1.5 flex items-center gap-2",
                  "border-2 font-mono text-[10px] font-bold",
                  "transition-all duration-200 cursor-pointer",
                  !isDark
                    ? "border-orange text-orange hover:bg-orange/20 shadow-[0_0_8px_var(--orange)]"
                    : "border-border text-muted-foreground hover:border-orange hover:text-orange"
                )}
              >
                <Sun size={12} />
                {mounted && !isDark && <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />}
                LIGHT
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-border/50" />

              {/* Settings — always accessible */}
              <button
                onClick={() => { onOpenSettings?.(); }}
                className={cn(
                  "px-3 py-1.5 flex items-center gap-2",
                  "border-2 border-border text-muted-foreground",
                  "font-mono text-[10px] font-bold",
                  "hover:border-green hover:text-green hover:shadow-[0_0_8px_var(--green)] transition-all cursor-pointer"
                )}
              >
                <Settings size={12} className="group-hover:rotate-90 transition-transform" />
                SETTINGS
              </button>

              <div className="w-px h-6 bg-border/50" />

              <button className={cn(
                "px-3 py-1.5 flex items-center gap-2",
                "border-2 border-cyan text-cyan",
                "font-mono text-[10px] font-bold",
                "bg-cyan/10"
              )}>
                <Layers size={12} />
                MISSION-CONTROL
              </button>
            </div>
          </div>
        </div>
        
        {/* Case Header Bar */}
        <div className="relative z-10 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <h1 className="font-sans text-xl font-black">USA v. MANGIONE</h1>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-0.5 border border-border",
                  "font-mono text-[10px]",
                  ""
                )}>1:25-cr-00176-MMG</span>
                <span className={cn(
                  "px-2 py-0.5 border-2 border-cyan text-cyan",
                  "font-mono text-[10px] font-bold",
                  ""
                )}>S.D.N.Y.</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                <span className="font-mono text-xs text-muted-foreground">
                  Motion to Continue pending · Trial: <span className="text-red font-bold">Oct 13 &apos;26</span>
                </span>
              </div>
              <div className={cn(
                "px-3 py-1 border-2 border-border",
                "font-mono text-xs",
                ""
              )}>
                {enabledCount}/{totalCount} sources active
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Bar */}
        <div className="relative z-10 grid grid-cols-4 bg-card border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-4",
                "font-mono text-sm font-bold transition-all",
                "border-b-3 -mb-px",
                activeTab === tab.id
                  ? tab.id === "upload" 
                    ? "border-b-[3px] border-purple bg-purple/10 text-purple"
                    : tab.id === "organize"
                    ? "border-b-[3px] border-cyan bg-cyan/10 text-cyan"
                    : tab.id === "screenplay"
                    ? "border-b-[3px] border-pink bg-pink/10 text-pink"
                    : "border-b-[3px] border-green bg-green/10 text-green"
                  : "border-b-[3px] border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-alt"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Main Content - 3 Column Layout */}
        <div className="flex-1 flex overflow-hidden bg-background">
          {/* LEFT SIDEBAR - Inference Window (toggleable) */}
          <div className={cn(
            "border-r border-border overflow-y-auto bg-card transition-all duration-300",
            inferenceOpen ? "w-64" : "w-12"
          )}>
            {/* Collapse/expand toggle */}
            <button
              onClick={() => setInferenceOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 border-b border-border bg-surface-alt hover:bg-surface transition-colors"
            >
              {inferenceOpen ? (
                <>
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-red" />
                    <span className="font-mono text-[8px] font-bold text-red tracking-wider">INFERENCE</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* On/Off toggle switch */}
                    <div className="relative w-7 h-[14px] border-[2px] border-red bg-red/20">
                      <div className="absolute top-[1px] left-[11px] w-[8px] h-[8px] bg-red border-[1.5px] border-red transition-all duration-150" />
                    </div>
                    <ChevronLeft size={12} className="text-muted-foreground" />
                  </div>
                </>
              ) : (
                <div className="w-full flex flex-col items-center gap-1">
                  <Sparkles size={14} className="text-red" />
                  <div className="relative w-7 h-[14px] border-[2px] border-border bg-surface-alt">
                    <div className="absolute top-[1px] left-[1px] w-[8px] h-[8px] bg-muted-foreground border-[1.5px] border-border transition-all duration-150" />
                  </div>
                  <ChevronRight size={12} className="text-muted-foreground" />
                </div>
              )}
            </button>

            {inferenceOpen && (
            <div className="p-4">
              {/* Inference Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-red" />
                  <span className="font-mono text-[10px] font-bold text-red tracking-wider">INFERENCE WINDOW</span>
                </div>
                <span className={cn(
                  "px-1.5 py-0.5 bg-surface-alt",
                  "font-mono text-[10px]",
                  "rounded"
                )}>{enabledCount}</span>
              </div>

              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed mb-4">
                Toggle sources on/off to control what the AI sees. Active sources feed timelines, summaries, and screenplay generation.
              </p>
              
              {/* Case Evidence Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={12} className="text-red" />
                  <span className="font-mono text-[10px] font-bold text-red tracking-wider">CASE EVIDENCE</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{caseEvidence.filter(e => e.enabled).length}</span>
                </div>
                
                <div className="space-y-2">
                  {caseEvidence.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "relative flex items-start gap-3 p-3",
                        "border-l-[3px] transition-all cursor-pointer",
                        "-r-lg",
                        "hover:bg-surface-alt",
                        item.enabled ? "bg-surface-alt/50" : "opacity-60"
                      )}
                      style={{ 
                        borderLeftColor: item.enabled ? item.color : 'var(--border)'
                      }}
                    >
                      <item.icon size={14} className="mt-0.5 shrink-0" style={{ color: item.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[11px] font-medium truncate">{item.name}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={cn(
                            "px-1 py-0.5 text-[8px] font-bold",
                            "rounded",
                            item.date.includes("27/26") ? "bg-green/20 text-green" : "bg-surface-alt text-muted-foreground"
                          )}>{item.date}</span>
                          <span className="px-1 py-0.5 bg-surface-alt text-[8px] rounded">{item.type}</span>
                          <span className={cn(
                            "px-1 py-0.5 text-[8px] font-bold rounded",
                            item.tier === "T1" ? "bg-red/20 text-red" : "bg-surface-alt text-muted-foreground"
                          )}>{item.tier}</span>
                        </div>
                      </div>
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={() => toggleAsset(item.id, true)}
                        className="scale-75 shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Secondary Evidence Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={12} className="text-purple" />
                  <span className="font-mono text-[10px] font-bold text-purple tracking-wider">SECONDARY EVIDENCE</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{secondaryEvidence.filter(e => e.enabled).length}</span>
                </div>
                
                <div className="space-y-2">
                  {secondaryEvidence.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "relative flex items-start gap-3 p-3",
                        "border-l-[3px] transition-all cursor-pointer",
                        "-r-lg",
                        "hover:bg-surface-alt",
                        item.enabled ? "bg-surface-alt/50" : "opacity-60"
                      )}
                      style={{ 
                        borderLeftColor: item.enabled ? item.color : 'var(--border)'
                      }}
                    >
                      <item.icon size={14} className="mt-0.5 shrink-0" style={{ color: item.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[11px] font-medium truncate">{item.name}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-1 py-0.5 bg-surface-alt text-[8px] rounded">{item.tag}</span>
                        </div>
                        <div className="font-mono text-[9px] text-muted-foreground mt-1">{item.detail}</div>
                      </div>
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={() => toggleAsset(item.id, false)}
                        className="scale-75 shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
          </div>

          {/* CENTER - Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-background">
            {/* UPLOAD TAB */}
            {activeTab === "upload" && (
              <div className="space-y-6">
                {/* Upload Evidence Header */}
                <div className="flex items-center gap-2">
                  <Upload size={16} className="text-purple" />
                  <span className="font-mono text-xs font-bold text-purple tracking-wider">UPLOAD EVIDENCE</span>
                </div>
                
                {/* Case / Secondary Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setUploadMode("case")}
                    className={cn(
                      "px-4 py-2 flex items-center gap-2",
                      "font-mono text-xs font-bold",
                      "border-2 transition-all",
                      "",
                      uploadMode === "case"
                        ? "border-red bg-red text-white"
                        : "border-border text-foreground hover:border-red"
                    )}
                  >
                    <Flame size={14} />
                    CASE EVIDENCE
                  </button>
                  <button
                    onClick={() => setUploadMode("secondary")}
                    className={cn(
                      "px-4 py-2 flex items-center gap-2",
                      "font-mono text-xs font-bold",
                      "border-2 transition-all",
                      "",
                      uploadMode === "secondary"
                        ? "border-purple bg-purple text-white"
                        : "border-border text-foreground hover:border-purple"
                    )}
                  >
                    <Sparkles size={14} />
                    SECONDARY EVIDENCE
                  </button>
                </div>
                
                {/* Dropzone — compact */}
                <label
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed px-6 py-6 text-center transition-all cursor-pointer block",
                    isDragging
                      ? uploadMode === "case" ? "border-red bg-red/10" : "border-purple bg-purple/10"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    accept=".pdf,.docx,.doc,.mp4,.m4a,.mp3,.jpg,.jpeg,.png,.zip"
                  />
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-10 h-10 bg-surface-alt flex items-center justify-center shrink-0">
                      <Upload size={20} className={uploadMode === "case" ? "text-red" : "text-purple"} />
                    </div>
                    <div className="text-left">
                      <p className={cn("font-sans text-sm font-bold", uploadMode === "case" ? "text-red" : "text-purple")}>
                        Drop files here or click to browse
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        PDF · DOCX · MP4 · M4A · JPG · PNG · ZIP — up to 100MB
                      </p>
                    </div>
                  </div>
                </label>
                
                {/* Upload Progress */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="space-y-2 mt-4">
                    {Object.entries(uploadProgress).map(([fileId, progress]) => (
                      <div key={fileId} className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border">
                        <div className="w-8 h-8 rounded-lg bg-purple/20 flex items-center justify-center">
                          <FileText size={16} className="text-purple" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs">{fileId.split("-")[0]}</span>
                            <span className="font-mono text-xs text-muted-foreground">{Math.round(progress)}%</span>
                          </div>
                          <div className="h-1.5 bg-border rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple to-pink transition-all duration-200"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* AI Auto-Labeling */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={14} className="text-cyan" />
                    <span className="font-mono text-[10px] font-bold text-cyan tracking-wider">AI AUTO-LABELING</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {AI_CAPABILITIES.map((cap, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2",
                          "border border-border bg-card",
                          "",
                          "hover:border-current transition-colors cursor-pointer"
                        )}
                        style={{ color: cap.color }}
                      >
                        <cap.icon size={14} />
                        <span className="font-mono text-[10px]">{cap.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* ═══ MOOD BOARD — Expanded Visual Taxonomy ═══ */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Grid3X3 size={14} className="text-orange" />
                      <span className="font-mono text-[10px] font-bold text-orange tracking-wider">MOOD BOARD — SCENE REFERENCE LIBRARY</span>
                      <span className="px-1.5 py-0.5 bg-orange/10 border border-orange/30 font-mono text-[8px] font-bold text-orange">{MOOD_CATEGORIES.length} BOARDS</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="px-2 py-1 border border-border font-mono text-[8px] text-muted-foreground hover:text-foreground transition-colors">
                        <Grid3X3 size={10} />
                      </button>
                      <button className="px-2 py-1 border border-border font-mono text-[8px] text-muted-foreground hover:text-foreground transition-colors">
                        <List size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Masonry-style mood grid — 4 columns, varied heights */}
                  <div className="grid grid-cols-4 gap-3">
                    {MOOD_CATEGORIES.map((cat, i) => {
                      // Vary card heights for visual interest
                      const isLarge = i === 0 || i === 9 || i === 4
                      const isMedium = i === 1 || i === 5 || i === 11
                      return (
                        <div
                          key={cat.id}
                          className={cn(
                            "group border-2 border-border bg-surface-alt/30 overflow-hidden",
                            "hover:border-current cursor-pointer transition-all",
                            "hover:shadow-[0_0_12px_-4px_currentColor]",
                            isLarge ? "row-span-2" : ""
                          )}
                          style={{ color: cat.color }}
                        >
                          {/* Visual area */}
                          <div
                            className={cn(
                              "relative flex items-center justify-center bg-gradient-to-br from-surface-alt to-border/30",
                              isLarge ? "h-32" : isMedium ? "h-20" : "h-16"
                            )}
                          >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-current/5" />
                            <span className="font-mono text-[8px] font-bold opacity-20 uppercase">{cat.tag}</span>
                            {/* Asset count badge */}
                            <div className="absolute top-1.5 right-1.5 px-1 py-0.5 bg-black/50 backdrop-blur-sm font-mono text-[7px] font-bold text-white">
                              {cat.assets}
                            </div>
                          </div>
                          {/* Label */}
                          <div className="px-2 py-1.5 border-t border-border/50">
                            <div className="font-mono text-[9px] font-bold text-foreground truncate">{cat.name}</div>
                            <div className="font-mono text-[7px] text-muted-foreground">{cat.assets} reference{cat.assets !== 1 ? "s" : ""}</div>
                          </div>
                        </div>
                      )
                    })}
                    {/* Add new board */}
                    <div className="border-2 border-dashed border-purple/40 flex flex-col items-center justify-center py-6 hover:border-purple hover:bg-purple/5 cursor-pointer transition-all">
                      <Plus size={18} className="text-purple mb-1" />
                      <span className="font-mono text-[9px] text-purple font-bold">New Board</span>
                    </div>
                  </div>
                </div>

                {/* ═══ LEGAL INTELLIGENCE — Expert Features ═══ */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Scale size={14} className="text-green" />
                    <span className="font-mono text-[10px] font-bold text-green tracking-wider">LEGAL INTELLIGENCE</span>
                    <span className="px-1.5 py-0.5 bg-green/10 border border-green/30 font-mono text-[8px] font-bold text-green animate-pulse">LIVE</span>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {LEGAL_INTELLIGENCE.map((metric) => (
                      <div key={metric.id} className="border-2 border-border bg-card p-3 hover:border-current transition-colors group cursor-default" style={{ borderLeftColor: metric.color, borderLeftWidth: '3px' }}>
                        <div className="font-mono text-[8px] text-muted-foreground uppercase tracking-wider mb-1">{metric.label}</div>
                        <div className="flex items-end gap-1.5">
                          <span className="font-sans text-xl font-black" style={{ color: metric.color }}>{metric.value}</span>
                          <span className="font-mono text-[9px] text-muted-foreground mb-0.5">{metric.unit}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp size={8} style={{ color: metric.color }} />
                          <span className="font-mono text-[8px]" style={{ color: metric.color }}>{metric.trend}</span>
                        </div>
                        <div className="font-mono text-[7px] text-muted-foreground mt-1">{metric.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* Precedent Matches */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BookMarked size={12} className="text-purple" />
                      <span className="font-mono text-[9px] font-bold text-purple tracking-wider">PRECEDENT RADAR</span>
                    </div>
                    <div className="space-y-1.5">
                      {PRECEDENT_MATCHES.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2 border border-border bg-card hover:bg-surface-alt transition-colors cursor-pointer group">
                          {/* Relevance bar */}
                          <div className="w-8 text-right">
                            <span className="font-mono text-[10px] font-bold" style={{ color: p.color }}>{p.relevance}</span>
                          </div>
                          <div className="w-16 h-1.5 bg-border overflow-hidden">
                            <div className="h-full transition-all" style={{ width: `${p.relevance}%`, backgroundColor: p.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-foreground group-hover:underline">{p.case}</span>
                            <span className="font-mono text-[8px] text-muted-foreground ml-2">{p.court}</span>
                          </div>
                          <span className="px-1.5 py-0.5 font-mono text-[7px] font-bold shrink-0" style={{ color: p.color, backgroundColor: `color-mix(in srgb, ${p.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${p.color} 30%, transparent)` }}>{p.tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FRCP Quick Reference */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileSearch size={12} className="text-cyan" />
                      <span className="font-mono text-[9px] font-bold text-cyan tracking-wider">FED. R. CRIM. P. — APPLICABLE</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {FRCP_QUICK_REF.map((rule, i) => (
                        <div
                          key={i}
                          className={cn(
                            "px-2 py-2 border bg-card cursor-pointer transition-all",
                            rule.active
                              ? "border-cyan/40 hover:border-cyan hover:bg-cyan/5"
                              : "border-border opacity-50 hover:opacity-80"
                          )}
                        >
                          <div className="font-mono text-[9px] font-bold text-cyan">{rule.rule}</div>
                          <div className="font-mono text-[8px] text-foreground truncate">{rule.title}</div>
                          <div className="font-mono text-[7px] text-muted-foreground mt-0.5">{rule.deadline}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* ORGANIZE TAB */}
            {activeTab === "organize" && (
              <div className="space-y-6">
                {/* Timelines Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-cyan" />
                        <span className="font-mono text-xs font-bold tracking-wider">TIMELINES</span>
                      </div>
                      <button className={cn(
                        "px-3 py-1 flex items-center gap-1",
                        "bg-surface-alt text-foreground",
                        "font-mono text-[10px] font-bold",
                        "",
                        "border border-border"
                      )}>
                        <ChevronDown size={12} />
                        VISIBLE
                      </button>
                    </div>
                    
                    {/* Lane Filters */}
                    <div className="flex items-center gap-2">
                      {Object.entries(LANES).map(([key, lane]) => (
                        <button
                          key={key}
                          onClick={() => toggleLane(key)}
                          className={cn(
                            "px-3 py-1.5 flex items-center gap-2",
                            "font-mono text-[10px] font-bold",
                            "border-2 transition-all",
                            "",
                            visibleLanes.has(key)
                              ? "border-current bg-current/10"
                              : "border-border text-muted-foreground opacity-50"
                          )}
                          style={{ color: visibleLanes.has(key) ? lane.color : undefined }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: lane.color }}
                          />
                          {lane.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Timeline Chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {TIMELINE_EVENTS.filter(e => visibleLanes.has(e.lane)).map((event, i) => (
                      <div
                        key={i}
                        className={cn(
                          "px-3 py-2 flex items-center gap-2",
                          "border-2 bg-card",
                          "",
                          "cursor-pointer hover:shadow-md transition-all"
                        )}
                        style={{ 
                          borderColor: LANES[event.lane as keyof typeof LANES].color,
                          borderLeftWidth: '4px'
                        }}
                      >
                        <span className="font-mono text-[10px] font-bold" style={{ color: LANES[event.lane as keyof typeof LANES].color }}>
                          {event.date}
                        </span>
                        <span className="font-mono text-[11px]">{event.title}</span>
                        <MoreHorizontal size={14} className="text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Case Docket Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={14} className="text-purple" />
                    <span className="font-mono text-xs font-bold text-purple tracking-wider">CASE DOCKET</span>
                    <span className={cn(
                      "px-1.5 py-0.5 bg-purple/20 text-purple",
                      "font-mono text-[10px] font-bold",
                      "rounded"
                    )}>{DOCKET_ENTRIES.length}</span>
                  </div>
                  
                  <div className="border border-border  overflow-hidden">
                    {DOCKET_ENTRIES.map((entry, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3 border-b border-border last:border-0",
                          "hover:bg-surface-alt transition-colors cursor-pointer",
                          entry.indent && "pl-8"
                        )}
                      >
                        {entry.num > 0 && (
                          <span className={cn(
                            "w-8 text-right font-mono text-sm font-bold",
                            entry.num === 105 ? "text-yellow" : "text-purple"
                          )}>{entry.num}</span>
                        )}
                        {entry.num === 0 && <span className="w-8" />}
                        <span className="flex-1 font-mono text-sm">{entry.title}</span>
                        <span className="font-mono text-xs text-muted-foreground">{entry.date}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => handleQuickAction("AI Summarize")}
                      className={cn(
                        "px-4 py-2 flex items-center gap-2",
                        "bg-red text-white",
                        "font-mono text-xs font-bold",
                        "",
                        "hover:bg-red/90 transition-colors"
                      )}
                    >
                      <Sparkles size={14} />
                      AI Summarize
                    </button>
                    <button 
                      onClick={() => handleQuickAction("Generate Script")}
                      className={cn(
                        "px-4 py-2 flex items-center gap-2",
                        "border-2 border-border",
                        "font-mono text-xs font-bold",
                        "",
                        "hover:border-purple hover:text-purple transition-colors"
                      )}
                    >
                      <Film size={14} />
                      Generate Treatment
                    </button>
                    <button 
                      onClick={() => handleQuickAction("Audio Summary")}
                      className={cn(
                        "px-4 py-2 flex items-center gap-2",
                        "border-2 border-border",
                        "font-mono text-xs font-bold",
                        "",
                        "hover:border-cyan hover:text-cyan transition-colors"
                      )}
                    >
                      <Volume2 size={14} />
                      Audio Summary
                    </button>
                    <button 
                      onClick={handleExportDocket}
                      className={cn(
                        "px-4 py-2 flex items-center gap-2",
                        "border-2 border-border",
                        "font-mono text-xs font-bold",
                        "",
                        "hover:border-green hover:text-green transition-colors"
                      )}
                    >
                      <Download size={14} />
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* SCREENPLAY TAB */}
            {activeTab === "screenplay" && (
              <div className="space-y-8">
                {/* Dramatization Engine Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink/30 to-purple/30 flex items-center justify-center">
                      <Wand2 size={20} className="text-pink" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-pink tracking-widest">DRAMATIZATION ENGINE</span>
                      <h3 className="font-sans text-xl font-black text-foreground">Dramatization Level</h3>
                    </div>
                  </div>
                  {savedScripts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{savedScripts.length} saved</span>
                      <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
                    </div>
                  )}
                </div>
                
                {/* Dramatization Slider - Fun and Pop */}
                <div className="relative">
                  {/* Gradient track background */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 rounded-full bg-gradient-to-r from-green via-orange to-purple opacity-30" />
                  
                  {/* Active track fill */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-3 rounded-l-full transition-all duration-300"
                    style={{ 
                      width: `${dramatization}%`,
                      background: `linear-gradient(90deg, var(--green) 0%, var(--orange) 50%, var(--purple) 100%)`,
                      boxShadow: `0 0 20px ${dramColor}40`
                    }}
                  />
                  
                  {/* Slider input */}
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={dramatization}
                    onChange={(e) => setDramatization(Number(e.target.value))}
                    disabled={isGenerating}
                    className="relative w-full h-3 appearance-none cursor-pointer bg-transparent z-10 
                      [&::-webkit-slider-thumb]:appearance-none 
                      [&::-webkit-slider-thumb]:w-6 
                      [&::-webkit-slider-thumb]:h-6 
                      [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:bg-white 
                      [&::-webkit-slider-thumb]:border-4 
                      [&::-webkit-slider-thumb]:border-pink 
                      [&::-webkit-slider-thumb]:shadow-lg
                      [&::-webkit-slider-thumb]:shadow-pink/30
                      [&::-webkit-slider-thumb]:cursor-grab
                      [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:hover:scale-110
                      [&::-webkit-slider-thumb]:active:cursor-grabbing
                      [&::-moz-range-thumb]:w-6 
                      [&::-moz-range-thumb]:h-6 
                      [&::-moz-range-thumb]:rounded-full 
                      [&::-moz-range-thumb]:bg-white 
                      [&::-moz-range-thumb]:border-4 
                      [&::-moz-range-thumb]:border-pink
                      [&::-moz-range-thumb]:shadow-lg
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  
                  {/* Labels */}
                  <div className="flex justify-between mt-3">
                    <span className="font-mono text-xs font-bold text-green">Factual</span>
                    <span className="font-mono text-xs font-bold text-orange">Dramatized</span>
                    <span className="font-mono text-xs font-bold text-purple">Creative</span>
                  </div>
                </div>
                
                {/* Current Level Badge */}
                <div className="flex items-center gap-4">
                  <div 
                    className="px-5 py-2.5 rounded-lg font-mono text-sm font-black transition-all duration-300"
                    style={{ 
                      backgroundColor: `color-mix(in srgb, ${dramColor} 20%, transparent)`,
                      color: dramColor,
                      boxShadow: `0 0 20px ${dramColor}30`
                    }}
                  >
                    {dramLabel} - {dramatization}%
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <span className="font-mono text-xs text-muted-foreground">
                    {enabledCount} assets selected
                  </span>
                </div>
                
                {/* Treatment Preview OR Generated Script */}
                {!generatedScript && !isGenerating ? (
                  <div className="relative group">
                    <div 
                      className="absolute inset-0 rounded-xl opacity-50 blur-xl transition-opacity group-hover:opacity-70"
                      style={{ background: `linear-gradient(135deg, ${dramColor}20, transparent)` }}
                    />
                    <div className={cn(
                      "relative p-6 border-2 border-l-4 rounded-xl",
                      "bg-card/50 backdrop-blur-sm"
                    )}
                    style={{ borderLeftColor: dramColor }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Eye size={14} style={{ color: dramColor }} />
                        <span className="font-mono text-[10px] font-bold tracking-widest" style={{ color: dramColor }}>
                          TREATMENT PREVIEW
                        </span>
                      </div>
                      <p className="font-serif text-lg italic text-foreground/90 leading-relaxed">
                        {dramText}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div 
                      className="absolute inset-0 rounded-xl opacity-30 blur-xl"
                      style={{ background: `linear-gradient(135deg, ${dramColor}20, transparent)` }}
                    />
                    <div className={cn(
                      "relative border-2 border-l-4 rounded-xl",
                      "bg-card/80 backdrop-blur-sm",
                      isEditing && "ring-2 ring-pink/50"
                    )}
                    style={{ borderLeftColor: dramColor }}
                    >
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <div className="flex items-center gap-2">
                          <Film size={14} style={{ color: dramColor }} />
                          <span className="font-mono text-[10px] font-bold tracking-widest" style={{ color: dramColor }}>
                            {isGenerating ? "GENERATING SCRIPT..." : isEditing ? "EDITING SCRIPT" : "GENERATED SCRIPT"}
                          </span>
                          {isGenerating && (
                            <div className="w-4 h-4 border-2 border-pink border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                        {!isGenerating && (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {dramLabel} - {dramatization}%
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <textarea
                          value={editableScript}
                          onChange={(e) => setEditableScript(e.target.value)}
                          className="w-full h-64 p-6 bg-transparent font-mono text-sm text-foreground/90 leading-relaxed resize-none focus:outline-none"
                          placeholder="Edit your script here..."
                        />
                      ) : (
                        <div className="p-6 max-h-64 overflow-y-auto">
                          <pre className="font-mono text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {generatedScript}
                            {isGenerating && <span className="inline-block w-2 h-4 bg-pink animate-pulse ml-1" />}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleGenerateScript}
                      disabled={isGenerating}
                      className={cn(
                        "px-6 py-3 flex items-center gap-2",
                        "bg-gradient-to-r from-pink to-purple text-white",
                        "font-mono text-sm font-bold",
                        "rounded-lg shadow-lg shadow-pink/20",
                        "hover:shadow-xl hover:shadow-pink/30 hover:scale-[1.02]",
                        "active:scale-[0.98] transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      )}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Generate Script
                        </>
                      )}
                    </button>
                    <button 
                      onClick={isEditing ? () => setIsEditing(false) : handleEditScript}
                      disabled={!generatedScript || isGenerating}
                      className={cn(
                        "px-4 py-3 flex items-center gap-2",
                        "border-2 text-foreground",
                        "font-mono text-sm font-bold",
                        "rounded-lg transition-all duration-200",
                        isEditing 
                          ? "border-pink text-pink bg-pink/10" 
                          : "border-border hover:border-pink hover:text-pink",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <Edit3 size={16} />
                      {isEditing ? "Done" : "Edit"}
                    </button>
                    <button 
                      onClick={handleSaveScript}
                      disabled={(!generatedScript && !editableScript) || isGenerating}
                      className={cn(
                        "px-4 py-3 flex items-center gap-2",
                        "border-2 border-border text-foreground",
                        "font-mono text-sm font-bold",
                        "rounded-lg hover:border-cyan hover:text-cyan",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button 
                      onClick={handleRegenerateScript}
                      disabled={!generatedScript || isGenerating}
                      className={cn(
                        "px-4 py-3 flex items-center gap-2",
                        "border-2 border-border text-foreground",
                        "font-mono text-sm font-bold",
                        "rounded-lg hover:border-orange hover:text-orange",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
                      Regenerate
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleCopyScript}
                      disabled={!generatedScript || isGenerating}
                      className={cn(
                        "px-4 py-3 flex items-center gap-2",
                        "border-2 text-foreground",
                        "font-mono text-sm font-bold",
                        "rounded-lg transition-all duration-200",
                        copySuccess 
                          ? "border-green text-green bg-green/10" 
                          : "border-border hover:border-foreground",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                      {copySuccess ? "Copied!" : "Copy"}
                    </button>
                    <button 
                      onClick={handleShareScript}
                      disabled={!generatedScript || isGenerating}
                      className={cn(
                        "px-4 py-3 flex items-center gap-2",
                        "border-2 border-border text-foreground",
                        "font-mono text-sm font-bold",
                        "rounded-lg hover:border-foreground",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
                
                {/* Saved Scripts */}
                {savedScripts.length > 0 && (
                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers size={14} className="text-cyan" />
                      <span className="font-mono text-[10px] font-bold text-cyan tracking-widest">SAVED SCRIPTS</span>
                    </div>
                    <div className="space-y-2">
                      {savedScripts.slice(0, 3).map((script) => (
                        <div 
                          key={script.id}
                          className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border hover:border-cyan/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setGeneratedScript(script.content)
                            setEditableScript(script.content)
                            setDramatization(script.dramatization)
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Film size={14} className="text-muted-foreground" />
                            <span className="font-mono text-sm">{script.name}</span>
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">
                            {script.dramatization}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* COLLAB TAB */}
            {activeTab === "collab" && (
              <div className="space-y-6">
                {/* Collaboration Header */}
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green" />
                  <span className="font-mono text-xs font-bold text-green tracking-wider">COLLABORATION</span>
                </div>
                
                {/* Invite Section */}
                <div className="border border-border  p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-purple" />
                    <span className="font-mono text-[10px] font-bold text-purple tracking-wider">INVITE TO CASE</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className={cn(
                        "flex-1 px-4 py-3 bg-surface-alt",
                        "border border-border",
                        "font-mono text-sm placeholder:text-muted-foreground",
                        "",
                        "focus:outline-none focus:border-green"
                      )}
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className={cn(
                        "px-4 py-3 bg-surface-alt",
                        "border border-border",
                        "font-mono text-sm",
                        "",
                        "focus:outline-none focus:border-green"
                      )}
                    >
                      <option>Collaborator</option>
                      <option>Viewer</option>
                      <option>Admin</option>
                    </select>
                    <button 
                      onClick={handleInviteMember}
                      disabled={inviteSending || !inviteEmail.trim()}
                      className={cn(
                        "px-6 py-3",
                        "bg-green text-white",
                        "font-mono text-sm font-bold",
                        "",
                        "hover:bg-green/90 transition-colors",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {inviteSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "INVITE"
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Eye size={10} className="text-cyan" />
                      Viewer — Read only
                    </span>
                    <span className="flex items-center gap-1">
                      <Edit3 size={10} className="text-yellow" />
                      Collaborator — Add/edit evidence
                    </span>
                    <span className="flex items-center gap-1">
                      <Settings size={10} className="text-green" />
                      Admin — Full control + sharing
                    </span>
                  </div>
                </div>
                
                {/* Team Section */}
                <div className="border border-border  p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={14} className="text-yellow" />
                    <span className="font-mono text-[10px] font-bold text-yellow tracking-wider">TEAM</span>
                  </div>
                  
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-surface-alt  group"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-bold">{member.name}</span>
                              {member.online && (
                                <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                              )}
                            </div>
                            <span 
                              className={cn(
                                "px-2 py-0.5 text-[10px] font-mono font-bold rounded",
                                member.role === "Admin" ? "bg-green/20 text-green" : "bg-purple/20 text-purple"
                              )}
                            >
                              {member.role}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-muted-foreground hover:text-red opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove member"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Activity Log */}
                <div className="border border-border  p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={14} className="text-cyan" />
                    <span className="font-mono text-[10px] font-bold text-cyan tracking-wider">ACTIVITY LOG</span>
                  </div>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {activityLog.map((entry, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <span className="font-mono text-[10px] text-muted-foreground w-16 shrink-0">{entry.time}</span>
                        <div className="font-mono text-sm">
                          <span className="font-bold">{entry.user}</span>
                          {" "}
                          <span style={{ color: entry.color }}>{entry.action}</span>
                          {" "}
                          <span className="text-muted-foreground">{entry.target}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* RIGHT SIDEBAR - Quick Actions */}
          <div className="w-56 border-l border-border overflow-y-auto bg-card p-4">
            {/* Quick Actions */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-yellow" />
                <span className="font-mono text-[10px] font-bold text-yellow tracking-wider">QUICK ACTIONS</span>
              </div>
              
              <div className="space-y-2">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.label)}
                    className={cn(
                      "quick-action-btn",
                      "w-full flex items-center gap-3 px-3 py-2.5",
                      "border border-border bg-card",
                      "",
                      "hover:border-current hover:shadow-[inset_0_0_20px_-10px_currentColor] transition-all",
                      "text-left group"
                    )}
                    style={{ color: action.color }}
                  >
                    <action.icon size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Integrations */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Link2 size={14} className="text-purple" />
                <span className="font-mono text-[10px] font-bold text-purple tracking-wider">INTEGRATIONS</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-2 rounded hover:bg-surface-alt transition-colors">
                  <span className="font-mono text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green connected-indicator" />
                    PACER
                  </span>
                  <span className="font-mono text-[10px] text-green font-bold">Connected</span>
                </div>
                <div className="flex items-center justify-between py-2 px-2 rounded hover:bg-surface-alt transition-colors cursor-pointer">
                  <span className="font-mono text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground opacity-50" />
                    ECF
                  </span>
                  <span className="font-mono text-[10px] text-red">Not linked</span>
                </div>
                <div className="flex items-center justify-between py-2 px-2 rounded hover:bg-surface-alt transition-colors cursor-pointer">
                  <span className="font-mono text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground opacity-50" />
                    DocketBird
                  </span>
                  <span className="font-mono text-[10px] text-red">Not linked</span>
                </div>
              </div>
              
              <button
                onClick={() => { onOpenSettings?.(); }}
                className={cn(
                  "w-full mt-4 py-2 flex items-center justify-center gap-2",
                  "border border-border",
                  "font-mono text-[10px] text-muted-foreground",
                  "hover:border-green hover:text-green hover:shadow-[0_0_8px_var(--green)] transition-all cursor-pointer"
                )}
              >
                <Settings size={12} />
                Manage Integrations
              </button>
            </div>

            {/* ═══ LEGAL INTEL — RIGHT SIDEBAR ═══ */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={12} className="text-green" />
                <span className="font-mono text-[8px] font-bold text-green tracking-wider">CASE PULSE</span>
              </div>

              {/* Case Strength Meter */}
              <div className="mb-3 p-2.5 bg-surface-alt border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[8px] text-muted-foreground">STRENGTH</span>
                  <span className="font-mono text-[10px] font-bold text-green">72%</span>
                </div>
                <div className="h-2 bg-border overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red via-orange to-green" style={{ width: '72%' }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[7px] text-muted-foreground">Weak</span>
                  <span className="font-mono text-[7px] text-muted-foreground">Strong</span>
                </div>
              </div>

              {/* Deadline Countdown */}
              <div className="mb-3 p-2.5 border border-red/30 bg-red/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Timer size={10} className="text-red" />
                  <span className="font-mono text-[8px] font-bold text-red">NEXT DEADLINE</span>
                </div>
                <div className="font-mono text-[11px] font-bold text-foreground">Mot. in Limine</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground">Apr 25, 2026</span>
                  <span className="px-1.5 py-0.5 bg-red text-white font-mono text-[8px] font-bold">17 DAYS</span>
                </div>
              </div>

              {/* Judge Analytics Mini */}
              <div className="mb-3 p-2.5 bg-surface-alt border border-border">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Gavel size={10} className="text-cyan" />
                  <span className="font-mono text-[8px] font-bold text-cyan">JUDGE GENTRY</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] text-muted-foreground">Govt win rate</span>
                    <span className="font-mono text-[9px] font-bold text-cyan">64%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] text-muted-foreground">Avg. sentence</span>
                    <span className="font-mono text-[9px] font-bold text-orange">+12% above guideline</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] text-muted-foreground">Suppress. denied</span>
                    <span className="font-mono text-[9px] font-bold text-red">78%</span>
                  </div>
                </div>
              </div>

              {/* Shepardize Signal */}
              <div className="p-2.5 bg-surface-alt border border-border">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Activity size={10} className="text-purple" />
                  <span className="font-mono text-[8px] font-bold text-purple">CITE CHECK</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green" />
                    <span className="font-mono text-[8px]">12 valid citations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange" />
                    <span className="font-mono text-[8px]">3 questioned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red" />
                    <span className="font-mono text-[8px]">1 overruled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Close button floating */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-20 right-4 z-20",
            "px-4 py-2 flex items-center gap-2",
            "bg-red text-white",
            "font-mono text-xs font-bold",
            "",
            "hover:bg-red/90 transition-colors shadow-lg"
          )}
        >
          <X size={14} />
          CLOSE
        </button>
      </div>
    </div>
  )
}
