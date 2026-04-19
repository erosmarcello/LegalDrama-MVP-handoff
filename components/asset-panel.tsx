"use client"

import * as React from "react"
import {
  X, Upload, FileText, Video, Image, Mic, Folder, Star, Pin,
  Users, UserPlus, Share2, Link2, Copy, Check, Sparkles, Send,
  Settings, Trash2, Download, ExternalLink, MessageSquare, Clock,
  Eye, EyeOff, Plus, Search, Filter, MoreHorizontal, RefreshCw,
  Loader2, Mail, Globe, Lock, Unlock, Play, Pause, SkipForward,
  SkipBack, Volume2, ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LegalButton, Chip, LegalInput, useToast } from "@/components/legal-ui"
import {
  CASE_EVIDENCE, SECONDARY_EVIDENCE, COLLABORATORS, ACTIVITY_LOG,
  CHARACTER_PROFILES, ASSET_LIBRARY,
  type Evidence, type SecondaryEvidence, type Collaborator, type Asset
} from "@/lib/case-data"

interface AssetPanelProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: "files" | "characters" | "ai" | "share"
}

export function AssetPanel({ isOpen, onClose, initialTab = "files" }: AssetPanelProps) {
  const [activeTab, setActiveTab] = React.useState(initialTab)
  const { toast } = useToast()

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md animate-fade-in"
        style={{ animationDuration: '0.2s' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl",
          "bg-[var(--surface)] border-l-[3px] border-[var(--foreground)]",
          "flex flex-col",
          "animate-enter-right"
        )}
        style={{ animationDuration: '0.35s' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-[2.5px] border-[var(--border)] bg-[var(--card)]">
          <h2 className="font-sans text-lg font-extrabold text-[var(--foreground)]">Asset Panel</h2>
          <button
            onClick={onClose}
            className="p-1.5 border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors "
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-[2.5px] border-[var(--border)]">
          {[
            { key: "files", label: "Assets", icon: Folder },
            { key: "characters", label: "Characters", icon: Users },
            { key: "ai", label: "AI Assistant", icon: Sparkles },
            { key: "share", label: "Share", icon: Share2 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                "flex-1 px-3 py-2.5 flex items-center justify-center gap-2",
                "font-mono text-[10px] font-bold uppercase",
                "border-b-[2.5px] transition-all",
                activeTab === tab.key
                  ? "border-[var(--amber)] text-[var(--amber)] bg-[var(--amber)]/5"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "files" && <AssetLibraryTab toast={toast} />}
          {activeTab === "characters" && <CharactersTab toast={toast} />}
          {activeTab === "ai" && <AITab toast={toast} />}
          {activeTab === "share" && <ShareTab toast={toast} />}
        </div>
      </div>
    </>
  )
}

// ──────────────────────────────────────────────────────────────
// F1: ASSET LIBRARY TAB with 4 sub-views
// ──────────────────────────────────────────────────────────────

type AssetSubView = "all" | "photos" | "videos" | "documents" | "audio"

function AssetLibraryTab({ toast }: { toast: (msg: string, color?: string) => void }) {
  const [subView, setSubView] = React.useState<AssetSubView>("all")
  const [assets, setAssets] = React.useState<Asset[]>(ASSET_LIBRARY)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isDragging, setIsDragging] = React.useState(false)

  // F9: Cross-type search
  const filteredAssets = React.useMemo(() => {
    const q = searchQuery.toLowerCase()
    return assets.filter(a => {
      const matchesSearch = !q || a.name.toLowerCase().includes(q) || a.uploader.toLowerCase().includes(q) || a.linkedEntries.some(e => e.toLowerCase().includes(q))
      if (subView === "all") return matchesSearch
      const matchesCategory = (subView === "photos" && a.category === "photo") || (subView === "videos" && a.category === "video") || (subView === "documents" && a.category === "document") || (subView === "audio" && a.category === "audio")
      return matchesSearch && matchesCategory
    })
  }, [assets, searchQuery, subView])

  // Cross-type search results (show all types when searching)
  const allFilteredAssets = React.useMemo(() => {
    if (!searchQuery) return null
    const q = searchQuery.toLowerCase()
    return assets.filter(a => a.name.toLowerCase().includes(q) || a.uploader.toLowerCase().includes(q) || a.linkedEntries.some(e => e.toLowerCase().includes(q)))
  }, [assets, searchQuery])

  // F8: Star/pin
  const toggleStar = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, starred: !a.starred } : a))
  }
  const togglePin = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a))
  }

  // F7: Upload
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const typeMap: Record<AssetSubView, string> = { photos: "photo", videos: "video", documents: "document", audio: "audio" }
    toast(`Uploaded to ${subView}!`, "var(--green)")
  }

  const counts = React.useMemo(() => ({
    all: assets.length,
    photos: assets.filter(a => a.category === "photo").length,
    videos: assets.filter(a => a.category === "video").length,
    documents: assets.filter(a => a.category === "document").length,
    audio: assets.filter(a => a.category === "audio").length,
  }), [assets])

  return (
    <div className="flex flex-col h-full">
      {/* F9: Cross-type search bar */}
      <div className="p-3 border-b-[2.5px] border-[var(--border)] bg-[var(--card)]">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search all assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono text-xs placeholder:text-[var(--muted-foreground)] focus:border-[var(--amber)] focus:outline-none"
          />
        </div>
      </div>

      {/* F1: Sub-view tabs */}
      <div className="flex border-b-[2.5px] border-[var(--border)] bg-[var(--surface)]">
        {([
          { key: "all" as const, icon: Folder, label: "All", color: "var(--amber)" },
          { key: "photos" as const, icon: Image, label: "Photos", color: "var(--orange)" },
          { key: "videos" as const, icon: Video, label: "Videos", color: "var(--pink)" },
          { key: "documents" as const, icon: FileText, label: "Docs", color: "var(--cyan)" },
          { key: "audio" as const, icon: Volume2, label: "Audio", color: "var(--green)" },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setSubView(tab.key)}
            className={cn(
              "flex-1 px-2 py-2 flex flex-col items-center gap-1",
              "font-mono text-[9px] font-bold uppercase transition-all",
              subView === tab.key
                ? "bg-[var(--background)] border-b-[2.5px]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-b-[2.5px] border-transparent"
            )}
            style={subView === tab.key ? { color: tab.color, borderBottomColor: tab.color } : undefined}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.5 text-[8px] bg-[var(--surface-alt)] border border-[var(--border)]">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      {/* Content area with drag-drop */}
      <div
        className="flex-1 overflow-y-auto"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* F7: Drag-drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-10 bg-[var(--amber)]/10 border-[3px] border-dashed border-[var(--amber)] flex items-center justify-center">
            <div className="text-center">
              <Upload size={32} className="mx-auto mb-2 text-[var(--amber)]" />
              <p className="font-mono text-sm font-bold text-[var(--amber)]">Drop files to upload</p>
            </div>
          </div>
        )}

        {/* Cross-type search results */}
        {searchQuery && allFilteredAssets ? (
          <div className="p-3">
            <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
              {allFilteredAssets.length} results across all types
            </div>
            <div className="space-y-2">
              {allFilteredAssets.map(asset => (
                <CrossTypeResultCard key={asset.id} asset={asset} onToggleStar={() => toggleStar(asset.id)} onTogglePin={() => togglePin(asset.id)} toast={toast} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* F7: Upload zone */}
            <div className="p-3">
              <label className={cn(
                "block border border-dashed p-4 text-center transition-all cursor-pointer",
                "border-[var(--border)] hover:border-[var(--amber)] hover:bg-[var(--amber)]/5"
              )}>
                <Upload size={20} className="mx-auto mb-1.5 text-[var(--muted-foreground)]" />
                <p className="font-mono text-[10px] text-[var(--muted-foreground)]">
                  Drop files or <span className="text-[var(--amber)] font-bold">browse</span>
                </p>
                <input type="file" multiple className="hidden" onChange={() => toast("File uploaded!", "var(--green)")} />
              </label>
            </div>

            {/* Sub-view content */}
            {subView === "all" && <AllMasonryGrid assets={filteredAssets} onToggleStar={toggleStar} onTogglePin={togglePin} toast={toast} />}
            {subView === "photos" && <PhotosGrid assets={filteredAssets} onToggleStar={toggleStar} onTogglePin={togglePin} toast={toast} />}
            {subView === "videos" && <VideosGrid assets={filteredAssets} onToggleStar={toggleStar} onTogglePin={togglePin} toast={toast} />}
            {subView === "documents" && <DocumentsList assets={filteredAssets} onToggleStar={toggleStar} onTogglePin={togglePin} toast={toast} />}
            {subView === "audio" && <AudioList assets={filteredAssets} onToggleStar={toggleStar} onTogglePin={togglePin} toast={toast} />}
          </>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// F9: Cross-type search result card
// ──────────────────────────────────────────────────────────────

function CrossTypeResultCard({ asset, onToggleStar, onTogglePin, toast }: { asset: Asset; onToggleStar: () => void; onTogglePin: () => void; toast: (msg: string, color?: string) => void }) {
  const categoryIcon = { photo: Image, video: Video, document: FileText, audio: Volume2 }
  const categoryColor = { photo: "var(--orange)", video: "var(--pink)", document: "var(--cyan)", audio: "var(--green)" }
  const Icon = categoryIcon[asset.category]

  return (
    <div className="flex items-center gap-3 p-2.5 border border-[var(--border)] bg-[var(--card)] hover:border-[var(--foreground)]/30 transition-all">
      <div className="w-9 h-9 flex items-center justify-center border-[2px] border-[var(--border)]" style={{ backgroundColor: `color-mix(in srgb, ${categoryColor[asset.category]} 15%, var(--surface-alt))` }}>
        <Icon size={16} style={{ color: categoryColor[asset.category] }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-xs font-bold text-[var(--foreground)] truncate">{asset.name}</div>
        <div className="font-mono text-[9px] text-[var(--muted-foreground)]">
          {asset.category.toUpperCase()} &middot; {asset.date} &middot; {asset.uploader}
        </div>
      </div>
      <AssetActions asset={asset} onToggleStar={onToggleStar} onTogglePin={onTogglePin} toast={toast} compact />
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// F6: Asset metadata + F8: Star/Pin actions
// ──────────────────────────────────────────────────────────────

function AssetActions({ asset, onToggleStar, onTogglePin, toast, compact = false }: { asset: Asset; onToggleStar: () => void; onTogglePin: () => void; toast: (msg: string, color?: string) => void; compact?: boolean }) {
  return (
    <div className={cn("flex items-center", compact ? "gap-0.5" : "gap-1")}>
      <button onClick={onToggleStar} className={cn("p-1 transition-colors", asset.starred ? "text-[var(--amber)]" : "text-[var(--muted-foreground)] hover:text-[var(--amber)]")} title="Star">
        <Star size={compact ? 11 : 12} fill={asset.starred ? "currentColor" : "none"} />
      </button>
      <button onClick={onTogglePin} className={cn("p-1 transition-colors", asset.pinned ? "text-[var(--cyan)]" : "text-[var(--muted-foreground)] hover:text-[var(--cyan)]")} title="Pin">
        <Pin size={compact ? 11 : 12} fill={asset.pinned ? "currentColor" : "none"} />
      </button>
      <button onClick={() => toast("Downloaded " + asset.name, "var(--green)")} className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" title="Download">
        <Download size={compact ? 11 : 12} />
      </button>
    </div>
  )
}

// F6: Metadata line
function AssetMeta({ asset }: { asset: Asset }) {
  return (
    <div className="font-mono text-[8px] text-[var(--muted-foreground)] flex items-center gap-1.5 flex-wrap mt-1">
      <span>{asset.date}</span>
      <span>&middot;</span>
      <span>{asset.uploader}</span>
      {asset.linkedEntries.length > 0 && (
        <>
          <span>&middot;</span>
          {asset.linkedEntries.map((e, i) => (
            <span key={i} className="text-[var(--cyan)]">{e}</span>
          ))}
        </>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// ALL: Pinterest mood board — aggregate masonry of all types
// ──────────────────────────────────────────────────────────────

function AllMasonryGrid({ assets, onToggleStar, onTogglePin, toast }: { assets: Asset[]; onToggleStar: (id: string) => void; onTogglePin: (id: string) => void; toast: (msg: string, color?: string) => void }) {
  const sorted = React.useMemo(() =>
    [...assets].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (a.starred !== b.starred) return a.starred ? -1 : 1
      return 0
    }), [assets])

  // 2-column masonry distribution
  const [col1, col2] = React.useMemo(() => {
    const c1: Asset[] = []
    const c2: Asset[] = []
    let h1 = 0, h2 = 0
    for (const item of sorted) {
      // Vary height based on type for visual variety
      const weight = item.category === "photo" ? ((item.height || 3) / (item.width || 4))
        : item.category === "video" ? 0.7
        : item.category === "audio" ? 0.5
        : 0.6
      if (h1 <= h2) { c1.push(item); h1 += weight }
      else { c2.push(item); h2 += weight }
    }
    return [c1, c2]
  }, [sorted])

  const categoryIcon = { photo: Image, video: Video, document: FileText, audio: Volume2 }
  const categoryColor = { photo: "var(--orange)", video: "var(--pink)", document: "var(--cyan)", audio: "var(--green)" }

  return (
    <div className="px-3 pb-3">
      <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
        All Assets ({assets.length}) — Mood Board
      </div>
      <div className="flex gap-2.5">
        {[col1, col2].map((col, ci) => (
          <div key={ci} className="flex-1 space-y-2.5">
            {col.map(asset => {
              const Icon = categoryIcon[asset.category]
              const color = categoryColor[asset.category]

              return (
                <div key={asset.id} className="group border border-[var(--border)] bg-[var(--card)]  overflow-hidden">
                  {/* Type-specific visual */}
                  {asset.category === "photo" && (
                    <div
                      className="relative bg-[var(--surface-alt)] flex items-center justify-center"
                      style={{ paddingBottom: `${Math.min(((asset.height || 3) / (asset.width || 4)) * 100, 120)}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image size={24} className="text-[var(--muted-foreground)] opacity-20" />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                    </div>
                  )}
                  {asset.category === "video" && (
                    <div className="relative bg-gradient-to-br from-[var(--surface-alt)] to-[var(--border)] flex items-center justify-center" style={{ paddingBottom: "50%" }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 flex items-center justify-center bg-black/70 text-[var(--gold)] border border-[var(--gold)]">
                          <Play size={16} fill="white" />
                        </div>
                      </div>
                      {asset.duration && (
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 text-white font-mono text-[8px] font-bold">{asset.duration}</div>
                      )}
                    </div>
                  )}
                  {asset.category === "audio" && (
                    <div className="px-2.5 pt-2.5">
                      <div className="flex items-end gap-[1px] h-6">
                        {Array.from({ length: 24 }, (_, i) => (
                          <div key={i} className="flex-1 bg-[var(--green)]" style={{ height: `${15 + Math.random() * 85}%`, opacity: 0.4 + Math.random() * 0.4 }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {asset.category === "document" && (
                    <div className="flex items-center gap-2 px-2.5 pt-2.5">
                      <FileText size={18} style={{ color }} />
                      {asset.pages && <span className="font-mono text-[8px] text-[var(--muted-foreground)]">{asset.pages} pages</span>}
                      {asset.fileSize && <span className="font-mono text-[8px] text-[var(--muted-foreground)]">{asset.fileSize}</span>}
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon size={10} style={{ color }} />
                      <span className="font-mono text-[7px] font-bold uppercase" style={{ color }}>{asset.category}</span>
                    </div>
                    <div className="font-mono text-[10px] font-bold text-[var(--foreground)] truncate">{asset.name}</div>
                    <AssetMeta asset={asset} />
                    <div className="flex items-center justify-between mt-1">
                      <AssetActions asset={asset} onToggleStar={() => onToggleStar(asset.id)} onTogglePin={() => onTogglePin(asset.id)} toast={toast} compact />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// F2: PHOTOS — Pinterest masonry grid
// ──────────────────────────────────────────────────────────────

function PhotosGrid({ assets, onToggleStar, onTogglePin, toast }: { assets: Asset[]; onToggleStar: (id: string) => void; onTogglePin: (id: string) => void; toast: (msg: string, color?: string) => void }) {
  // Sort: pinned first, then starred, then by date
  const sorted = React.useMemo(() =>
    [...assets].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (a.starred !== b.starred) return a.starred ? -1 : 1
      return 0
    }), [assets])

  // Simple 2-column masonry: distribute items alternating by "height"
  const [col1, col2] = React.useMemo(() => {
    const c1: Asset[] = []
    const c2: Asset[] = []
    let h1 = 0, h2 = 0
    for (const item of sorted) {
      const aspect = (item.height || 3) / (item.width || 4)
      if (h1 <= h2) { c1.push(item); h1 += aspect }
      else { c2.push(item); h2 += aspect }
    }
    return [c1, c2]
  }, [sorted])

  return (
    <div className="px-3 pb-3">
      <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
        Photos ({assets.length})
      </div>
      <div className="flex gap-2.5">
        {[col1, col2].map((col, ci) => (
          <div key={ci} className="flex-1 space-y-2.5">
            {col.map(asset => (
              <PhotoCard key={asset.id} asset={asset} onToggleStar={() => onToggleStar(asset.id)} onTogglePin={() => onTogglePin(asset.id)} toast={toast} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function PhotoCard({ asset, onToggleStar, onTogglePin, toast }: { asset: Asset; onToggleStar: () => void; onTogglePin: () => void; toast: (msg: string, color?: string) => void }) {
  const aspect = ((asset.height || 3) / (asset.width || 4)) * 100

  return (
    <div className="group border border-[var(--border)] bg-[var(--card)]  overflow-hidden">
      {/* Image placeholder with correct aspect ratio */}
      <div
        className="relative bg-[var(--surface-alt)] flex items-center justify-center overflow-hidden"
        style={{ paddingBottom: `${Math.min(aspect, 120)}%` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Image size={28} className="text-[var(--muted-foreground)] opacity-30" />
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() => toast("Viewing " + asset.name, "var(--orange)")}
            className="p-2 bg-white/90 text-black border-[2px] border-black"
          >
            <Eye size={16} />
          </button>
        </div>
        {/* Pin badge */}
        {asset.pinned && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[var(--cyan)] text-white font-mono text-[8px] font-bold flex items-center gap-0.5">
            <Pin size={8} /> PINNED
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-2">
        <div className="font-mono text-[10px] font-bold text-[var(--foreground)] truncate">{asset.name}</div>
        <AssetMeta asset={asset} />
        <div className="flex items-center justify-between mt-1.5">
          <AssetActions asset={asset} onToggleStar={onToggleStar} onTogglePin={onTogglePin} toast={toast} compact />
          {asset.linkedEntries.length > 0 && (
            <span className="font-mono text-[8px] text-[var(--cyan)] font-bold">{asset.linkedEntries[0]}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// F3: VIDEOS — grid with play overlay
// ──────────────────────────────────────────────────────────────

function VideosGrid({ assets, onToggleStar, onTogglePin, toast }: { assets: Asset[]; onToggleStar: (id: string) => void; onTogglePin: (id: string) => void; toast: (msg: string, color?: string) => void }) {
  const sorted = React.useMemo(() =>
    [...assets].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (a.starred !== b.starred) return a.starred ? -1 : 1
      return 0
    }), [assets])

  return (
    <div className="px-3 pb-3">
      <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
        Videos ({assets.length})
      </div>
      <div className="space-y-2.5">
        {sorted.map(asset => (
          <VideoCard key={asset.id} asset={asset} onToggleStar={() => onToggleStar(asset.id)} onTogglePin={() => onTogglePin(asset.id)} toast={toast} />
        ))}
      </div>
    </div>
  )
}

function VideoCard({ asset, onToggleStar, onTogglePin, toast }: { asset: Asset; onToggleStar: () => void; onTogglePin: () => void; toast: (msg: string, color?: string) => void }) {
  return (
    <div className="group border border-[var(--border)] bg-[var(--card)]  overflow-hidden">
      {/* Video thumbnail with play overlay */}
      <div className="relative bg-[var(--surface-alt)] flex items-center justify-center" style={{ paddingBottom: "56.25%" }}>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--surface-alt)] to-[var(--border)]">
          <Video size={32} className="text-[var(--muted-foreground)] opacity-20" />
        </div>
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => toast("Playing " + asset.name, "var(--pink)")}
            className="w-12 h-12 flex items-center justify-center bg-black/70 text-[var(--gold)] border border-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-black transition-colors"
          >
            <Play size={20} fill="white" />
          </button>
        </div>
        {/* Duration badge */}
        {asset.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white font-mono text-[10px] font-bold">
            {asset.duration}
          </div>
        )}
        {/* Pin badge */}
        {asset.pinned && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[var(--cyan)] text-white font-mono text-[8px] font-bold flex items-center gap-0.5">
            <Pin size={8} /> PINNED
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-2.5">
        <div className="font-mono text-[11px] font-bold text-[var(--foreground)]">{asset.name}</div>
        <AssetMeta asset={asset} />
        <div className="flex items-center justify-between mt-1.5">
          <AssetActions asset={asset} onToggleStar={onToggleStar} onTogglePin={onTogglePin} toast={toast} compact />
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// F4: DOCUMENTS — PDF preview cards
// ──────────────────────────────────────────────────────────────

function DocumentsList({ assets, onToggleStar, onTogglePin, toast }: { assets: Asset[]; onToggleStar: (id: string) => void; onTogglePin: (id: string) => void; toast: (msg: string, color?: string) => void }) {
  const sorted = React.useMemo(() =>
    [...assets].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (a.starred !== b.starred) return a.starred ? -1 : 1
      return 0
    }), [assets])

  return (
    <div className="px-3 pb-3">
      <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
        Documents ({assets.length})
      </div>
      <div className="space-y-2">
        {sorted.map(asset => (
          <DocumentCard key={asset.id} asset={asset} onToggleStar={() => onToggleStar(asset.id)} onTogglePin={() => onTogglePin(asset.id)} toast={toast} />
        ))}
      </div>
    </div>
  )
}

function DocumentCard({ asset, onToggleStar, onTogglePin, toast }: { asset: Asset; onToggleStar: () => void; onTogglePin: () => void; toast: (msg: string, color?: string) => void }) {
  return (
    <div className="flex items-stretch border border-[var(--border)] bg-[var(--card)]  overflow-hidden">
      {/* PDF preview thumbnail */}
      <div className="w-20 flex-shrink-0 bg-[var(--surface-alt)] border-r-[2.5px] border-[var(--border)] flex flex-col items-center justify-center p-2 relative">
        <FileText size={24} className="text-[var(--cyan)] mb-1" />
        <span className="font-mono text-[8px] font-bold text-[var(--muted-foreground)]">PDF</span>
        {asset.pages && (
          <span className="font-mono text-[8px] text-[var(--muted-foreground)]">{asset.pages}p</span>
        )}
        {asset.pinned && (
          <div className="absolute top-1 left-1">
            <Pin size={10} className="text-[var(--cyan)]" fill="currentColor" />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 p-2.5 min-w-0">
        <div className="font-mono text-[11px] font-bold text-[var(--foreground)] truncate">{asset.name}</div>
        <div className="font-mono text-[9px] text-[var(--muted-foreground)] mt-0.5">
          {asset.pages && `${asset.pages} pages`}{asset.fileSize && ` · ${asset.fileSize}`}
        </div>
        <AssetMeta asset={asset} />
        <div className="flex items-center gap-2 mt-2">
          <AssetActions asset={asset} onToggleStar={onToggleStar} onTogglePin={onTogglePin} toast={toast} compact />
          <button
            onClick={() => toast("Opening " + asset.name, "var(--cyan)")}
            className="ml-auto flex items-center gap-1 px-2 py-1 border-[2px] border-[var(--cyan)] text-[var(--cyan)] font-mono text-[9px] font-bold hover:bg-[var(--cyan)] hover:text-white transition-colors"
          >
            <ExternalLink size={10} />
            View
          </button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// F5: AUDIO — player rows with waveform visualization
// ──────────────────────────────────────────────────────────────

function AudioList({ assets, onToggleStar, onTogglePin, toast }: { assets: Asset[]; onToggleStar: (id: string) => void; onTogglePin: (id: string) => void; toast: (msg: string, color?: string) => void }) {
  const [playingId, setPlayingId] = React.useState<string | null>(null)

  const sorted = React.useMemo(() =>
    [...assets].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (a.starred !== b.starred) return a.starred ? -1 : 1
      return 0
    }), [assets])

  return (
    <div className="px-3 pb-3">
      <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
        Audio ({assets.length})
      </div>
      <div className="space-y-2">
        {sorted.map(asset => (
          <AudioRow
            key={asset.id}
            asset={asset}
            isPlaying={playingId === asset.id}
            onTogglePlay={() => setPlayingId(prev => prev === asset.id ? null : asset.id)}
            onToggleStar={() => onToggleStar(asset.id)}
            onTogglePin={() => onTogglePin(asset.id)}
            toast={toast}
          />
        ))}
      </div>
    </div>
  )
}

function AudioRow({ asset, isPlaying, onTogglePlay, onToggleStar, onTogglePin, toast }: { asset: Asset; isPlaying: boolean; onTogglePlay: () => void; onToggleStar: () => void; onTogglePin: () => void; toast: (msg: string, color?: string) => void }) {
  // Fake waveform bars
  const bars = React.useMemo(() => Array.from({ length: 32 }, () => 15 + Math.random() * 85), [])

  return (
    <div className={cn(
      "border border-[var(--border)] bg-[var(--card)]  overflow-hidden",
      isPlaying && "border-[var(--green)]"
    )}>
      <div className="p-3">
        {/* Top row: play + info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className={cn(
              "w-10 h-10 flex-shrink-0 flex items-center justify-center border transition-colors",
              isPlaying
                ? "border-[var(--green)] bg-[var(--green)] text-white"
                : "border-[var(--border)] bg-[var(--surface-alt)] text-[var(--foreground)] hover:border-[var(--green)]"
            )}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[11px] font-bold text-[var(--foreground)] truncate">{asset.name}</div>
            <div className="font-mono text-[9px] text-[var(--muted-foreground)] flex items-center gap-1.5">
              <Clock size={9} />
              {asset.audioDuration}
              {asset.pinned && <><span>&middot;</span><Pin size={8} className="text-[var(--cyan)]" fill="currentColor" /></>}
            </div>
          </div>
          <AssetActions asset={asset} onToggleStar={onToggleStar} onTogglePin={onTogglePin} toast={toast} compact />
        </div>

        {/* Waveform visualization */}
        <div className="mt-2.5 flex items-end gap-[1.5px] h-8 px-1">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 transition-all duration-100"
              style={{
                height: `${h}%`,
                backgroundColor: isPlaying && i < bars.length * 0.35
                  ? "var(--green)"
                  : "var(--border)",
                opacity: isPlaying && i < bars.length * 0.35 ? 1 : 0.5,
              }}
            />
          ))}
        </div>

        {/* Description */}
        {asset.description && (
          <p className="font-serif text-[10px] text-[var(--muted-foreground)] mt-2 italic">{asset.description}</p>
        )}

        <AssetMeta asset={asset} />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Characters Tab (updated design)
// ──────────────────────────────────────────────────────────────

function CharactersTab({ toast }: { toast: (msg: string, color?: string) => void }) {
  return (
    <div className="p-4 space-y-4">
      <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
        Characters
      </div>

      {CHARACTER_PROFILES.map((char) => (
        <div
          key={char.id}
          className="border border-[var(--border)] bg-[var(--card)] p-3 "
          style={{ borderLeftColor: char.roleColor, borderLeftWidth: "4px" }}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-sans text-sm font-bold text-[var(--foreground)]">
                {char.name}
              </div>
              <div className="font-mono text-[9px] font-bold" style={{ color: char.roleColor }}>
                {char.role}
              </div>
            </div>
          </div>

          <p className="font-serif text-xs text-[var(--muted-foreground)] mb-3">
            {char.profile}
          </p>

          <label className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 border border-[var(--cyan)] text-[var(--cyan)] font-mono text-[10px] font-bold  hover:bg-[var(--cyan)] hover:text-white transition-colors cursor-pointer">
            <Upload size={12} />
            Upload Evidence
            <input type="file" className="hidden" onChange={() => toast(`Upload evidence for ${char.name}`, "var(--cyan)")} />
          </label>
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// AI Tab — Notebook / LM Workspace
// Assets live here. Toggle them on/off as context. Chat references them.
// ──────────────────────────────────────────────────────────────

function AITab({ toast }: { toast: (msg: string, color?: string) => void }) {
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "I'm your AI legal assistant. Toggle assets on below to add them to my context — I'll reference them when answering. Ask me anything about this case." },
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [contextAssets, setContextAssets] = React.useState<Set<string>>(new Set())
  const [contextExpanded, setContextExpanded] = React.useState(true)
  const [assetSearch, setAssetSearch] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Group assets by category
  const assetsByCategory = React.useMemo(() => {
    const cats = { document: [] as Asset[], photo: [] as Asset[], video: [] as Asset[], audio: [] as Asset[] }
    ASSET_LIBRARY.forEach(a => cats[a.category].push(a))
    return cats
  }, [])

  // Filter by search
  const filteredAssets = React.useMemo(() => {
    if (!assetSearch) return ASSET_LIBRARY
    const q = assetSearch.toLowerCase()
    return ASSET_LIBRARY.filter(a => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.uploader.toLowerCase().includes(q))
  }, [assetSearch])

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleContext = (id: string) => {
    setContextAssets(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        toast("Removed from context", "var(--muted-foreground)")
      } else {
        next.add(id)
        const asset = ASSET_LIBRARY.find(a => a.id === id)
        toast(`Added "${asset?.name}" to context`, "var(--purple)")
      }
      return next
    })
  }

  const enableAll = () => {
    setContextAssets(new Set(ASSET_LIBRARY.map(a => a.id)))
    toast(`All ${ASSET_LIBRARY.length} assets added to context`, "var(--purple)")
  }

  const disableAll = () => {
    setContextAssets(new Set())
    toast("Context cleared", "var(--muted-foreground)")
  }

  const handleSend = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { role: "user", content: input }])
    setInput("")
    setIsLoading(true)

    const ctxCount = contextAssets.size
    const ctxNames = ASSET_LIBRARY.filter(a => contextAssets.has(a.id)).map(a => a.name).slice(0, 3)
    const ctxPreview = ctxNames.length > 0 ? `Referencing ${ctxNames.join(", ")}${ctxCount > 3 ? ` +${ctxCount - 3} more` : ""}. ` : ""

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `${ctxPreview}Based on the docket entries and case context, the suppression hearing ruling (Dkt 102) is the pivotal moment — the Judge's split decision denying suppression but dismissing murder counts creates peak narrative tension. The death penalty was subsequently withdrawn (Dkt 113). Would you like me to draft a scene around this?`,
        },
      ])
      setIsLoading(false)
    }, 1500)
  }

  const categoryIcon = { photo: Image, video: Video, document: FileText, audio: Volume2 }
  const categoryColor = { photo: "var(--orange)", video: "var(--pink)", document: "var(--cyan)", audio: "var(--green)" }
  const categoryLabel = { photo: "Photos", video: "Videos", document: "Documents", audio: "Audio" }

  return (
    <div className="flex flex-col h-full">

      {/* ── CONTEXT ASSETS PANEL ── */}
      <div className="border-b-[2.5px] border-[var(--border)]">
        <button
          onClick={() => setContextExpanded(!contextExpanded)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-[var(--card)] hover:bg-[var(--selection)] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-[var(--purple)]" />
            <span className="font-mono text-[10px] font-bold text-[var(--foreground)] uppercase">
              Context Assets
            </span>
            {contextAssets.size > 0 && (
              <span className="px-1.5 py-0.5 bg-[var(--purple)] text-white font-mono text-[8px] font-bold">
                {contextAssets.size} active
              </span>
            )}
          </div>
          <ChevronDown size={14} className={cn("text-[var(--muted-foreground)] transition-transform", contextExpanded && "rotate-180")} />
        </button>

        {contextExpanded && (
          <div className="bg-[var(--surface-alt)]">
            {/* Search + bulk actions */}
            <div className="px-3 py-2 flex items-center gap-2 border-b border-[var(--border)]">
              <div className="relative flex-1">
                <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="Filter assets..."
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 border-[2px] border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono text-[10px] placeholder:text-[var(--muted-foreground)] focus:border-[var(--purple)] focus:outline-none"
                />
              </div>
              <button
                onClick={enableAll}
                className="px-2 py-1.5 border-[2px] border-[var(--border)] font-mono text-[8px] font-bold text-[var(--purple)] hover:bg-[var(--purple)] hover:text-white hover:border-[var(--purple)] transition-colors"
              >
                All On
              </button>
              <button
                onClick={disableAll}
                className="px-2 py-1.5 border-[2px] border-[var(--border)] font-mono text-[8px] font-bold text-[var(--muted-foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:border-[var(--foreground)] transition-colors"
              >
                All Off
              </button>
            </div>

            {/* Asset list with toggles — grouped by category */}
            <div className="max-h-52 overflow-y-auto">
              {(["document", "photo", "video", "audio"] as const).map(cat => {
                const catAssets = filteredAssets.filter(a => a.category === cat)
                if (catAssets.length === 0) return null
                const Icon = categoryIcon[cat]
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)]">
                      <Icon size={10} style={{ color: categoryColor[cat] }} />
                      <span className="font-mono text-[8px] font-bold uppercase tracking-wider" style={{ color: categoryColor[cat] }}>
                        {categoryLabel[cat]} ({catAssets.length})
                      </span>
                    </div>
                    {catAssets.map(asset => {
                      const isOn = contextAssets.has(asset.id)
                      return (
                        <button
                          key={asset.id}
                          onClick={() => toggleContext(asset.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all",
                            "hover:bg-[var(--selection)]",
                            isOn && "bg-[var(--purple)]/5"
                          )}
                        >
                          {/* Toggle switch */}
                          <div className={cn(
                            "relative w-7 h-[14px] border-[2px] transition-colors duration-150 shrink-0",
                            isOn
                              ? "bg-[var(--purple)]/30 border-[var(--purple)]"
                              : "bg-[var(--surface-alt)] border-[var(--border)]"
                          )}>
                            <div className={cn(
                              "absolute top-[1px] w-[8px] h-[8px] border-[1.5px] transition-all duration-150",
                              isOn
                                ? "left-[13px] bg-[var(--purple)] border-[var(--purple)]"
                                : "left-[1px] bg-[var(--muted-foreground)] border-[var(--border)]"
                            )} />
                          </div>

                          {/* Asset name + meta */}
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "font-mono text-[10px] font-bold truncate transition-colors",
                              isOn ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                            )}>
                              {asset.name}
                            </div>
                            <div className="font-mono text-[8px] text-[var(--muted-foreground)]">
                              {asset.date} &middot; {asset.uploader}
                            </div>
                          </div>

                          {/* Status indicator */}
                          {isOn && (
                            <div className="w-1.5 h-1.5 bg-[var(--purple)] shrink-0" style={{ boxShadow: '0 0 4px var(--purple)' }} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── ACTIVE CONTEXT CHIPS (collapsed summary) ── */}
      {contextAssets.size > 0 && !contextExpanded && (
        <div className="px-3 py-2 border-b-[2.5px] border-[var(--border)] bg-[var(--purple)]/5">
          <div className="flex flex-wrap gap-1">
            {ASSET_LIBRARY.filter(a => contextAssets.has(a.id)).slice(0, 5).map(asset => {
              const Icon = categoryIcon[asset.category]
              return (
                <span
                  key={asset.id}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 border-[2px] border-[var(--purple)]/40 bg-[var(--card)] font-mono text-[8px] text-[var(--foreground)]"
                >
                  <Icon size={8} style={{ color: categoryColor[asset.category] }} />
                  <span className="max-w-[80px] truncate">{asset.name}</span>
                  <button
                    onClick={() => toggleContext(asset.id)}
                    className="ml-0.5 text-[var(--muted-foreground)] hover:text-[var(--red)] transition-colors"
                  >
                    <X size={8} />
                  </button>
                </span>
              )
            })}
            {contextAssets.size > 5 && (
              <span className="px-1.5 py-0.5 font-mono text-[8px] text-[var(--purple)] font-bold">
                +{contextAssets.size - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── CONVERSATION ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "p-2.5 border",
              msg.role === "assistant"
                ? "bg-[var(--surface-alt)] border-[var(--border)]"
                : "bg-[var(--purple)]/10 border-[var(--purple)] ml-3"
            )}
          >
            <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] mb-1 uppercase flex items-center gap-1.5">
              {msg.role === "assistant" ? (
                <><Sparkles size={9} className="text-[var(--purple)]" /> AI Assistant</>
              ) : "You"}
            </div>
            <p className="font-serif text-[13px] text-[var(--foreground)] leading-relaxed">
              {msg.content}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 p-2.5 bg-[var(--surface-alt)] border border-[var(--border)]">
            <Loader2 size={12} className="animate-spin text-[var(--purple)]" />
            <span className="font-mono text-[10px] text-[var(--muted-foreground)]">Analyzing {contextAssets.size} asset{contextAssets.size !== 1 ? "s" : ""}...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── QUICK PROMPTS ── */}
      <div className="px-3 py-2 border-t-[2.5px] border-[var(--border)] bg-[var(--surface-alt)]">
        <div className="flex flex-wrap gap-1">
          {[
            "Analyze timeline",
            "Key rulings",
            "Draft scene",
            "Research precedent",
            "Summarize evidence",
            "Character analysis",
          ].map((action) => (
            <button
              key={action}
              onClick={() => setInput(action)}
              className="px-2 py-1 border-[2px] border-[var(--border)] bg-[var(--surface)] font-mono text-[9px] text-[var(--muted-foreground)] hover:border-[var(--purple)] hover:text-[var(--purple)] transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* ── INPUT ── */}
      <div className="p-3 border-t-[2.5px] border-[var(--border)]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={contextAssets.size > 0 ? `Ask about ${contextAssets.size} asset${contextAssets.size !== 1 ? "s" : ""}...` : "Toggle assets on, then ask..."}
            className="flex-1 px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono text-xs placeholder:text-[var(--muted-foreground)] focus:border-[var(--purple)] focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={cn(
              "px-3 py-2 border font-mono text-xs font-bold ",
              input.trim() && !isLoading
                ? "border-[var(--purple)] bg-[var(--purple)] text-white"
                : "border-[var(--border)] bg-[var(--surface-alt)] text-[var(--muted-foreground)]"
            )}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Share Tab
// ──────────────────────────────────────────────────────────────

function ShareTab({ toast }: { toast: (msg: string, color?: string) => void }) {
  const [shareLink] = React.useState("https://legaldrama.ai/c/usa-v-mangione-7x92k")
  const [copied, setCopied] = React.useState(false)
  const [isPublic, setIsPublic] = React.useState(false)
  const [inviteEmail, setInviteEmail] = React.useState("")

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    toast("Link copied!", "var(--green)")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    toast(`Invitation sent to ${inviteEmail}`, "var(--green)")
    setInviteEmail("")
  }

  return (
    <div className="p-4 space-y-6">
      {/* Visibility */}
      <div>
        <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Project Visibility
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPublic(false)}
            className={cn(
              "flex-1 px-3 py-2.5 flex items-center justify-center gap-2",
              "border transition-all font-mono text-xs font-bold",
              !isPublic
                ? "border-[var(--amber)] bg-[var(--amber)]/15 text-[var(--amber)]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/50"
            )}
          >
            <Lock size={14} />
            Private
          </button>
          <button
            onClick={() => setIsPublic(true)}
            className={cn(
              "flex-1 px-3 py-2.5 flex items-center justify-center gap-2",
              "border transition-all font-mono text-xs font-bold",
              isPublic
                ? "border-[var(--amber)] bg-[var(--amber)]/15 text-[var(--amber)]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]/50"
            )}
          >
            <Globe size={14} />
            Public
          </button>
        </div>
      </div>

      {/* Share Link */}
      <div>
        <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Share Link
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 border border-[var(--border)] bg-[var(--surface-alt)] font-mono text-xs text-[var(--muted-foreground)] truncate">
            {shareLink}
          </div>
          <button
            onClick={copyLink}
            className="px-3 py-2 border border-[var(--border)] font-mono text-xs font-bold  hover:border-[var(--green)]"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Invite */}
      <div>
        <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Invite Collaborator
        </div>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@example.com"
            className="flex-1 px-3 py-2 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-mono text-xs placeholder:text-[var(--muted-foreground)] focus:border-[var(--green)] focus:outline-none"
          />
          <button
            onClick={handleInvite}
            className="px-3 py-2 flex items-center gap-1.5 border border-[var(--green)] bg-[var(--green)] text-white font-mono text-[10px] font-bold "
          >
            <UserPlus size={12} />
            Invite
          </button>
        </div>
      </div>

      {/* Collaborators */}
      <div>
        <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Team ({COLLABORATORS.length})
        </div>
        <div className="space-y-2">
          {COLLABORATORS.map((collab) => (
            <div
              key={collab.id}
              className="flex items-center gap-3 p-2.5 border border-[var(--border)] bg-[var(--card)]"
            >
              <div
                className={cn(
                  "w-8 h-8 flex items-center justify-center",
                  "border-[2px] border-[var(--border)]",
                  "font-mono text-xs font-bold",
                  collab.online ? "bg-[var(--green)]/20 text-[var(--green)]" : "bg-[var(--surface-alt)] text-[var(--muted-foreground)]"
                )}
              >
                {collab.avatar}
              </div>
              <div className="flex-1">
                <div className="font-mono text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
                  {collab.name}
                  {collab.online && (
                    <span className="w-2 h-2 bg-[var(--green)] animate-pulse" />
                  )}
                </div>
                <div className="font-mono text-[9px] text-[var(--muted-foreground)]">
                  {collab.role}
                </div>
              </div>
              <button
                onClick={() => toast("More options", "var(--cyan)")}
                className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <MoreHorizontal size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div>
        <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Recent Activity
        </div>
        <div className="space-y-1.5">
          {ACTIVITY_LOG.map((activity, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5",
                "bg-[var(--surface-alt)] border-[2px] border-[var(--border)]",
                activity.flash && "animate-pulse"
              )}
            >
              <Clock size={10} className="text-[var(--muted-foreground)]" />
              <span className="font-mono text-[9px] text-[var(--muted-foreground)]">
                {activity.time}
              </span>
              <span className="font-mono text-[9px] text-[var(--foreground)]">
                <strong>{activity.user}</strong> {activity.action} <span className="text-[var(--amber)]">{activity.target}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
