"use client"

import { useState, useCallback, useRef, useEffect, useMemo, Fragment } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Bookmark, Star, ChevronLeft, ChevronRight,
  Play, Pause, Pencil, Check, X, Share, Download, Settings,
  Database, FileText, Clock, Users, Sparkles, Plus, Minus,
  RefreshCw, Loader2, ExternalLink, Copy, Eye, MessageSquare,
  Lock, Unlock, Save, RotateCcw, Wand2, AlertTriangle,
  Search, Filter, ChevronDown, Zap, Calendar, Target, Layers,
  Volume2, VolumeX, Flame, Scale, BookOpen, LayoutGrid, List,
  ChevronUp, Info, Radio, Maximize2, Minimize2, Hash, ArrowRight, Upload, Folder,
  MapPin
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LegalButton, LegalCard, Chip, ToastProvider, useToast, LegalInput, LegalTabs } from "@/components/legal-ui"
import {
  FULL_DOCKET_ENTRIES, CHAPTER_DATA, CHARACTER_PROFILES, LOCATION_PROFILES, TIMELINE_EVENTS,
  type DocketEntry, type Chapter, type ChapterSection, type DramaLevel, getDatePercent, getLaneColor
} from "@/lib/case-data"

import { SettingsModal } from "@/components/settings-modal"
import { ShareModal } from "@/components/share-modal"
import { ContentModal } from "@/components/content-modal"
import { SidebarChat } from "@/components/sidebar-chat"
import { DramaLevelSlider } from "@/components/drama-level-slider"
import { SiteFooter } from "@/components/site-footer"
import { Masthead } from "@/components/masthead"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"

// Lane definitions for timeline
const LANES = [
  { id: "factual", label: "FACTUAL", color: "var(--lane-factual)", icon: Flame },
  { id: "procedural", label: "PROCEDURAL", color: "var(--lane-procedural)", icon: Scale },
  { id: "scheduling", label: "SCHEDULING", color: "var(--lane-scheduling)", icon: Calendar },
  { id: "narrative", label: "NARRATIVE", color: "var(--lane-narrative)", icon: BookOpen },
] as const

type LaneId = (typeof LANES)[number]["id"]
type ViewTab = "all" | "screenplay" | "docket" | "timeline" | "characters"

// AI Summary content for docket entries
const AI_SUMMARIES: Record<number, { text: string; keyPoints: string[] }> = {
  1: {
    text: "The sealed criminal complaint initiates federal prosecution against Luigi Mangione for the murder of Brian Thompson. Filed under seal to protect the ongoing investigation, this document establishes federal jurisdiction through interstate stalking charges.",
    keyPoints: ["Federal jurisdiction established", "Charges under 18 USC 1959", "Sealed to protect investigation"]
  },
  5: {
    text: "Defendant's initial appearance before the Magistrate Judge where bail and detention issues are first addressed. The government argues for detention based on flight risk and danger to community.",
    keyPoints: ["Detention requested by government", "Defense requests bail hearing", "Counsel appointed"]
  },
  22: {
    text: "The grand jury returns a four-count indictment charging murder in aid of stalking, stalking, and two firearms offenses. This supersedes the original complaint with more detailed charges.",
    keyPoints: ["4 counts total", "Murder in aid of stalking (Count 1)", "Firearms charges (Counts 3-4)"]
  },
  25: {
    text: "The government formally notifies the court and defense of its intent to seek the death penalty. This triggers additional procedural requirements and defense resources.",
    keyPoints: ["Death penalty authorized", "Additional defense resources triggered", "Capital case procedures apply"]
  },
}

function CaseWorkspaceContent() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, signIn, signOut } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Main state - default to "all" view
  const [activeTab, setActiveTab] = useState<ViewTab>("all")
  const [dramatization, setDramatization] = useState(50)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  // Screenplay editing state
  const [chapters, setChapters] = useState<Chapter[]>(CHAPTER_DATA)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editBuffer, setEditBuffer] = useState("")
  const [lockedSections, setLockedSections] = useState<Set<string>>(new Set())
  const [starredSections, setStarredSections] = useState<Set<string>>(new Set())

  // Docket state
  const [docketEntries] = useState<DocketEntry[]>(FULL_DOCKET_ENTRIES)
  const [docketFilter, setDocketFilter] = useState<"all" | "motion" | "order" | "notice" | "filing" | "hearing">("all")
  const [docketSearch, setDocketSearch] = useState("")
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set())
  const [isPACERSyncing, setIsPACERSyncing] = useState(false)
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)
  const [playingAudio, setPlayingAudio] = useState<number | null>(null)

  // Timeline state
  const [timelineZoom, setTimelineZoom] = useState(1)
  const [visibleLanes, setVisibleLanes] = useState<Set<LaneId>>(new Set(LANES.map((l) => l.id)))
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // View state
  const [compactView, setCompactView] = useState(false)

  // Per-character drama level (0 = Court Record, 4 = Mythic). Defaults to 0.
  const [charLevels, setCharLevels] = useState<Record<string, DramaLevel>>({})

  // Per-location drama level. Same axis as characters.
  const [locLevels, setLocLevels] = useState<Record<string, DramaLevel>>({})

  // Modal state
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [contentModalOpen, setContentModalOpen] = useState(false)
  const [contentModalTab, setContentModalTab] = useState<"upload" | "organize" | "collab">("upload")
  

  // Current chapter & section
  const currentChapter = chapters[currentChapterIndex]
  const currentSection = currentChapter?.sections[currentSectionIndex]

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentSectionIndex((prev) => {
        const nextSection = prev + 1
        if (nextSection >= currentChapter.sections.length) {
          setCurrentChapterIndex((ci) => {
            const nextChapter = ci + 1
            if (nextChapter >= chapters.length) {
              setIsPlaying(false)
              return ci
            }
            return nextChapter
          })
          return 0
        }
        return nextSection
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [isPlaying, currentChapter, chapters.length])

  // Dramatization label & color
  const dramLabel = dramatization < 33 ? "Factual" : dramatization < 66 ? "Dramatized" : "Creative"
  const dramColor = dramatization < 33 ? "var(--green)" : dramatization < 66 ? "var(--orange)" : "var(--purple)"

  // Handlers
  const handlePrevSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1)
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1)
      setCurrentSectionIndex(chapters[currentChapterIndex - 1].sections.length - 1)
    }
  }, [currentSectionIndex, currentChapterIndex, chapters])

  const handleNextSection = useCallback(() => {
    if (currentSectionIndex < currentChapter.sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1)
    } else if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1)
      setCurrentSectionIndex(0)
    }
  }, [currentSectionIndex, currentChapter, currentChapterIndex, chapters.length])

  const handleEditSection = useCallback(
    (sectionId: string, content: string) => {
      if (lockedSections.has(sectionId)) {
        toast("Section is locked", "var(--orange)")
        return
      }
      setEditingSection(sectionId)
      setEditBuffer(content)
    },
    [lockedSections, toast]
  )

  const handleSaveEdit = useCallback(() => {
    if (!editingSection) return
    setChapters((prev) =>
      prev.map((ch) => ({
        ...ch,
        sections: ch.sections.map((s) => (s.id === editingSection ? { ...s, content: editBuffer } : s)),
      }))
    )
    setEditingSection(null)
    setEditBuffer("")
    toast("Section saved", "var(--green)")
  }, [editingSection, editBuffer, toast])

  const handleCancelEdit = useCallback(() => {
    setEditingSection(null)
    setEditBuffer("")
  }, [])

  const toggleLock = useCallback(
    (sectionId: string) => {
      setLockedSections((prev) => {
        const next = new Set(prev)
        if (next.has(sectionId)) {
          next.delete(sectionId)
          toast("Section unlocked", "var(--cyan)")
        } else {
          next.add(sectionId)
          toast("Section locked", "var(--orange)")
        }
        return next
      })
    },
    [toast]
  )

  const toggleStar = useCallback((sectionId: string) => {
    setStarredSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }, [])

  const handlePACERSync = useCallback(() => {
    setIsPACERSyncing(true)
    toast("Syncing with PACER...", "var(--cyan)")
    setTimeout(() => {
      setIsPACERSyncing(false)
      toast("PACER sync complete!", "var(--green)")
    }, 2500)
  }, [toast])

  const toggleDocketEntry = useCallback((entryNumber: number) => {
    setSelectedEntries((prev) => {
      const next = new Set(prev)
      if (next.has(entryNumber)) {
        next.delete(entryNumber)
      } else {
        next.add(entryNumber)
      }
      return next
    })
  }, [])

  const handleGenerateFromSelected = useCallback(() => {
    if (selectedEntries.size === 0) {
      toast("Select docket entries first", "var(--orange)")
      return
    }
    toast(`Generating from ${selectedEntries.size} entries...`, "var(--purple)")
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setActiveTab("screenplay")
      toast("Script generated!", "var(--green)")
    }, 3000)
  }, [selectedEntries, toast])

  const toggleLane = useCallback((laneId: LaneId) => {
    setVisibleLanes((prev) => {
      const next = new Set(prev)
      if (next.has(laneId)) {
        next.delete(laneId)
      } else {
        next.add(laneId)
      }
      return next
    })
  }, [])

  const toggleExpandEntry = useCallback((entryNum: number) => {
    setExpandedEntry(prev => prev === entryNum ? null : entryNum)
  }, [])

  const toggleAudioPlay = useCallback((entryNum: number) => {
    setPlayingAudio(prev => prev === entryNum ? null : entryNum)
    if (playingAudio !== entryNum) {
      toast("Playing AI summary...", "var(--purple)")
    }
  }, [playingAudio, toast])

  // Filtered docket entries
  const filteredDocket = useMemo(() => {
    return docketEntries.filter((entry) => {
      const matchesFilter = docketFilter === "all" || entry.type === docketFilter
      const matchesSearch = docketSearch === "" || entry.text.toLowerCase().includes(docketSearch.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [docketEntries, docketFilter, docketSearch])

  // Visible timeline events
  const visibleEvents = useMemo(() => {
    return TIMELINE_EVENTS.filter((e) => visibleLanes.has(e.lane))
  }, [visibleLanes])

  // Group docket by chapter
  const docketByChapter = useMemo(() => {
    const groups: { chapter: typeof CHAPTER_DATA[0]; entries: DocketEntry[] }[] = []
    CHAPTER_DATA.forEach((ch, idx) => {
      const chapterEntries = filteredDocket.filter(entry => {
        // Simple date-based grouping
        const entryDate = new Date(entry.date)
        const chapterStart = new Date(ch.dateRange.split(' ')[0] === 'December' ? '2024-12-01' : 
          ch.dateRange.includes('Spring') ? '2025-02-01' :
          ch.dateRange.includes('Summer') ? '2025-06-01' :
          ch.dateRange.includes('January') ? '2026-01-01' :
          ch.dateRange.includes('February') ? '2026-02-01' : '2026-04-01')
        return idx === 0 || entryDate >= chapterStart
      })
      if (chapterEntries.length > 0 || idx < 3) {
        groups.push({ chapter: ch, entries: chapterEntries.slice(0, idx === 0 ? 10 : 5) })
      }
    })
    return groups
  }, [filteredDocket])

  // Stats
  const stats = useMemo(() => ({
    totalDocket: docketEntries.length,
    factualEvents: TIMELINE_EVENTS.filter(e => e.lane === 'factual').length,
    proceduralEvents: TIMELINE_EVENTS.filter(e => e.lane === 'procedural').length,
    schedulingEvents: TIMELINE_EVENTS.filter(e => e.lane === 'scheduling').length,
    chapters: chapters.length,
    sections: chapters.reduce((acc, ch) => acc + ch.sections.length, 0),
  }), [docketEntries, chapters])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col pb-12 cinema-grain">
      {/* Settings Modal */}
      <SettingsModal isOpen={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
      
      {/* Share Modal */}
      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)}
        caseTitle="USA v. Mangione"
        caseNumber="1:25-cr-00176-MMG"
      />
      
      {/* Content Modal (Mission Control) */}
      <ContentModal
        isOpen={contentModalOpen}
        onClose={() => setContentModalOpen(false)}
        initialTab={contentModalTab}
        onOpenSettings={() => { setContentModalOpen(false); setTimeout(() => setSettingsModalOpen(true), 200) }}
      />

      {/* ═══ CINEMA-NOIR CHROME ═══ */}
      <Masthead
        showSettings
        pacerConnected
        user={user}
        onSignIn={() => setAuthOpen(true)}
        onSignOut={() => {
          signOut()
          toast("Signed out of chambers", "var(--muted-foreground)")
        }}
      />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuth={(u) => {
          signIn(u)
          setAuthOpen(false)
          toast(`Welcome back, ${u.name.split(" ")[0] || "counselor"}`, "var(--gold)")
        }}
      />

      {/* Case marquee — slim strip with case #, live dot, action buttons */}
      <div className="sticky top-14 z-40 w-full border-b border-[var(--border)] bg-[#0a0a0a]/95 backdrop-blur-sm cinema-grain">
        <div className="relative z-10 max-w-[1600px] mx-auto px-5 md:px-8 h-11 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/browse")}
              className="w-7 h-7 flex items-center justify-center border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              aria-label="Back to browse"
            >
              <ArrowLeft size={12} />
            </button>
            <div className="flex items-baseline gap-3 min-w-0">
              <span className="cinema-contract text-[11px] text-[var(--gold)] truncate">
                USA v. MANGIONE
              </span>
              <span className="cinema-label text-[9px] text-[var(--muted-foreground)] hidden md:inline">
                1:25-cr-00176-MMG · S.D.N.Y.
              </span>
              <span className="items-center gap-1.5 hidden lg:flex">
                <span className="cinema-pulse-dot" aria-hidden />
                <span className="cinema-label text-[9px] text-[var(--muted-foreground)]">
                  Active
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setContentModalTab("upload")
                setContentModalOpen(true)
              }}
              className="h-7 px-2.5 flex items-center gap-1.5 border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors cinema-label text-[9px]"
            >
              <Plus size={11} />
              <span className="hidden md:inline">Assets</span>
            </button>
            <button
              onClick={() => setShareModalOpen(true)}
              className="h-7 px-2.5 flex items-center gap-1.5 border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors cinema-label text-[9px]"
            >
              <Share size={11} />
              <span className="hidden md:inline">Share</span>
            </button>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="w-7 h-7 flex items-center justify-center border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              aria-label="Case settings"
            >
              <Settings size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* View tab rail — quiet underline indicator */}
      <div className="sticky top-[96px] z-30 w-full border-b border-[var(--border)] bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-5 md:px-8 flex items-center overflow-x-auto">
          {[
            { key: "all", label: "Overview", icon: LayoutGrid },
            { key: "screenplay", label: "Story", icon: FileText },
            { key: "docket", label: "Docket", icon: Database },
            { key: "timeline", label: "Timeline", icon: Clock },
            { key: "characters", label: "Characters", icon: Users },
          ].map(tab => {
            const isActive = activeTab === tab.key
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ViewTab)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 cinema-label text-[10px] transition-colors whitespace-nowrap",
                  isActive
                    ? "text-white"
                    : "text-[var(--muted-foreground)] hover:text-white"
                )}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
                {isActive && (
                  <span
                    className="absolute -bottom-px left-0 right-0 h-[2px]"
                    style={{ background: "var(--red)" }}
                  />
                )}
              </button>
            )
          })}
          <div className="flex-1" />
          <div className="hidden xl:flex items-center gap-4 pr-2">
            <LaneStat color="var(--lane-factual)" label="Factual" count={stats.factualEvents} Icon={Flame} />
            <LaneStat color="var(--lane-procedural)" label="Procedural" count={stats.proceduralEvents} Icon={Scale} />
            <LaneStat color="var(--lane-scheduling)" label="Scheduling" count={stats.schedulingEvents} Icon={Calendar} />
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* ALL VIEW - Aggregate Dashboard */}
        {activeTab === "all" && (
  <div className="animate-enter-up" style={{ animationDuration: '0.4s' }}>
            {/* Case Header Card */}
            <div className="p-4 md:p-6 border-b-2 border-border bg-card">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-wrap items-start justify-between gap-4 animate-fade-in">
                  <div>
                    <h1 className="font-sans text-2xl md:text-3xl font-black text-foreground mb-2">
                      USA v. MANGIONE
                    </h1>
                    <div className="font-mono text-sm text-muted-foreground mb-3">
                      1:25-cr-00176-MMG - S.D.N.Y.
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Chip color="var(--red)" bold>CRIMINAL</Chip>
                      <Chip color="var(--orange)" bold>4 COUNTS (2 GONE)</Chip>
                      <Chip color="var(--green)" bold>NON-CAPITAL</Chip>
                    </div>
                    {/* Collaborators */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 px-2 py-0.5 border border-green rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                        <span className="font-mono text-[10px] text-green">Raj A.</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 border border-purple rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse" />
                        <span className="font-mono text-[10px] text-purple">Eros I. ...</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <LegalButton
                      small
                      onClick={() => {
                        setContentModalTab("upload")
                        setContentModalOpen(true)
                      }}
                      className="hover-lift"
                    >
                      <Plus size={12} />
                      ASSETS
                    </LegalButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Lane counts - Sticky within scroll */}
            <div className="px-4 md:px-6 py-4 border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-30">
              <div className="max-w-6xl mx-auto flex items-center justify-end">
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border/60 rounded-lg text-xs font-mono transition-all duration-200 hover:border-lane-factual/50 hover:bg-lane-factual/5 cursor-default">
                      <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ backgroundColor: "var(--lane-factual)", boxShadow: '0 0 4px var(--lane-factual)' }} />
                      <span className="text-muted-foreground">FACTUAL</span>
                      <span className="font-bold text-lane-factual">8</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border/60 rounded-lg text-xs font-mono transition-all duration-200 hover:border-lane-procedural/50 hover:bg-lane-procedural/5 cursor-default">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--lane-procedural)" }} />
                      <span className="text-muted-foreground">PROC</span>
                      <span className="font-bold text-lane-procedural">7</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border/60 rounded-lg text-xs font-mono transition-all duration-200 hover:border-lane-scheduling/50 hover:bg-lane-scheduling/5 cursor-default">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--lane-scheduling)" }} />
                      <span className="text-muted-foreground">SCHED</span>
                      <span className="font-bold text-lane-scheduling">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* THE STORY SO FAR Banner */}
            <div className="story-banner px-4 md:px-6 py-8 md:py-10 relative overflow-hidden">
              {/* Subtle animated background */}
              <div className="absolute inset-0 opacity-20">
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    animation: 'float 8s ease-in-out infinite'
                  }}
                />
              </div>
              
              <div className="max-w-6xl mx-auto relative">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                  {/* Main Story */}
                  <div className="flex-1 animate-enter-left" style={{ animationDelay: '0.1s' }}>
                    <h2 className="font-sans text-xl md:text-2xl font-black text-white mb-4 flex items-center gap-3">
                      <BookOpen size={24} className="animate-idle-float" />
                      <span className="tracking-tight">THE STORY SO FAR</span>
                    </h2>
                    <p className="font-serif text-base md:text-lg text-white/90 leading-relaxed max-w-[60ch]">
                      <span className="font-bold">USA v. Mangione</span> - from complaint to trial. A federal prosecution 
                      following the December 2024 shooting of UnitedHealthcare CEO Brian Thompson. 
                      Four counts filed, two dismissed. Death penalty withdrawn. Trial scheduled for October 2026.
                    </p>
                  </div>
                  
                  {/* What Is Going On? - Latest Event */}
                  <div className="lg:w-80 shrink-0 animate-enter-right" style={{ animationDelay: '0.2s' }}>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-2xl hover-lift-premium">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green animate-pulse shadow-lg" style={{ boxShadow: '0 0 8px var(--green)' }} />
                        <span className="font-mono text-[10px] font-bold text-white/80 tracking-widest">
                          WHAT IS GOING ON?
                        </span>
                      </div>
                      <div className="font-sans text-sm font-bold text-white mb-1">
                        Death Penalty Dropped
                      </div>
                      <div className="font-mono text-[10px] text-white/60 mb-2">
                        Feb 27, 2026 - Dkt #113
                      </div>
                      <p className="font-serif text-sm text-white/80 leading-relaxed">
                        Government formally withdrew notice of intent to seek capital punishment. 
                        Case now proceeds as non-capital federal murder prosecution with maximum 
                        sentence of life imprisonment.
                      </p>
                      <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] text-white/50 tracking-wider">NEXT UP</span>
                          <span className="font-mono text-[10px] text-cyan font-bold">Trial: Oct 13, 2026</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Combined Timeline + Docket Section */}
            <div className="p-4 md:p-6">
              <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-sans text-lg font-bold text-foreground flex items-center gap-2">
                    <Clock size={18} className="text-primary" />
                    Timeline & Docket
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* Lane filters */}
                    {LANES.map((lane) => (
                      <button
                        key={lane.id}
                        onClick={() => toggleLane(lane.id)}
                        className={cn(
                          "px-2 py-1 flex items-center gap-1.5 transition-all duration-200 click-scale",
                          "font-mono text-[9px] font-bold border rounded rounded-none",
                          visibleLanes.has(lane.id)
                            ? "border-current bg-opacity-20"
                            : "border-border text-muted-foreground opacity-50"
                        )}
                        style={{ 
                          color: visibleLanes.has(lane.id) ? lane.color : undefined,
                          backgroundColor: visibleLanes.has(lane.id) ? `color-mix(in srgb, ${lane.color} 15%, transparent)` : undefined
                        }}
                      >
                        <lane.icon size={10} />
                        {lane.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Timeline Visualization */}
                {!mounted && (
                  <div className={cn(
                    "relative border-2 border-border bg-card p-4 mb-6 overflow-hidden",
                    "rounded-none h-40 animate-pulse"
                  )}>
                    <div className="h-full flex flex-col justify-center gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-2 bg-surface-alt rounded" />
                      ))}
                    </div>
                  </div>
                )}
                {mounted && (
                <div className={cn(
                  "relative border-2 border-border bg-card p-5 mb-6 overflow-visible",
                  "rounded-none",
                  "animate-enter-scale"
                )}>
                  {/* Subtle background grid */}
                  <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, currentColor 1px, transparent 1px)',
                      backgroundSize: '10% 100%'
                    }}
                  />
                  
                  {/* Date labels with improved spacing */}
                  <div className="flex justify-between items-center mb-4 px-1">
                    {["Jan 25", "Jul 25", "Jan 26", "Jul 26"].map((date, i) => (
                      <span 
                        key={date} 
                        className="font-mono text-[10px] text-muted-foreground animate-enter-down"
                        style={{ animationDelay: `${i * 0.08}s` }}
                      >
                        {date}
                      </span>
                    ))}
                    <span className={cn(
                      "px-3 py-1 font-mono text-[10px] font-bold text-white bg-red rounded-sm",
                      "animate-pulse-soft shadow-lg",
                      "relative overflow-hidden"
                    )}>
                      <span className="relative z-10">TRIAL</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </span>
                  </div>

                  {/* Lane tracks with premium styling */}
                  <div className="space-y-4 relative py-2">
                    {LANES.filter(lane => visibleLanes.has(lane.id)).map((lane, laneIndex) => (
                      <div 
                        key={lane.id} 
                        className="relative h-10 animate-enter-left group" 
                        style={{ animationDelay: `${laneIndex * 0.08}s` }}
                      >
                        {/* Lane label */}
                        <span 
                          className="absolute -left-1 top-1/2 -translate-y-1/2 -translate-x-full pr-3 font-mono text-[9px] font-bold opacity-40 group-hover:opacity-70 transition-opacity hidden xl:block"
                          style={{ color: lane.color }}
                        >
                          {lane.label.slice(0, 4).toUpperCase()}
                        </span>
                        
                        {/* Track background with glow */}
                        <div 
                          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full transition-all duration-500"
                          style={{ 
                            backgroundColor: lane.color,
                            opacity: 0.2,
                            boxShadow: `0 0 8px ${lane.color}`
                          }}
                        />
                        
                        {/* Track highlight on hover */}
                        <div 
                          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                          style={{ 
                            backgroundColor: lane.color,
                            boxShadow: `0 0 12px ${lane.color}`
                          }}
                        />
                        
                        {/* Events on this lane */}
                        {visibleEvents
                          .filter(e => e.lane === lane.id)
                          .map((event, eventIndex) => {
                            const pos = getDatePercent(event.date)
                            const isHovered = hoveredEvent === event.id
                            const isSelected = selectedEvent === event.id
                            const size = isHovered || isSelected ? 16 : 10
                            
                            return (
                              <button
                                key={event.id}
                                onClick={() => setSelectedEvent(isSelected ? null : event.id)}
                                onMouseEnter={() => setHoveredEvent(event.id)}
                                onMouseLeave={() => setHoveredEvent(null)}
                                className={cn(
                                  "absolute top-1/2 rounded-full cursor-pointer timeline-dot",
                                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                  isSelected && "ring-2 ring-white/50 ring-offset-2 ring-offset-card z-10",
                                  "animate-dot-pop"
                                )}
                                style={{ 
                                  left: `${pos.toFixed(2)}%`,
                                  backgroundColor: lane.color,
                                  width: `${size}px`,
                                  height: `${size}px`,
                                  marginLeft: `-${size / 2}px`,
                                  boxShadow: isHovered || isSelected 
                                    ? `0 0 20px ${lane.color}, 0 0 40px ${lane.color}40` 
                                    : `0 2px 4px rgba(0,0,0,0.2)`,
                                  animationDelay: `${(eventIndex * 0.04).toFixed(2)}s`,
                                  transform: 'translateY(-50%)',
                                }}
                              >
                                {/* Inner glow */}
                                {(isHovered || isSelected) && (
                                  <span 
                                    className="absolute inset-1 rounded-full bg-white/30 animate-pulse-soft"
                                  />
                                )}
                              </button>
                            )
                          })}
                      </div>
                    ))}
                  </div>
                  
                  {/* Hover tooltip — cinematic script beat */}
                  {(() => {
                    const hovered = hoveredEvent
                      ? visibleEvents.find(e => e.id === hoveredEvent)
                      : null
                    if (!hovered || hovered.id === selectedEvent) return null
                    const laneColor = getLaneColor(hovered.lane)
                    const pos = getDatePercent(hovered.date)
                    // Keep tooltip inside the card: anchor to left edge if
                    // within 16% from the right wall, otherwise center on dot.
                    const alignRight = pos > 84
                    const alignLeft = pos < 16
                    return (
                      <div
                        className={cn(
                          "absolute z-30 pointer-events-none",
                          "w-[280px]",
                          "border bg-[var(--surface-3)]",
                          "cinema-grain",
                          "shadow-[0_20px_40px_rgba(0,0,0,0.6)]",
                          "animate-enter-scale"
                        )}
                        style={{
                          top: "-12px",
                          transform: "translateY(-100%)",
                          left: alignLeft
                            ? "0%"
                            : alignRight
                            ? "auto"
                            : `${pos.toFixed(2)}%`,
                          right: alignRight ? "0%" : "auto",
                          marginLeft:
                            alignLeft || alignRight ? 0 : "-140px",
                          borderColor: laneColor,
                        }}
                      >
                        {/* Gold rule on top */}
                        <div
                          className="h-[2px]"
                          style={{ background: laneColor }}
                        />
                        <div className="px-4 py-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className="cinema-label text-[9px]"
                              style={{ color: laneColor }}
                            >
                              {new Date(hovered.date).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric", year: "numeric" }
                              )}
                            </span>
                            {hovered.docketNum && (
                              <span className="cinema-label text-[9px] text-white/40">
                                · DKT {hovered.docketNum}
                              </span>
                            )}
                            <span
                              className="ml-auto cinema-label text-[8px] px-1.5 py-0.5 border"
                              style={{
                                borderColor:
                                  hovered.tier === 1
                                    ? "var(--tier-1)"
                                    : hovered.tier === 2
                                    ? "var(--tier-2)"
                                    : "var(--tier-3)",
                                color:
                                  hovered.tier === 1
                                    ? "var(--tier-1)"
                                    : hovered.tier === 2
                                    ? "var(--tier-2)"
                                    : "var(--tier-3)",
                              }}
                            >
                              T{hovered.tier}
                            </span>
                          </div>
                          <div
                            className="cinema-title text-[14px] text-white leading-tight mb-2"
                            style={{ textShadow: "1px 1px 0 #000" }}
                          >
                            {hovered.title}
                          </div>
                          {hovered.beat ? (
                            <div className="cinema-contract-italic text-[11px] text-[var(--gold)]/90 leading-snug">
                              {hovered.beat}
                            </div>
                          ) : hovered.description ? (
                            <div className="font-serif italic text-[11px] text-white/70 leading-snug">
                              {hovered.description}
                            </div>
                          ) : null}
                        </div>
                        {/* Downward pointer notch — hides when anchored at edges */}
                        {!alignLeft && !alignRight && (
                          <div
                            className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-3 h-3 rotate-45"
                            style={{
                              background: "var(--surface-3)",
                              borderRight: `1px solid ${laneColor}`,
                              borderBottom: `1px solid ${laneColor}`,
                            }}
                          />
                        )}
                      </div>
                    )
                  })()}

                  {/* Event count indicator */}
                  <div className="absolute bottom-2 right-3 flex items-center gap-2 opacity-50">
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {visibleEvents.length} events
                    </span>
                  </div>

                  {/* Selected event tooltip */}
                  {selectedEvent && (
                    <div className={cn(
                      "mt-4 p-3 border-2 bg-surface animate-expand",
                      "rounded-none rounded-none"
                    )} style={{ borderColor: getLaneColor(visibleEvents.find(e => e.id === selectedEvent)?.lane || 'factual') }}>
                      {(() => {
                        const event = visibleEvents.find(e => e.id === selectedEvent)
                        if (!event) return null
                        return (
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-3 h-3 rounded-full mt-1 flex-shrink-0 animate-pulse-soft"
                              style={{ backgroundColor: getLaneColor(event.lane) }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-[10px] text-muted-foreground">{event.date}</span>
                                {event.docketNum && (
                                  <Chip mono small color={getLaneColor(event.lane)}>Dkt #{event.docketNum}</Chip>
                                )}
                              </div>
                              <p className="font-sans text-sm font-bold text-foreground">{event.title}</p>
                              {event.description && (
                                <p className="font-serif text-xs text-muted-foreground mt-1">{event.description}</p>
                              )}
                            </div>
                            <button 
                              onClick={() => setSelectedEvent(null)}
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
                )}

                {/* Docket by Chapter */}
                <div className="space-y-8">
                  {docketByChapter.slice(0, 3).map(({ chapter, entries }, groupIndex) => (
                    <div 
                      key={chapter.id} 
                      className="animate-enter-up" 
                      style={{ animationDelay: `${0.2 + groupIndex * 0.12}s` }}
                    >
                      {/* Chapter header with hover effect */}
                      <div className="flex items-center gap-4 mb-4 group">
                        <div className={cn(
                          "w-11 h-11 flex items-center justify-center",
                          "bg-primary text-primary-foreground font-mono text-lg font-black",
                          "rounded-none rounded-none",
                          "transition-transform duration-300 group-hover:scale-105",
                          "shadow-lg"
                        )}>
                          {groupIndex + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-sans text-base font-bold text-foreground tracking-tight">{chapter.title}</h4>
                          <p className="font-mono text-[10px] text-primary">{chapter.dateRange}</p>
                        </div>
                        <button
                          onClick={() => {
                            setCurrentChapterIndex(groupIndex)
                            setActiveTab("screenplay")
                          }}
                          className={cn(
                            "px-3 py-1.5 flex items-center gap-1.5 text-muted-foreground",
                            "font-mono text-[10px] transition-all duration-200",
                            "hover:text-foreground hover:translate-x-1",
                            "press-scale"
                          )}
                        >
                          View Story <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>

                      {/* Vertical line connector */}
                      <div className="ml-[22px] border-l-2 border-border pl-7 space-y-4">
                        {entries.slice(0, 4).map((entry, entryIndex) => (
                          <DocketEntryCard
                            key={entry.number}
                            entry={entry}
                            isExpanded={expandedEntry === entry.number}
                            isPlayingAudio={playingAudio === entry.number}
                            onToggleExpand={() => toggleExpandEntry(entry.number)}
                            onToggleAudio={() => toggleAudioPlay(entry.number)}
                            onToggleSelect={() => toggleDocketEntry(entry.number)}
                            isSelected={selectedEntries.has(entry.number)}
                            animationDelay={(groupIndex * 0.12) + (entryIndex * 0.06)}
                          />
                        ))}
                        
                        {entries.length > 4 && (
                          <button
                            onClick={() => setActiveTab("docket")}
                            className={cn(
                              "w-full py-2 text-center font-mono text-xs text-muted-foreground",
                              "hover:text-foreground transition-colors"
                            )}
                          >
                            +{entries.length - 4} more entries
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* View More */}
                <div className="flex justify-center mt-8 gap-4">
                  <LegalButton onClick={() => setActiveTab("docket")} className="hover-lift">
                    <Database size={14} />
                    Full Docket ({stats.totalDocket} entries)
                  </LegalButton>
                  <LegalButton onClick={() => setActiveTab("screenplay")} color="var(--purple)" className="hover-lift">
                    <FileText size={14} />
                    Read Full Story
                  </LegalButton>
                </div>
              </div>
            </div>

            {/* Characters Preview */}
            <div className="p-4 md:p-6 border-t-[2.5px] border-[var(--border)] bg-[var(--surface)]">
              <div className="max-w-6xl mx-auto">
                <h3 className="font-sans text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Users size={18} style={{ color: "var(--pink)" }} />
                  Key Characters
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {CHARACTER_PROFILES.slice(0, 4).map((char, i) => (
                    <div
                      key={char.id}
                      className="p-4 border border-[var(--border)] bg-[var(--card)] "
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div
                        className="w-12 h-12 bg-[var(--surface-alt)] flex items-center justify-center mb-3 mx-auto border border-[var(--border)]"
                      >
                        <Users size={20} className="text-[var(--muted-foreground)]" />
                      </div>
                      <div className="text-center">
                        <div className="font-mono text-[10px] font-bold mb-1" style={{ color: char.roleColor }}>{char.role}</div>
                        <div className="font-sans text-sm font-bold text-[var(--foreground)]">{char.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            {/* Reference Files / Evidence Upload (from Raj PDF p.7) */}
            <div className="p-4 md:p-6 border-t-[2.5px] border-[var(--border)] bg-[var(--card)]">
              <div className="max-w-4xl mx-auto">
                <h3 className="font-sans text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Folder size={18} style={{ color: "var(--cyan)" }} />
                  Reference Files
                </h3>

                {/* Upload options */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <label className="flex flex-col items-center gap-2 p-6 border border-dashed border-[var(--border)] bg-[var(--surface)] hover:border-[var(--green)] hover:bg-[var(--green)]/5 transition-colors cursor-pointer">
                    <div className="w-12 h-12 flex items-center justify-center border border-[var(--border)] bg-[var(--surface-alt)]">
                      <Folder size={24} className="text-[var(--green)]" />
                    </div>
                    <span className="font-sans text-sm font-bold text-[var(--foreground)]">Link Google Drive Folder</span>
                    <span className="font-serif text-xs text-[var(--muted-foreground)]">Sync a folder from your Google Drive.</span>
                    <span className="mt-1 px-3 py-1.5 border border-[var(--green)] bg-[var(--green)] text-white font-mono text-[10px] font-bold ">
                      Connect to Google Drive Folder
                    </span>
                    <input type="file" className="hidden" onChange={() => toast("Linked Google Drive", "var(--green)")} />
                  </label>

                  <label className="flex flex-col items-center gap-2 p-6 border border-dashed border-[var(--border)] bg-[var(--surface)] hover:border-[var(--cyan)] hover:bg-[var(--cyan)]/5 transition-colors cursor-pointer">
                    <div className="w-12 h-12 flex items-center justify-center border border-[var(--border)] bg-[var(--surface-alt)]">
                      <Upload size={24} className="text-[var(--cyan)]" />
                    </div>
                    <span className="font-sans text-sm font-bold text-[var(--foreground)]">Upload Files Directly</span>
                    <span className="font-serif text-xs text-[var(--muted-foreground)]">Upload documents, videos, and other files.</span>
                    <span className="mt-1 px-3 py-1.5 border border-[var(--cyan)] bg-[var(--cyan)] text-white font-mono text-[10px] font-bold ">
                      Upload Evidence Files
                    </span>
                    <input type="file" multiple className="hidden" onChange={() => toast("Files uploaded!", "var(--green)")} />
                  </label>
                </div>

                {/* Uploaded Evidence Dataset */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                      Uploaded Evidence Dataset <span className="text-[var(--green)] normal-case">— Private evidence uploads</span>
                    </div>
                    <div className="border border-[var(--border)] bg-[var(--surface)]">
                      {/* Header */}
                      <div className="flex items-center px-4 py-2 border-b-[2.5px] border-[var(--border)] bg-[var(--surface-alt)]">
                        <span className="flex-1 font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase">File Name</span>
                        <span className="w-24 font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase text-center">Type</span>
                        <span className="w-24 font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase text-center">Status</span>
                      </div>
                      {/* Rows */}
                      {[
                        { name: "Smith Deposition Transcript.pdf", type: "Transcript", icon: FileText, iconColor: "var(--red)" },
                        { name: "Opposition Emails.zip", type: "Documents", icon: Folder, iconColor: "var(--cyan)" },
                        { name: "Surveillance Video.mp4", type: "Video", icon: Eye, iconColor: "var(--purple)" },
                      ].map((file, i) => (
                        <div key={i} className={cn(
                          "flex items-center px-4 py-2.5",
                          i < 2 && "border-b border-[var(--border)]",
                          "hover:bg-[var(--selection)] transition-colors"
                        )}>
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            <file.icon size={14} style={{ color: file.iconColor }} />
                            <span className="font-mono text-xs text-[var(--foreground)] truncate">{file.name}</span>
                          </div>
                          <span className="w-24 font-mono text-[10px] text-[var(--muted-foreground)] text-center">{file.type}</span>
                          <span className="w-24 font-mono text-[10px] text-[var(--green)] font-bold text-center flex items-center justify-center gap-1">
                            <Check size={10} /> Uploaded
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={() => toast("Upload coming soon...", "var(--cyan)")}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] font-mono text-[10px] font-bold text-[var(--foreground)]  hover:border-[var(--cyan)]"
                      >
                        <Plus size={12} /> Add More Evidence
                      </button>
                      <button
                        onClick={() => toast("Analyzing evidence...", "var(--green)")}
                        className="flex items-center gap-1.5 px-4 py-1.5 border border-[var(--green)] bg-[var(--green)] text-white font-mono text-[10px] font-bold "
                      >
                        <Sparkles size={12} /> Analyze Evidence
                      </button>
                    </div>
                  </div>

                  {/* Tips sidebar */}
                  <div className="hidden lg:block w-48 p-3 border border-[var(--border)] bg-[var(--surface-alt)]">
                    <div className="font-mono text-[9px] font-bold text-[var(--foreground)] uppercase mb-2">Tips</div>
                    <ul className="space-y-1.5 font-serif text-[11px] text-[var(--muted-foreground)] list-disc pl-3">
                      <li>Ensure files are relevant to the case.</li>
                      <li>Include deposition transcripts, emails, videos, and more.</li>
                      <li>Keep data confidential and secure.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            </div>
          </div>
        )}

  {/* SCREENPLAY TAB */}
  {activeTab === "screenplay" && (
  <div className="flex flex-col lg:flex-row animate-enter-up" style={{ animationDuration: '0.4s' }}>
            {/* Chapter sidebar */}
            <div className={cn(
              "w-full lg:w-72 border-b lg:border-b-0 lg:border-r-2 border-border bg-surface-alt/50",
              "flex lg:flex-col overflow-x-auto lg:overflow-y-auto"
            )}>
              <div className="p-4 border-b border-border hidden lg:block">
                <div className="font-mono text-[10px] font-extrabold text-muted-foreground mb-1">
                  CHAPTERS
                </div>
                <div className="font-sans text-sm text-foreground">
                  {chapters.length} chapters, {stats.sections} sections
                </div>
              </div>
              <div className="flex lg:flex-col p-2 lg:p-0 gap-1 lg:gap-0">
                {chapters.map((chapter, i) => (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      setCurrentChapterIndex(i)
                      setCurrentSectionIndex(0)
                    }}
                    className={cn(
                      "flex-shrink-0 lg:flex-shrink px-4 py-3 text-left",
                      "border-b-2 lg:border-b lg:border-l-4 border-transparent",
                      "transition-all duration-200 click-scale",
                      currentChapterIndex === i
                        ? "bg-card border-l-primary text-foreground lg:shadow-none"
                        : "hover:bg-surface text-muted-foreground hover:text-foreground",
                      "rounded lg:rounded-none"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-6 h-6 flex items-center justify-center font-mono text-xs font-bold",
                        "rounded-full",
                        currentChapterIndex === i ? "bg-primary text-primary-foreground" : "bg-surface-alt text-muted-foreground"
                      )}>
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-sans text-sm font-bold truncate">{chapter.title}</div>
                        <div className="font-mono text-[9px] text-muted-foreground">{chapter.sections.length} sections</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main screenplay area */}
            <div className="flex-1 flex flex-col">
              {/* Playback controls */}
              <div className="flex items-center gap-4 p-4 border-b-2 border-border bg-card/80 backdrop-blur-sm flex-wrap">
                <LegalButton
                  color={isPlaying ? "var(--red)" : "var(--green)"}
                  active
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover-lift"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? "Pause" : "Play"}
                </LegalButton>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevSection}
                    disabled={currentChapterIndex === 0 && currentSectionIndex === 0}
                    className={cn(
                      "p-2 border-2 border-border transition-all duration-200 click-scale",
                      "disabled:opacity-40 hover:border-primary",
                      "rounded-none rounded-none"
                    )}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="px-3 py-1 bg-surface-alt font-mono text-xs rounded rounded-none">
                    {currentSectionIndex + 1} / {currentChapter.sections.length}
                  </div>
                  <button
                    onClick={handleNextSection}
                    disabled={
                      currentChapterIndex === chapters.length - 1 &&
                      currentSectionIndex === currentChapter.sections.length - 1
                    }
                    className={cn(
                      "p-2 border-2 border-border transition-all duration-200 click-scale",
                      "disabled:opacity-40 hover:border-primary",
                      "rounded-none rounded-none"
                    )}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="flex-1 flex items-center gap-3 min-w-[200px]">
                  <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">DRAMA</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={dramatization}
                    onChange={(e) => setDramatization(Number(e.target.value))}
                    className="flex-1 max-w-[150px]"
                    style={{ accentColor: dramColor }}
                  />
                  <Chip mono small style={{ color: dramColor, borderColor: dramColor }}>
                    {dramLabel}
                  </Chip>
                </div>

                <LegalButton
                  small
                  onClick={() => {
                    setIsGenerating(true)
                    toast("Regenerating screenplay...", "var(--purple)")
                    setTimeout(() => {
                      setIsGenerating(false)
                      toast("Regeneration complete!", "var(--green)")
                    }, 3000)
                  }}
                  disabled={isGenerating}
                  color="var(--purple)"
                  className="hover-lift"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                  Regen
                </LegalButton>
              </div>

              {/* Current section display */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                <div className="max-w-3xl mx-auto">
                  {/* Chapter header */}
                  <div className="mb-8 animate-chapter-slam">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center",
                        "bg-primary text-primary-foreground font-mono text-xl font-black",
                        "rounded-none"
                      )}>
                        {currentChapterIndex + 1}
                      </div>
                      <div>
                        <h2 className="font-sans text-2xl md:text-3xl font-black text-foreground">{currentChapter.title}</h2>
                        {currentChapter.subtitle && (
                          <p className="font-serif text-sm text-muted-foreground italic">{currentChapter.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-mono text-[10px]">{currentChapter.dateRange}</span>
                      <span className="w-1 h-1 rounded-full bg-current" />
                      <span className="font-mono text-[10px]">Section {currentSectionIndex + 1} of {currentChapter.sections.length}</span>
                    </div>
                  </div>

                  {/* Section content */}
                  {currentSection && (
                    <div className={cn(
                      "relative p-6 border-2 transition-all duration-300 animate-card-in",
                      "rounded-none",
                      lockedSections.has(currentSection.id) ? "border-orange bg-orange/5" : "border-border bg-card",
                      editingSection === currentSection.id && "border-primary ring-4 ring-primary/20"
                    )}>
                      {/* Section header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Chip
                            mono
                            bold
                            color={
                              currentSection.type === "scene" ? "var(--cyan)" :
                              currentSection.type === "dialogue" ? "var(--green)" :
                              currentSection.type === "action" ? "var(--red)" : "var(--purple)"
                            }
                          >
                            {currentSection.type.toUpperCase()}
                          </Chip>
                          {currentSection.speaker && (
                            <span className="font-mono text-sm font-bold text-foreground">
                              {currentSection.speaker}
                            </span>
                          )}
                          {currentSection.timestamp && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {currentSection.timestamp}
                            </span>
                          )}
                          {currentSection.docketRef && (
                            <Chip mono small color="var(--yellow)">
                              {currentSection.docketRef}
                            </Chip>
                          )}
                          {currentSection.aiGenerated && (
                            <Sparkles size={14} className="text-purple animate-pulse-soft" />
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStar(currentSection.id)}
                            className={cn(
                              "p-2 transition-all duration-200 click-scale rounded-lg",
                              starredSections.has(currentSection.id)
                                ? "text-yellow bg-yellow/10"
                                : "text-muted-foreground hover:text-yellow hover:bg-yellow/10"
                            )}
                          >
                            <Star size={16} fill={starredSections.has(currentSection.id) ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={() => toggleLock(currentSection.id)}
                            className={cn(
                              "p-2 transition-all duration-200 click-scale rounded-lg",
                              lockedSections.has(currentSection.id)
                                ? "text-orange bg-orange/10"
                                : "text-muted-foreground hover:text-orange hover:bg-orange/10"
                            )}
                          >
                            {lockedSections.has(currentSection.id) ? <Lock size={16} /> : <Unlock size={16} />}
                          </button>
                          {editingSection !== currentSection.id ? (
                            <>
                              <button
                                onClick={() => handleEditSection(currentSection.id, currentSection.content)}
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface-alt transition-all duration-200 click-scale rounded-lg"
                                disabled={lockedSections.has(currentSection.id)}
                              >
                                <Pencil size={16} />
                              </button>
                              {/* Regenerate removed per design decision */}
                            </>
                          ) : (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                className="p-2 text-green hover:bg-green/10 transition-all duration-200 click-scale rounded-lg"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 text-red hover:bg-red/10 transition-all duration-200 click-scale rounded-lg"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      {editingSection === currentSection.id ? (
                        <textarea
                          value={editBuffer}
                          onChange={(e) => setEditBuffer(e.target.value)}
                          className={cn(
                            "w-full min-h-[250px] p-4",
                            "bg-background border-2 border-border",
                            "font-serif text-lg leading-relaxed text-foreground",
                            "focus:outline-none focus:border-primary",
                            "resize-y rounded-none rounded-none"
                          )}
                          autoFocus
                        />
                      ) : (
                        <div className={cn(
                          "font-serif text-lg leading-relaxed text-foreground whitespace-pre-wrap",
                          currentSection.type === "dialogue" && "pl-6 border-l-4 border-green italic"
                        )}>
                          {currentSection.content}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section navigation dots */}
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {currentChapter.sections.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSectionIndex(i)}
                        className={cn(
                          "transition-all duration-200 click-scale",
                          i === currentSectionIndex 
                            ? "w-8 h-3 bg-primary rounded-full" 
                            : "w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/50 rounded-full"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

  {/* DOCKET TAB */}
  {activeTab === "docket" && (
  <div className="flex flex-col animate-enter-up" style={{ animationDuration: '0.4s' }}>
            {/* Controls - sticky within scroll */}
            <div className="flex items-center gap-4 p-4 border-b-2 border-border bg-card/95 backdrop-blur-md flex-wrap sticky top-0 z-30 shadow-sm">
              <div className="flex-1 min-w-[200px] relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search docket entries..."
                  value={docketSearch}
                  onChange={(e) => setDocketSearch(e.target.value)}
                  className={cn(
                    "w-full pl-11 pr-4 py-3",
                    "border-2 border-border bg-background text-foreground",
                    "font-mono text-sm placeholder:text-muted-foreground",
                    "focus:border-primary focus:outline-none transition-colors",
                    "rounded-none"
                  )}
                />
              </div>

              <div className="flex items-center gap-2">
                {(["all", "motion", "order", "notice", "filing", "hearing"] as const).map((filter, i) => (
                  <button
                    key={filter}
                    onClick={() => setDocketFilter(filter)}
                    className={cn(
                      "px-3 py-2 font-mono text-[10px] font-bold",
                      "border-2 rounded-none rounded-none",
                      "press-scale focus-premium",
                      "transition-all duration-300",
                      docketFilter === filter
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                    )}
                    style={{ 
                      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                      animationDelay: `${i * 0.03}s`
                    }}
                  >
                    {filter.toUpperCase()}
                  </button>
                ))}
              </div>

              <LegalButton
                small
                onClick={handlePACERSync}
                disabled={isPACERSyncing}
                color="var(--cyan)"
                className="hover-lift"
              >
                {isPACERSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                PACER Sync
              </LegalButton>

              {selectedEntries.size > 0 && (
                <LegalButton
                  onClick={handleGenerateFromSelected}
                  disabled={isGenerating}
                  color="var(--purple)"
                  className="animate-scale-in hover-lift"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                  Generate from {selectedEntries.size}
                </LegalButton>
              )}
            </div>

              {/* Docket list */}
              <div className="p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-4">
                {filteredDocket.map((entry, i) => (
                  <DocketEntryCard
                    key={entry.number}
                    entry={entry}
                    isExpanded={expandedEntry === entry.number}
                    isPlayingAudio={playingAudio === entry.number}
                    onToggleExpand={() => toggleExpandEntry(entry.number)}
                    onToggleAudio={() => toggleAudioPlay(entry.number)}
                    onToggleSelect={() => toggleDocketEntry(entry.number)}
                    isSelected={selectedEntries.has(entry.number)}
                    animationDelay={i * 0.03}
                    showFullDetails
                  />
                ))}
              </div>
            </div>
          </div>
        )}

  {/* TIMELINE TAB */}
  {activeTab === "timeline" && (
  <div className="flex flex-col p-4 md:p-6 animate-enter-up" style={{ animationDuration: '0.4s' }}>
            <div className="max-w-6xl mx-auto w-full">
              {/* Controls */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="font-sans text-xl font-bold text-foreground flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  Case Timeline
                </h2>
                <div className="flex items-center gap-2">
                  {LANES.map((lane) => (
                    <button
                      key={lane.id}
                      onClick={() => toggleLane(lane.id)}
                      className={cn(
                        "px-3 py-2 flex items-center gap-2 transition-all duration-200 click-scale",
                        "font-mono text-[10px] font-bold border-2 rounded-none rounded-none",
                        visibleLanes.has(lane.id)
                          ? "border-current"
                          : "border-border text-muted-foreground opacity-50"
                      )}
                      style={{ 
                        color: visibleLanes.has(lane.id) ? lane.color : undefined,
                        backgroundColor: visibleLanes.has(lane.id) ? `color-mix(in srgb, ${lane.color} 15%, transparent)` : undefined
                      }}
                    >
                      <lane.icon size={12} />
                      {lane.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Timeline */}
              <div className={cn(
                "border-2 border-border bg-card p-6 mb-6",
                "rounded-none"
              )}>
                {/* Date scale */}
                <div className="flex justify-between mb-4 px-2">
                  {["Dec 24", "Mar 25", "Jun 25", "Sep 25", "Dec 25", "Mar 26", "Jun 26", "Sep 26"].map((date, i) => (
                    <span key={date} className="font-mono text-[10px] text-muted-foreground">
                      {date}
                    </span>
                  ))}
                </div>

                {/* Lanes */}
                <div className="space-y-6">
                  {LANES.filter(lane => visibleLanes.has(lane.id)).map((lane, laneIndex) => (
                    <div key={lane.id} className="animate-slide-in" style={{ animationDelay: `${laneIndex * 0.1}s` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <lane.icon size={14} style={{ color: lane.color }} />
                        <span className="font-mono text-[10px] font-bold" style={{ color: lane.color }}>
                          {lane.label}
                        </span>
                        <span className="font-mono text-[9px] text-muted-foreground">
                          ({visibleEvents.filter(e => e.lane === lane.id).length} events)
                        </span>
                      </div>
                      
                      <div className="relative h-14 bg-surface-alt/30 rounded-xl overflow-visible group/track">
                        {/* Track with glow */}
                        <div 
                          className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[3px] rounded-full transition-all duration-500"
                          style={{ 
                            backgroundColor: lane.color,
                            opacity: 0.25,
                            boxShadow: `0 0 12px ${lane.color}40`
                          }}
                        />
                        
                        {/* Track hover highlight */}
                        <div 
                          className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[4px] rounded-full opacity-0 group-hover/track:opacity-30 transition-opacity duration-300"
                          style={{ 
                            backgroundColor: lane.color,
                            boxShadow: `0 0 16px ${lane.color}`
                          }}
                        />
                        
                        {/* Events */}
                        {visibleEvents
                          .filter(e => e.lane === lane.id)
                          .map((event, eventIndex) => {
                            const pos = getDatePercent(event.date)
                            const isSelected = selectedEvent === event.id
                            const isHovered = hoveredEvent === event.id
                            const size = isHovered || isSelected ? 20 : 14
                            
                            return (
                              <button
                                key={event.id}
                                onClick={() => setSelectedEvent(isSelected ? null : event.id)}
                                onMouseEnter={() => setHoveredEvent(event.id)}
                                onMouseLeave={() => setHoveredEvent(null)}
                                className={cn(
                                  "absolute top-1/2 flex items-center justify-center",
                                  "animate-dot-pop timeline-dot"
                                )}
                                style={{ 
                                  left: `calc(${pos.toFixed(2)}% + 16px)`,
                                  animationDelay: `${(eventIndex * 0.04).toFixed(2)}s`,
                                  transform: 'translateY(-50%)',
                                  marginLeft: `-${size / 2}px`
                                }}
                              >
                                <div 
                                  className={cn(
                                    "rounded-full transition-all duration-300",
                                    isSelected && "ring-2 ring-white/50 ring-offset-2 ring-offset-surface-alt"
                                  )}
                                  style={{ 
                                    backgroundColor: lane.color,
                                    width: size,
                                    height: size,
                                    boxShadow: isHovered || isSelected 
                                      ? `0 0 24px ${lane.color}, 0 0 48px ${lane.color}40` 
                                      : `0 2px 6px rgba(0,0,0,0.2)`,
                                    ringColor: lane.color,
                                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                                  }}
                                >
                                  {/* Inner glow */}
                                  {(isHovered || isSelected) && (
                                    <span className="absolute inset-1 rounded-full bg-white/30 animate-pulse-soft" />
                                  )}
                                </div>
                                {(isHovered || isSelected) && (
                                  <div className={cn(
                                    "absolute top-full mt-3 left-1/2 -translate-x-1/2",
                                    "px-3 py-2 bg-popover border-2 border-border rounded-lg shadow-xl",
                                    "whitespace-nowrap z-30 animate-enter-up"
                                  )}
                                  style={{ animationDuration: '0.2s' }}
                                  >
                                    <div className="font-mono text-[9px] text-muted-foreground mb-0.5">{event.date}</div>
                                    <div className="font-sans text-sm font-bold text-foreground">{event.title}</div>
                                  </div>
                                )}
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event details */}
              {selectedEvent && (
                <div className={cn(
                  "p-6 border-2 bg-card animate-expand",
                  "rounded-none"
                )} style={{ borderColor: getLaneColor(visibleEvents.find(e => e.id === selectedEvent)?.lane || 'factual') }}>
                  {(() => {
                    const event = visibleEvents.find(e => e.id === selectedEvent)
                    if (!event) return null
                    return (
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Chip mono small color={getLaneColor(event.lane)}>
                                {LANES.find(l => l.id === event.lane)?.label}
                              </Chip>
                              <span className="font-mono text-sm text-muted-foreground">{event.date}</span>
                              {event.docketNum && (
                                <Chip mono small color="var(--yellow)">Dkt #{event.docketNum}</Chip>
                              )}
                            </div>
                            <h3 className="font-sans text-xl font-bold text-foreground">{event.title}</h3>
                          </div>
                          <button 
                            onClick={() => setSelectedEvent(null)}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-surface-alt"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        {event.description && (
                          <p className="font-serif text-base text-muted-foreground">{event.description}</p>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

  {/* CHARACTERS TAB */}
  {activeTab === "characters" && (
  <div className="p-4 md:p-6 animate-enter-up" style={{ animationDuration: '0.4s' }}>
            <div className="max-w-4xl mx-auto">
              <h2 className="font-sans text-xl font-bold text-[var(--foreground)] mb-8 flex items-center gap-3">
                <Users size={22} style={{ color: "var(--pink)" }} />
                <span className="tracking-tight">Characters</span>
              </h2>

              {CHARACTER_PROFILES.length === 0 ? (
                <div className="p-8 text-center border border-[var(--border)] bg-[var(--card)]">
                  <Users size={32} className="text-[var(--muted-foreground)] mx-auto mb-3" />
                  <p className="font-sans text-lg font-bold text-[var(--foreground)] mb-1">No characters identified yet.</p>
                  <p className="font-serif text-sm text-[var(--muted-foreground)]">Characters will be populated from the case docket.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-5">
                  {CHARACTER_PROFILES.map((char) => {
                    const lvl: DramaLevel = (charLevels[char.id] ?? 0) as DramaLevel
                    const setLvl = (v: DramaLevel) => setCharLevels((p) => ({ ...p, [char.id]: v }))
                    return (
                    <div
                      key={char.id}
                      className="p-5 border border-[var(--border)] bg-[var(--card)] "
                      style={{ borderLeftColor: char.roleColor, borderLeftWidth: "5px" }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Thumbnail - clickable for upload */}
                        <label className="relative w-16 h-16 flex-shrink-0 cursor-pointer group border border-[var(--border)] bg-[var(--surface-alt)] flex items-center justify-center  overflow-hidden">
                          <Users size={24} className="text-[var(--muted-foreground)] group-hover:opacity-50 transition-opacity" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil size={14} className="text-white" />
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={() => toast("Photo updated!", "var(--green)")} />
                        </label>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[10px] font-bold uppercase mb-1" style={{ color: char.roleColor }}>{char.role}</div>
                          <div className="font-sans text-lg font-bold text-[var(--foreground)] mb-1">{char.name}</div>
                          <p className="font-serif text-sm text-[var(--muted-foreground)] mb-3 line-clamp-3">{char.descs[lvl]}</p>

                          <DramaLevelSlider
                            value={lvl}
                            onChange={setLvl}
                            entityName={char.name}
                            className="mb-3"
                          />

                          <div className="flex items-center gap-2">
                            <button
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--cyan)] text-[var(--cyan)] font-mono text-[10px] font-bold  hover:bg-[var(--cyan)] hover:text-white transition-colors"
                              onClick={() => toast("Upload evidence for " + char.name, "var(--cyan)")}
                            >
                              <Upload size={12} />
                              Upload Evidence
                            </button>
                            {char.evidenceCount > 0 && (
                              <span className="font-mono text-[9px] bg-[var(--cyan)] text-white px-2 py-0.5 font-bold">{char.evidenceCount} files</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                  })}
                </div>
              )}

              {/* ─── LOCATIONS (drama-axis places) ─── */}
              <h2 className="font-sans text-xl font-bold text-[var(--foreground)] mb-6 mt-12 flex items-center gap-3">
                <MapPin size={22} style={{ color: "var(--cyan)" }} />
                <span className="tracking-tight">Locations</span>
                <span className="font-mono text-[10px] font-bold uppercase text-[var(--muted-foreground)] tracking-wider ml-1">
                  {LOCATION_PROFILES.length}
                </span>
              </h2>

              <div className="grid md:grid-cols-2 gap-5">
                {LOCATION_PROFILES.map((loc) => {
                  const lvl: DramaLevel = (locLevels[loc.id] ?? 0) as DramaLevel
                  const setLvl = (v: DramaLevel) => setLocLevels((p) => ({ ...p, [loc.id]: v }))
                  return (
                    <div
                      key={loc.id}
                      className="p-5 border border-[var(--border)] bg-[var(--card)] "
                      style={{ borderLeftColor: loc.roleColor, borderLeftWidth: "5px" }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative w-16 h-16 flex-shrink-0 border border-[var(--border)] bg-[var(--surface-alt)] flex items-center justify-center ">
                          <MapPin size={24} style={{ color: loc.roleColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[10px] font-bold uppercase mb-1" style={{ color: loc.roleColor }}>{loc.role}</div>
                          <div className="font-sans text-lg font-bold text-[var(--foreground)] mb-1">{loc.name}</div>
                          <p className="font-serif text-sm text-[var(--muted-foreground)] mb-3 line-clamp-3">{loc.descs[lvl]}</p>

                          <DramaLevelSlider
                            value={lvl}
                            onChange={setLvl}
                            entityName={loc.name}
                            className="mb-1"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
      <SidebarChat />
      <SiteFooter />
    </div>
  )
}

// Docket Entry Card Component
interface DocketEntryCardProps {
  entry: DocketEntry
  isExpanded: boolean
  isPlayingAudio: boolean
  onToggleExpand: () => void
  onToggleAudio: () => void
  onToggleSelect: () => void
  isSelected: boolean
  animationDelay?: number
  showFullDetails?: boolean
}

function DocketEntryCard({
  entry,
  isExpanded,
  isPlayingAudio,
  onToggleExpand,
  onToggleAudio,
  onToggleSelect,
  isSelected,
  animationDelay = 0,
  showFullDetails = false,
}: DocketEntryCardProps) {
  const laneColor = getLaneColor(entry.lane)
  const aiSummary = AI_SUMMARIES[entry.number]
  
  return (
    <div 
      className={cn(
        "border-2 animate-enter-up",
        "rounded-none",
        "hover-lift-premium press-scale",
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50",
        isExpanded && "shadow-colored"
      )}
      style={{ 
        animationDelay: `${animationDelay}s`,
        borderLeftColor: laneColor,
        borderLeftWidth: '4px',
        transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease'
      }}
    >
      {/* Main row */}
      <div className="p-6 md:p-8 flex items-start gap-5">
        {/* Checkbox */}
        <button
          onClick={onToggleSelect}
          className={cn(
            "w-6 h-6 border-2 flex items-center justify-center flex-shrink-0 mt-1",
            "transition-all duration-200 click-scale",
            "rounded rounded-none-md",
            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
          )}
        >
          {isSelected && <Check size={14} />}
        </button>
        
        {/* Icon */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `color-mix(in srgb, ${laneColor} 20%, transparent)` }}
        >
          <FileText size={20} style={{ color: laneColor }} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Chips row */}
          <div className="flex items-center gap-2.5 flex-wrap mb-4">
            <Chip mono small style={{ color: laneColor, borderColor: laneColor }}>
              {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
            </Chip>
            <Chip mono small>Dkt #{entry.number}</Chip>
            <Chip mono small color={laneColor}>{entry.type.toUpperCase()}</Chip>
          </div>
          {/* Title - full wrap, never truncated */}
          <h4 className="font-sans text-base font-bold text-foreground leading-snug mb-3">{entry.text}</h4>
          {showFullDetails && entry.description && (
            <p className="font-serif text-sm text-muted-foreground leading-relaxed mt-3">{entry.description}</p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          {aiSummary && (
            <button
              onClick={onToggleAudio}
              className={cn(
                "p-2 transition-all duration-200 click-scale rounded-lg",
                isPlayingAudio 
                  ? "text-purple bg-purple/10" 
                  : "text-muted-foreground hover:text-purple hover:bg-purple/10"
              )}
              title="Play AI audio summary"
            >
              {isPlayingAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
          <button
            onClick={onToggleExpand}
            className={cn(
              "p-2 transition-all duration-200 click-scale rounded-lg",
              isExpanded 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            )}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className={cn(
          "px-6 md:px-8 pb-8 pt-6 border-t border-border animate-expand",
          "ml-[72px]"
        )}>
          {/* Audio visualizer */}
          {isPlayingAudio && (
            <div className="flex items-center gap-3 p-3 bg-purple/10 rounded-lg mb-3 animate-fade-in">
              <div className="audio-visualizer">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="bar audio-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <span className="font-mono text-[10px] text-purple">Playing AI summary...</span>
            </div>
          )}
          
          {/* AI Summary */}
          {aiSummary ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-purple" />
                  <span className="font-mono text-[10px] font-bold text-purple">AI ANALYSIS</span>
                </div>
                <p className="font-serif text-sm text-foreground leading-relaxed">
                  {aiSummary.text}
                </p>
              </div>
              <div>
                <div className="font-mono text-[10px] text-muted-foreground mb-2">KEY POINTS</div>
                <ul className="space-y-1">
                  {aiSummary.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span className="font-sans text-xs text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <Sparkles size={20} className="text-muted-foreground mx-auto mb-2" />
              <p className="font-mono text-xs text-muted-foreground">AI summary not yet generated</p>
              <button className="mt-2 font-mono text-xs text-purple hover:underline">
                Generate summary
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Floating Status Footer — noir strip */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[#0a0a0a]/95 backdrop-blur-sm cinema-grain">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-5 md:px-8 py-2">
          <div className="flex items-center gap-4">
            <span className="cinema-label text-[9px] text-[var(--muted-foreground)]">
              LegalDrama.ai v0.2 · Alpha
            </span>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="cinema-pulse-gold" aria-hidden />
              <span className="cinema-label text-[9px] text-[var(--muted-foreground)]">
                11 / 14 sources active
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="cinema-label text-[9px] text-[var(--muted-foreground)]">
                Trial Date ·{" "}
                <span className="text-[var(--red)]">Oct 13, 2026</span>
              </span>
            </div>
            <span className="cinema-label text-[9px] text-[var(--muted-foreground)]/50 hidden lg:inline">
              Design · Eros Marcello Iuliano
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LaneStat({
  color,
  label,
  count,
  Icon,
}: {
  color: string
  label: string
  count: number
  Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={11} style={{ color }} />
      <span className="cinema-label text-[9px] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="cinema-label text-[9px]" style={{ color }}>
        {count}
      </span>
    </div>
  )
}

export default function CaseWorkspacePage() {
  return (
    <ToastProvider>
      <CaseWorkspaceContent />
    </ToastProvider>
  )
}
