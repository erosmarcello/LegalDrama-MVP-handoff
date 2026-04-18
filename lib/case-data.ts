// Lane definitions for case timeline visualization
export const LANES = {
  factual: { label: "FACTUAL", icon: "diamond", emoji: "fire" },
  procedural: { label: "PROCEDURAL", icon: "circle", emoji: "scales" },
  scheduling: { label: "SCHEDULING", icon: "triangle", emoji: "calendar" },
  narrative: { label: "NARRATIVE", icon: "star", emoji: "sparkles" },
} as const

// Type icons
export const TYPE_ICONS: Record<string, string> = {
  filing: "file-text",
  charging: "zap",
  notice: "megaphone",
  motion: "clipboard",
  opposition: "shield",
  reply: "corner-down-left",
  order: "gavel",
  event: "target",
  hearing: "landmark",
  modification: "refresh-cw",
  "scheduling-order": "star",
  transcript: "mic",
  video: "video",
  audio: "volume-2",
  photos: "image",
  documents: "folder",
}

// Chapter type
export interface ChapterSection {
  id: string
  type: "scene" | "narration" | "dialogue" | "action"
  speaker?: string
  content: string
  timestamp?: string
  docketRef?: string
  aiGenerated?: boolean
}

export interface Chapter {
  id: string
  title: string
  subtitle?: string
  dateRange: string
  sections: ChapterSection[]
}

// Chapters
export const CHAPTERS = [
  { key: "origin", title: "THE ARREST", subtitle: "Dec 2024", range: ["2024-12-01", "2025-01-31"] },
  { key: "charges", title: "THE CHARGES", subtitle: "Spring 2025", range: ["2025-02-01", "2025-05-31"] },
  { key: "battle", title: "THE LEGAL BATTLE", subtitle: "Summer-Fall 2025", range: ["2025-06-01", "2025-12-31"] },
  { key: "turn", title: "THE TURNING POINT", subtitle: "Jan 2026", range: ["2026-01-01", "2026-01-31"] },
  { key: "shift", title: "THE SHIFT", subtitle: "Feb-Mar 2026", range: ["2026-02-01", "2026-03-31"] },
  { key: "trial", title: "ROAD TO TRIAL", subtitle: "Apr-Oct 2026", range: ["2026-04-01", "2026-12-31"] },
]

// Chapter data with screenplay content
export const CHAPTER_DATA: Chapter[] = [
  {
    id: "ch1",
    title: "THE ARREST",
    subtitle: "Where it all began",
    dateRange: "December 2024",
    sections: [
      {
        id: "ch1-s1",
        type: "scene",
        content: "EXT. ALTOONA, PENNSYLVANIA - MCDONALD'S - DAY\n\nA quiet morning at the fast food restaurant. LOCAL POLICE approach a man matching the description from the nationwide manhunt. LUIGI MANGIONE, 26, sits alone at a booth, laptop open.",
        timestamp: "Dec 9, 2024",
        aiGenerated: true,
      },
      {
        id: "ch1-s2",
        type: "dialogue",
        speaker: "OFFICER",
        content: "Sir, can I see some identification?",
        timestamp: "Dec 9, 2024",
        aiGenerated: true,
      },
      {
        id: "ch1-s3",
        type: "narration",
        content: "The officer's hand rests on his holster. Mangione looks up slowly, his expression unreadable. A folded document peeks from his jacket pocket—what investigators will later call 'the manifesto.'",
        aiGenerated: true,
      },
      {
        id: "ch1-s4",
        type: "action",
        content: "Mangione reaches for his fake ID. The officer notices the gun-shaped bulge in his pocket. Backup is called. Within minutes, the most wanted man in America is in handcuffs.",
        docketRef: "Dkt 1",
        aiGenerated: true,
      },
    ],
  },
  {
    id: "ch2",
    title: "THE CHARGES",
    subtitle: "A federal case takes shape",
    dateRange: "Spring 2025",
    sections: [
      {
        id: "ch2-s1",
        type: "scene",
        content: "INT. FEDERAL COURTHOUSE - S.D.N.Y. - DAY\n\nThe grand jury room. Prosecutors present evidence. Photos of the crime scene. Surveillance footage. The recovered weapon. The manifesto.",
        timestamp: "Apr 17, 2025",
        docketRef: "Dkt 22",
        aiGenerated: true,
      },
      {
        id: "ch2-s2",
        type: "narration",
        content: "Four counts. Murder in aid of stalking. Stalking. Two firearms charges. The government's theory: Mangione meticulously planned and executed the killing of Brian Thompson, CEO of UnitedHealthcare.",
        docketRef: "Dkt 22",
        aiGenerated: true,
      },
      {
        id: "ch2-s3",
        type: "scene",
        content: "INT. COURTROOM - ONE WEEK LATER - DAY\n\nDEFENSE COUNSEL KAREN FRIEDMAN AGNIFILO stands at the podium. The gallery is packed. Cameras wait outside.",
        timestamp: "Apr 24, 2025",
        aiGenerated: true,
      },
      {
        id: "ch2-s4",
        type: "dialogue",
        speaker: "AUSA",
        content: "The United States hereby provides notice of its intent to seek the death penalty in this matter.",
        docketRef: "Dkt 25",
        aiGenerated: true,
      },
    ],
  },
  {
    id: "ch3",
    title: "THE LEGAL BATTLE",
    subtitle: "Motion warfare begins",
    dateRange: "Summer-Fall 2025",
    sections: [
      {
        id: "ch3-s1",
        type: "narration",
        content: "The defense team files motion after motion. Suppress the search. Dismiss the charges. Challenge the indictment. The legal chess match has begun.",
        timestamp: "Sep-Oct 2025",
        aiGenerated: true,
      },
      {
        id: "ch3-s2",
        type: "scene",
        content: "INT. DEFENSE WAR ROOM - NIGHT\n\nAGNIFILO and her team review the arrest footage for the hundredth time. Something doesn't add up about the initial stop.",
        docketRef: "Dkt 51, 59",
        aiGenerated: true,
      },
      {
        id: "ch3-s3",
        type: "dialogue",
        speaker: "AGNIFILO",
        content: "The Fourth Amendment exists for a reason. You can't just stop someone because they 'look like' a suspect. Where's the particularized suspicion?",
        aiGenerated: true,
      },
    ],
  },
  {
    id: "ch4",
    title: "THE TURNING POINT",
    subtitle: "A pivotal ruling",
    dateRange: "January 2026",
    sections: [
      {
        id: "ch4-s1",
        type: "scene",
        content: "INT. COURTROOM - S.D.N.Y. - DAY\n\nJUDGE MARGARET M. GARNETT takes the bench. The courtroom falls silent. This is the moment that will shape the trial.",
        timestamp: "Jan 30, 2026",
        docketRef: "Dkt 102, 103",
        aiGenerated: true,
      },
      {
        id: "ch4-s2",
        type: "dialogue",
        speaker: "JUDGE GARNETT",
        content: "The motion to suppress is DENIED. However, the Court finds that Counts Three and Four must be DISMISSED for lack of sufficient nexus to federal jurisdiction.",
        docketRef: "Dkt 102, 103",
        aiGenerated: true,
      },
      {
        id: "ch4-s3",
        type: "narration",
        content: "A split decision. The evidence stays in—but two murder counts are gone. The death penalty calculus just changed. Both sides claim victory. Neither has won.",
        aiGenerated: true,
      },
    ],
  },
  {
    id: "ch5",
    title: "THE SHIFT",
    subtitle: "Death penalty withdrawn",
    dateRange: "February-March 2026",
    sections: [
      {
        id: "ch5-s1",
        type: "scene",
        content: "INT. U.S. ATTORNEY'S OFFICE - DAY\n\nThe prosecution team reconvenes. With the murder counts gone, the calculus has changed. A difficult decision must be made.",
        timestamp: "Feb 27, 2026",
        aiGenerated: true,
      },
      {
        id: "ch5-s2",
        type: "narration",
        content: "On February 27, 2026, the government files its notice: the death penalty is no longer being sought. Life imprisonment remains on the table. The stakes are still existential.",
        docketRef: "Dkt 113",
        aiGenerated: true,
      },
    ],
  },
  {
    id: "ch6",
    title: "ROAD TO TRIAL",
    subtitle: "The final preparations",
    dateRange: "April-October 2026",
    sections: [
      {
        id: "ch6-s1",
        type: "narration",
        content: "The master schedule is set. Fourteen critical dates leading to trial. Motion deadlines. Exhibit exchanges. Jury selection. The machinery of justice grinds forward.",
        docketRef: "Dkt 105",
        aiGenerated: true,
      },
      {
        id: "ch6-s2",
        type: "scene",
        content: "INT. COURTROOM - FUTURE - DAY\n\nVOIR DIRE begins. Hundreds of potential jurors. Can twelve people be found who haven't already formed an opinion about the most publicized killing of the decade?",
        timestamp: "Sep 8, 2026",
        aiGenerated: true,
      },
      {
        id: "ch6-s3",
        type: "narration",
        content: "October 13, 2026. The trial begins. America watches. The story of Luigi Mangione—vigilante or villain—will finally be told in a court of law.",
        timestamp: "Oct 13, 2026",
        aiGenerated: true,
      },
    ],
  },
]

// Docket entry type
export interface DocketEntry {
  number: number
  date: string
  text: string
  type: "filing" | "motion" | "order" | "notice" | "hearing" | "other"
  tier?: 1 | 2 | 3
  starred?: boolean
  lane?: "factual" | "procedural" | "scheduling" | "narrative"
  description?: string
}

// Full docket entries
export const FULL_DOCKET_ENTRIES: DocketEntry[] = [
  { number: 1, date: "12/18/2024", text: "SEALED COMPLAINT as to Luigi Nicholas Mangione (1), 18 U.S.C. 2261A, 2261(b), 924(j), and 924(c).", type: "filing", tier: 1, starred: true, lane: "factual", description: "Federal complaint initiating prosecution for murder in aid of stalking and firearms offenses." },
  { number: 3, date: "12/19/2024", text: "NOTICE OF ATTORNEY APPEARANCE: Karen Friedman Agnifilo for Luigi Nicholas Mangione.", type: "notice", tier: 2, lane: "procedural", description: "High-profile defense attorney enters appearance for defendant." },
  { number: 5, date: "12/19/2024", text: "Minute Entry: Initial Appearance. Detention Hearing held. Defendant remanded.", type: "hearing", tier: 1, lane: "procedural", description: "First court appearance. Government argues for detention based on flight risk." },
  { number: 7, date: "12/19/2024", text: "Brady ORDER as to Luigi Nicholas Mangione. Government shall produce all exculpatory material.", type: "order", tier: 2, lane: "procedural", description: "Standard discovery order requiring disclosure of exculpatory evidence." },
  { number: 8, date: "01/06/2025", text: "ORDER TO CONTINUE IN THE INTEREST OF JUSTICE. Time excluded 1/6/25 - 2/17/25.", type: "order", tier: 3, lane: "scheduling", description: "Speedy trial clock paused for case preparation." },
  { number: 12, date: "02/17/2025", text: "Minute Entry: Status Conference. Case management schedule discussed.", type: "hearing", tier: 3, lane: "scheduling", description: "Parties confer with court on discovery and motion deadlines." },
  { number: 15, date: "03/10/2025", text: "MOTION for Discovery by Luigi Nicholas Mangione. Seeks early disclosure of government evidence.", type: "motion", tier: 2, lane: "procedural", description: "Defense seeks expedited access to government evidence." },
  { number: 18, date: "03/24/2025", text: "RESPONSE in Opposition to Motion for Discovery filed by USA.", type: "filing", tier: 3, lane: "procedural", description: "Government opposes early disclosure citing ongoing investigation." },
  { number: 20, date: "04/01/2025", text: "ORDER granting in part Motion for Discovery. Phased disclosure schedule established.", type: "order", tier: 2, lane: "procedural", description: "Court establishes compromise discovery timeline." },
  { number: 22, date: "04/17/2025", text: "REDACTED INDICTMENT as to Luigi Nicholas Mangione (1) Counts 1-4. Count 1: Murder in aid of stalking. Count 2: Stalking. Counts 3-4: Firearms offenses.", type: "filing", tier: 1, starred: true, lane: "factual", description: "Grand jury returns four-count indictment for capital murder case." },
  { number: 25, date: "04/24/2025", text: "NOTICE OF INTENT TO SEEK DEATH PENALTY filed by USA as to Luigi Nicholas Mangione.", type: "notice", tier: 1, starred: true, lane: "factual", description: "Government formally notifies intent to pursue capital punishment." },
  { number: 28, date: "05/01/2025", text: "Minute Entry: Arraignment on Indictment. Defendant pleads NOT GUILTY to all counts.", type: "hearing", tier: 1, lane: "procedural", description: "Formal reading of charges. Defendant enters not guilty plea." },
  { number: 32, date: "05/15/2025", text: "MOTION to Appoint Additional Counsel for capital case by Luigi Nicholas Mangione.", type: "motion", tier: 2, lane: "procedural", description: "Defense requests learned counsel given capital exposure." },
  { number: 35, date: "05/29/2025", text: "ORDER granting Motion to Appoint Additional Counsel. Marc Agnifilo admitted pro hac vice.", type: "order", tier: 2, lane: "procedural", description: "Court admits co-counsel; defense team expands for capital defense." },
  { number: 40, date: "07/10/2025", text: "SEALED MOTION filed by USA. [Redacted content]", type: "motion", tier: 3, lane: "procedural", description: "Government files under seal; substance remains undisclosed." },
  { number: 45, date: "08/15/2025", text: "MOTION for Bill of Particulars by Luigi Nicholas Mangione.", type: "motion", tier: 2, lane: "procedural", description: "Defense demands specificity on government's theory of interstate stalking." },
  { number: 48, date: "09/01/2025", text: "RESPONSE to Motion for Bill of Particulars filed by USA.", type: "filing", tier: 3, lane: "procedural", description: "Government argues indictment already provides sufficient notice." },
  { number: 51, date: "09/20/2025", text: "MOTION TO DISMISS INDICTMENT by Luigi Nicholas Mangione. Constitutional challenge to stalking statute as applied.", type: "motion", tier: 1, starred: true, lane: "procedural", description: "Core constitutional attack — vagueness, federalism, and applied-challenge grounds." },
  { number: 54, date: "10/01/2025", text: "RESPONSE in Opposition to Motion to Dismiss filed by USA.", type: "filing", tier: 2, lane: "procedural", description: "Government defends statute and charging theory." },
  { number: 57, date: "10/08/2025", text: "REPLY in Support of Motion to Dismiss by Luigi Nicholas Mangione.", type: "filing", tier: 2, lane: "procedural", description: "Defense rebuts government's constitutional arguments." },
  { number: 59, date: "10/11/2025", text: "MOTION TO SUPPRESS EVIDENCE by Luigi Nicholas Mangione. Challenges warrantless arrest and subsequent search.", type: "motion", tier: 1, starred: true, lane: "procedural", description: "Fourth Amendment challenge to Altoona McDonald's stop and backpack search." },
  { number: 62, date: "10/25/2025", text: "RESPONSE in Opposition to Motion to Suppress filed by USA.", type: "filing", tier: 2, lane: "procedural", description: "Government argues reasonable suspicion and inevitable-discovery doctrines." },
  { number: 65, date: "11/05/2025", text: "REPLY in Support of Motion to Suppress by Luigi Nicholas Mangione.", type: "filing", tier: 2, lane: "procedural", description: "Defense rebuts reasonable-suspicion theory with arrest-scene facts." },
  { number: 70, date: "11/20/2025", text: "Minute Entry: Oral Argument on pending motions. Court takes matters under advisement.", type: "hearing", tier: 2, lane: "procedural", description: "Lengthy bench argument on both suppression and dismissal motions." },
  { number: 75, date: "12/10/2025", text: "ORDER setting evidentiary hearing on suppression motion for January 23, 2026.", type: "order", tier: 2, lane: "scheduling", description: "Court finds factual disputes require live testimony." },
  { number: 80, date: "01/10/2026", text: "WITNESS LIST for suppression hearing filed by USA.", type: "filing", tier: 3, lane: "procedural", description: "Government identifies arresting officers and FBI agents." },
  { number: 85, date: "01/15/2026", text: "WITNESS LIST for suppression hearing filed by Luigi Nicholas Mangione.", type: "filing", tier: 3, lane: "procedural", description: "Defense identifies expert on identification procedures." },
  { number: 90, date: "01/23/2026", text: "Minute Entry: Suppression Hearing Day 1. Government witnesses testify regarding arrest circumstances.", type: "hearing", tier: 1, lane: "procedural", description: "Direct testimony on the Altoona stop; chain-of-custody established." },
  { number: 95, date: "01/24/2026", text: "Minute Entry: Suppression Hearing Day 2. Defense cross-examination. Hearing concluded.", type: "hearing", tier: 1, lane: "procedural", description: "Cross of arresting officer; defense rests on factual record." },
  { number: 100, date: "01/28/2026", text: "POST-HEARING BRIEF filed by Luigi Nicholas Mangione.", type: "filing", tier: 2, lane: "procedural", description: "Defense synthesizes hearing record in written closing." },
  { number: 101, date: "01/29/2026", text: "POST-HEARING BRIEF filed by USA.", type: "filing", tier: 2, lane: "procedural", description: "Government's written closing on suppression record." },
  { number: 102, date: "01/30/2026", text: "MEMORANDUM OPINION AND ORDER denying Motion to Suppress. Court finds stop and search lawful under totality of circumstances.", type: "order", tier: 1, starred: true, lane: "procedural", description: "Evidence stays in — arrest upheld under totality-of-the-circumstances test." },
  { number: 103, date: "01/30/2026", text: "MEMORANDUM OPINION AND ORDER granting in part Motion to Dismiss. Counts 3 and 4 DISMISSED for insufficient federal nexus. Counts 1 and 2 remain.", type: "order", tier: 1, starred: true, lane: "procedural", description: "Two firearms counts fall; capital calculus shifts." },
  { number: 105, date: "02/03/2026", text: "MASTER SCHEDULING ORDER. Sets 14 trial preparation deadlines. Trial to commence October 13, 2026.", type: "order", tier: 1, starred: true, lane: "scheduling", description: "Trial date locked; 14 prep deadlines cascade from here." },
  { number: 108, date: "02/15/2026", text: "MOTION for Reconsideration of suppression ruling by Luigi Nicholas Mangione.", type: "motion", tier: 2, lane: "procedural", description: "Defense asks Court to revisit suppression denial." },
  { number: 110, date: "02/20/2026", text: "RESPONSE in Opposition to Motion for Reconsideration filed by USA.", type: "filing", tier: 3, lane: "procedural", description: "Government argues no manifest error or new facts." },
  { number: 112, date: "02/25/2026", text: "ORDER denying Motion for Reconsideration. Court adheres to prior ruling.", type: "order", tier: 2, lane: "procedural", description: "Suppression denial becomes final trial-court ruling." },
  { number: 113, date: "02/27/2026", text: "NOTICE OF WITHDRAWAL OF DEATH PENALTY filed by USA. Government no longer seeks capital punishment.", type: "notice", tier: 1, starred: true, lane: "procedural", description: "Capital case becomes life case; sentencing stakes reset." },
  { number: 115, date: "03/05/2026", text: "JOINT STATUS REPORT filed by parties regarding discovery progress.", type: "filing", tier: 3, lane: "procedural", description: "Parties update the Court on discovery completeness." },
  { number: 118, date: "03/12/2026", text: "MOTION in Limine No. 1 by USA. Seeks to admit manifesto and related writings.", type: "motion", tier: 2, lane: "procedural", description: "First battle over admissibility of defendant's writings." },
  { number: 120, date: "03/18/2026", text: "MOTION TO CONTINUE TRIAL by Luigi Nicholas Mangione. Seeks 90-day postponement.", type: "motion", tier: 2, lane: "scheduling", description: "Defense cites discovery volume; requests trial push." },
  { number: 123, date: "03/23/2026", text: "ORDER setting conference for April 1, 2026 to address continuance motion.", type: "order", tier: 2, lane: "scheduling", description: "Court schedules argument on trial-date question." },
]

// Timeline events
// Classification rubric:
//   factual   = what happened in the world (real-world events, acts, arrests)
//   procedural = what happens on the docket (filings, motions, orders, rulings, hearings)
//   scheduling = future/planned court dates (trial, voir dire, deadlines, conferences)
//   narrative  = reserved for authored story beats (unused in base data)
export const TIMELINE_EVENTS = [
  // ─── Factual (real-world events) ───
  { id: "f1", lane: "factual" as const, date: "2024-12-04", title: "Thompson Killed", description: "Brian Thompson shot outside Hilton Midtown NYC", tier: 1 },
  { id: "f2", lane: "factual" as const, date: "2024-12-09", title: "Mangione Arrested", description: "Arrested at McDonald's in Altoona, PA", tier: 1 },
  { id: "f3", lane: "factual" as const, date: "2024-12-18", title: "Federal Complaint", description: "Sealed complaint filed in S.D.N.Y.", tier: 1, docketNum: 1 },

  // ─── Procedural (docket events, motions, rulings, hearings) ───
  { id: "p1", lane: "procedural" as const, date: "2024-12-19", title: "Initial Appearance", description: "Detention ordered on consent", tier: 1, docketNum: 5 },
  { id: "p1a", lane: "procedural" as const, date: "2024-12-19", title: "Karen Agnifilo Appears", description: "Lead defense counsel enters appearance", tier: 2, docketNum: 3 },
  { id: "p1b", lane: "procedural" as const, date: "2024-12-19", title: "Brady Order", description: "Standard discovery obligation imposed on USA", tier: 3, docketNum: 7 },
  { id: "p1c", lane: "procedural" as const, date: "2025-02-17", title: "Status Conference", description: "Case management schedule discussed", tier: 3, docketNum: 12 },
  { id: "p1d", lane: "procedural" as const, date: "2025-03-10", title: "Discovery Motion Filed", description: "Defense seeks early disclosure", tier: 3, docketNum: 15 },
  { id: "p1e", lane: "procedural" as const, date: "2025-04-01", title: "Discovery Order", description: "Court sets phased disclosure schedule", tier: 3, docketNum: 20 },
  { id: "p2", lane: "procedural" as const, date: "2025-04-17", title: "Indictment", description: "Grand jury returns 4-count indictment", tier: 1, docketNum: 22 },
  { id: "p2a", lane: "procedural" as const, date: "2025-04-24", title: "Death Penalty Notice", description: "Government files notice of intent to seek capital punishment", tier: 1, docketNum: 25 },
  { id: "p3", lane: "procedural" as const, date: "2025-04-25", title: "Arraignment", description: "Not guilty plea entered on all counts", tier: 1, docketNum: 28 },
  { id: "p3a", lane: "procedural" as const, date: "2025-05-15", title: "Learned Counsel Motion", description: "Defense seeks additional capital-case counsel", tier: 2, docketNum: 32 },
  { id: "p3b", lane: "procedural" as const, date: "2025-05-29", title: "Marc Agnifilo Admitted", description: "Co-counsel admitted pro hac vice", tier: 2, docketNum: 35 },
  { id: "p3c", lane: "procedural" as const, date: "2025-08-15", title: "Bill of Particulars", description: "Defense seeks specification of charges", tier: 3, docketNum: 45 },
  { id: "p4", lane: "procedural" as const, date: "2025-09-20", title: "Motion to Dismiss", description: "Constitutional challenge to stalking statute filed", tier: 2, docketNum: 51 },
  { id: "p5", lane: "procedural" as const, date: "2025-10-11", title: "Suppression Motion", description: "Challenges warrantless arrest and subsequent search", tier: 2, docketNum: 59 },
  { id: "p5a", lane: "procedural" as const, date: "2025-11-20", title: "Oral Argument", description: "Court hears argument on pending motions", tier: 2, docketNum: 70 },
  { id: "p5b", lane: "procedural" as const, date: "2025-12-10", title: "Hearing Set", description: "Court orders evidentiary suppression hearing for 1/23/26", tier: 2, docketNum: 75 },
  { id: "p6", lane: "procedural" as const, date: "2026-01-23", title: "Suppression Hearing", description: "Two-day evidentiary hearing on arrest circumstances", tier: 1, docketNum: 90 },
  { id: "p6a", lane: "procedural" as const, date: "2026-01-28", title: "Post-Hearing Briefs", description: "Parties file written closing arguments", tier: 3, docketNum: 100 },
  { id: "p7", lane: "procedural" as const, date: "2026-01-30", title: "Suppression Denied", description: "Court finds arrest and search lawful under totality", tier: 1, docketNum: 102 },
  { id: "p8", lane: "procedural" as const, date: "2026-01-30", title: "Counts Dismissed", description: "Counts 3 & 4 thrown out for insufficient federal nexus", tier: 1, docketNum: 103 },
  { id: "p8a", lane: "procedural" as const, date: "2026-02-15", title: "Reconsideration Motion", description: "Defense seeks reconsideration of suppression ruling", tier: 2, docketNum: 108 },
  { id: "p8b", lane: "procedural" as const, date: "2026-02-25", title: "Reconsideration Denied", description: "Court adheres to prior suppression ruling", tier: 2, docketNum: 112 },
  { id: "p9", lane: "procedural" as const, date: "2026-02-27", title: "Death Penalty Dropped", description: "Government formally withdraws DP notice", tier: 1, docketNum: 113 },
  { id: "p9a", lane: "procedural" as const, date: "2026-03-12", title: "Motion in Limine #1", description: "USA seeks to admit manifesto and writings", tier: 2, docketNum: 118 },
  { id: "p9b", lane: "procedural" as const, date: "2026-03-18", title: "Motion to Continue", description: "Defense seeks 90-day trial postponement", tier: 2, docketNum: 120 },

  // ─── Scheduling (future / planned court dates) ───
  { id: "s1a", lane: "scheduling" as const, date: "2025-01-06", title: "Speedy Trial Paused", description: "Time excluded 1/6/25 – 2/17/25 for prep", tier: 3, docketNum: 8 },
  { id: "s1", lane: "scheduling" as const, date: "2026-02-03", title: "Master Schedule", description: "14 trial prep deadlines set; trial 10/13/26", tier: 1, docketNum: 105 },
  { id: "s1b", lane: "scheduling" as const, date: "2026-04-01", title: "Continuance Conference", description: "Court to address defense's postponement motion", tier: 3, docketNum: 123 },
  { id: "s1c", lane: "scheduling" as const, date: "2026-06-15", title: "Expert Disclosures Due", description: "Rule 16 expert witness disclosure deadline", tier: 2 },
  { id: "s1d", lane: "scheduling" as const, date: "2026-07-06", title: "Exhibit Exchange", description: "Parties exchange trial exhibit lists", tier: 2 },
  { id: "s1e", lane: "scheduling" as const, date: "2026-07-20", title: "Jury Questionnaires", description: "Proposed juror questionnaires due", tier: 2 },
  { id: "s2", lane: "scheduling" as const, date: "2026-08-04", title: "Motions in Limine Due", description: "Pre-trial motion deadline", tier: 2 },
  { id: "s2a", lane: "scheduling" as const, date: "2026-08-18", title: "In Limine Responses", description: "Opposition briefs due on in-limine motions", tier: 3 },
  { id: "s2b", lane: "scheduling" as const, date: "2026-08-25", title: "Strikes for Cause", description: "Deadline to file for-cause juror challenges", tier: 3 },
  { id: "s3", lane: "scheduling" as const, date: "2026-09-02", title: "Final Pre-Trial", description: "Last conference before trial", tier: 1 },
  { id: "s4", lane: "scheduling" as const, date: "2026-09-08", title: "Voir Dire Begins", description: "Jury selection starts", tier: 1 },
  { id: "s5", lane: "scheduling" as const, date: "2026-10-13", title: "TRIAL BEGINS", description: "Opening statements scheduled", tier: 1 },
]

// ──────────────────────────────────────────────────────────────
// DRAMA LEVELS — 5-stop parametric drama axis (per-entity)
// ──────────────────────────────────────────────────────────────
// Levels 0..4 swap the displayed prose for characters / locations / stakes.
// Each level name implies a distinct editorial register; see descs[0..4]
// on every entity. Colors come from the existing brutalist palette.
export const DRAMA_LEVELS = [
  { id: 0, label: "Court Record", short: "RECORD", color: "var(--green)" },
  { id: 1, label: "Docudrama",    short: "DOCU",   color: "var(--cyan)" },
  { id: 2, label: "Thriller",     short: "THRLR",  color: "var(--amber)" },
  { id: 3, label: "Alt-History",  short: "ALT",    color: "var(--purple)" },
  { id: 4, label: "Mythic",       short: "MYTH",   color: "var(--red)" },
] as const

export type DramaLevel = 0 | 1 | 2 | 3 | 4

// Character profiles — real case participants (not actors).
// descs[0..4] correspond to DRAMA_LEVELS above.
export interface CharacterProfile {
  id: string
  name: string
  role: string
  roleColor: string
  profile: string            // legacy one-line summary; preserved for backwards compat
  descs: [string, string, string, string, string]
  evidenceCount: number
  thumbnail: string | null
}

export const CHARACTER_PROFILES: CharacterProfile[] = [
  {
    id: "char-1",
    name: "Luigi Nicholas Mangione",
    role: "Defendant",
    roleColor: "var(--orange)",
    profile: "26-year-old Ivy League graduate charged with the murder of UnitedHealthcare CEO Brian Thompson. Arrested in Altoona, PA after a nationwide manhunt.",
    descs: [
      "26-year-old Ivy League graduate. Charged with the murder of UnitedHealthcare CEO Brian Thompson. Arrested Dec 9, 2024 at a McDonald's in Altoona, PA.",
      "Valedictorian turned fugitive. Manifesto in his backpack, ghost gun in his jacket. A nationwide manhunt ended at a cashier's second glance.",
      "The most-wanted man in America for five days. Four states of evasion, one employee's phone call, and the biggest murder trial of the decade snaps into place.",
      "Folk hero in Brooklyn, villain on cable news, Rorschach test for a country sick of its own healthcare system. Depending on the outlet, he's either a murderer or a medic.",
      "The Cipher — a brilliant engineer radicalized against the machine. The hand that mailed a reckoning to a skyscraper at 6:47 AM.",
    ],
    evidenceCount: 0,
    thumbnail: null,
  },
  {
    id: "char-2",
    name: "Hon. Margaret M. Garnett",
    role: "Judge",
    roleColor: "var(--amber)",
    profile: "U.S. District Judge presiding over the case. Issued key rulings on suppression motion and dismissed Counts 3 and 4 for insufficient federal nexus.",
    descs: [
      "U.S. District Judge, S.D.N.Y. Issued the suppression denial (Dkt 102) and partial dismissal (Dkt 103). Sets trial for October 13, 2026.",
      "Rising SDNY jurist with a reputation for tight courtroom control. Clean written opinions, no tolerance for theatrics on either side.",
      "The gatekeeper. Her suppression order stamped every piece of evidence admissible; her dismissal gutted two counts. Every motion passes through her pen.",
      "In another timeline she'd be on the short list for the Second Circuit — but this case is the one that defines her tenure on the district bench.",
      "The Arbiter. One gavel, one courtroom, a country watching every ruling she writes.",
    ],
    evidenceCount: 0,
    thumbnail: null,
  },
  {
    id: "char-3",
    name: "Karen Friedman Agnifilo",
    role: "Lead Defense",
    roleColor: "var(--green)",
    profile: "Prominent defense attorney and former Manhattan Chief ADA. Leads the defense strategy challenging the constitutionality of charges and arrest circumstances.",
    descs: [
      "Former Manhattan Chief ADA. Lead defense counsel. Entered appearance Dec 19, 2024 (Dkt 3). Filed the motion to suppress and the motion to dismiss.",
      "Career prosecutor turned A-list defender. She's tried murders, she's seen indictments fall, and she filed the suppression motion herself.",
      "The only lawyer in New York who scares the U.S. Attorney's Office. She picked apart the Altoona stop on live television before discovery had even landed.",
      "The ex-insider dismantling the system she helped build. Every cross-examination is a slow unspooling of institutional memory.",
      "The Shield — the voice that stands between the Defendant and the machinery of federal prosecution.",
    ],
    evidenceCount: 0,
    thumbnail: null,
  },
  {
    id: "char-4",
    name: "Marc Agnifilo",
    role: "Co-Counsel",
    roleColor: "var(--cyan)",
    profile: "Admitted pro hac vice as additional counsel for the capital case. Experienced federal defense attorney specializing in complex criminal matters.",
    descs: [
      "Admitted pro hac vice as learned counsel for the capital case (Dkt 35). Federal defense specialist in complex criminal matters.",
      "The quiet half of the Agnifilo partnership. Complex federal work, RICO defenses, Sean Combs — he does his best work on the briefing page.",
      "The strategist. While Karen runs press, Marc runs precedent — the learned-counsel motion, the post-hearing brief, the Rule 29 memo all trace to him.",
      "The architect of a defense built to survive a jury pool poisoned by eighteen months of cable coverage. He plans three motions ahead of the government.",
      "The Cartographer — maps the legal terrain his partner walks into every morning.",
    ],
    evidenceCount: 0,
    thumbnail: null,
  },
  {
    id: "char-5",
    name: "AUSA (Lead Prosecutor)",
    role: "Lead Prosecutor",
    roleColor: "var(--cyan)",
    profile: "Assistant United States Attorney leading the prosecution. Filed the death penalty notice and later withdrew it after Counts 3 and 4 were dismissed.",
    descs: [
      "Assistant U.S. Attorney, S.D.N.Y. Filed the death penalty notice Apr 24, 2025 (Dkt 25). Formally withdrew capital punishment Feb 27, 2026 (Dkt 113).",
      "Career fed. Years at SDNY, a wall of conviction plaques, and one of the hardest cases in the district sitting on the desk.",
      "The face of the Department of Justice in the biggest political murder trial of the decade. The DP withdrawal was the first public crack in the government's posture.",
      "The prosecutor whose career pivoted the day Counts 3 and 4 fell. Still has Count 1 and Count 2 — still has a life sentence in reach.",
      "The Law Itself, in a pantsuit. The state's voice, speaking through a microphone that has never been louder.",
    ],
    evidenceCount: 0,
    thumbnail: null,
  },
  {
    id: "char-6",
    name: "Brian Thompson",
    role: "Victim",
    roleColor: "var(--red)",
    profile: "CEO of UnitedHealthcare, shot outside the Hilton Midtown in Manhattan on December 4, 2024. The killing sparked nationwide debate about healthcare industry practices.",
    descs: [
      "CEO of UnitedHealthcare. Shot outside the Hilton Midtown, Manhattan, at 6:47 AM on December 4, 2024.",
      "50-year-old father of two. 20-year Minnesota commute. A shareholder letter in his briefcase, an investor conference thirty minutes away.",
      "The face the country picked to hate when it ran out of faces. His death unlocked a conversation no press release ever did.",
      "The human who stood in for a system. Not the architect of denial, not the executive behind the algorithm — but the man who drew fire meant for all of them.",
      "The Sacrificial King — the figure whose death, coded in three-word inscriptions, lit a cultural fuse that hasn't stopped burning.",
    ],
    evidenceCount: 0,
    thumbnail: null,
  },
]

// ──────────────────────────────────────────────────────────────
// LOCATION PROFILES — physical places that anchor the story.
// Same drama-axis pattern as characters: descs[0..4] matched to
// DRAMA_LEVELS (Court Record → Mythic).
// ──────────────────────────────────────────────────────────────
export interface LocationProfile {
  id: string
  name: string
  role: string
  roleColor: string
  descs: [string, string, string, string, string]
}

export const LOCATION_PROFILES: LocationProfile[] = [
  {
    id: "loc-1",
    name: "Hilton Midtown",
    role: "Crime Scene",
    roleColor: "var(--red)",
    descs: [
      "1335 Avenue of the Americas, Manhattan. Brian Thompson shot at 6:47 AM on December 4, 2024 at the West 54th Street entrance.",
      "Pre-dawn Midtown — streetlights, idling cabs, a gunman in a black puffer who waited behind a scaffolding stairwell until the CEO stepped out toward a shareholder breakfast.",
      "The intersection where the country's most-photographed murder unfolded on cameras already rolling when the first shot fired. Three shell casings on the sidewalk. Three words inked into each.",
      "The address that became a symbol — the corporate Midtown rendezvous where every quarterly investor breakfast starts, and where one of them ended at the speed of a 9mm round.",
      "The Altar — the 54th Street sidewalk where a nation's grievance was offered up in a single aimed round before sunrise.",
    ],
  },
  {
    id: "loc-2",
    name: "Altoona McDonald's",
    role: "Arrest Scene",
    roleColor: "var(--orange)",
    descs: [
      "2329 Plank Road, Altoona, PA. Mangione arrested here December 9, 2024 at approximately 9:15 AM after a customer tip to the manager.",
      "Small-town Pennsylvania fast-food booth. A laptop, a fake New Jersey ID, a hash brown on the tray. Three officers walked in. One employee had made the call.",
      "The end of the five-day manhunt. Interstate 80 outside, a ghost gun in the backpack, and a cashier's eyes that didn't look away fast enough.",
      "The McDonald's that closed the most-watched fugitive case of the decade. Altoona became a noun, a punchline, and a pilgrimage site, all in one week.",
      "The Crossroads Diner — the anonymous roadside inn where destiny reached across a Formica table and put a hand on the Cipher's shoulder.",
    ],
  },
  {
    id: "loc-3",
    name: "HI NYC Hostel (UWS)",
    role: "Safehouse",
    roleColor: "var(--purple)",
    descs: [
      "891 Amsterdam Avenue, Manhattan. Defendant checked in November 24 using a false New Jersey ID; checked out the morning of December 4.",
      "Upper West Side backpacker bunk room. Ten-bed dormitory, shared bathroom. Ten days of staging — maps, writings, range time at a southern Pennsylvania club.",
      "The staging ground. A hostel bed, a laptop, and a list of New York investor-conference venues narrowed down to one corner at 6:47 AM.",
      "The anonymous bunk that housed a plot no one in the room suspected. The clerk remembered a quiet guest who paid cash and always returned before 11.",
      "The Hermit's Cell — ten days of silent preparation in a room full of strangers who never looked up from their phones.",
    ],
  },
  {
    id: "loc-4",
    name: "Moynihan U.S. Courthouse",
    role: "Battlefield",
    roleColor: "var(--cyan)",
    descs: [
      "500 Pearl Street, New York. Daniel Patrick Moynihan U.S. Courthouse. Judge Garnett presides on the 17th floor.",
      "A granite-clad federal block with Lower Manhattan's tightest security perimeter. Press corps out front every ruling day since April 2025.",
      "The battlefield. Every motion, every ruling, every witness runs through Courtroom 17. The war room where the capital case was won on DP withdrawal and lost on suppression.",
      "The stage of record — where the Mangione case stopped being a cable story and became a constitutional argument about what the federal stalking statute means in 2026.",
      "The Tower — the granite pillar where the machinery of federal justice grinds, eighteen stories above the street and one gavel at a time.",
    ],
  },
  {
    id: "loc-5",
    name: "GWB Bus Terminal",
    role: "Escape Route",
    roleColor: "var(--amber)",
    descs: [
      "4211 Broadway, Washington Heights. Suspect boarded a Greyhound bus northwest out of Manhattan at approximately 7:30 AM on December 4.",
      "Upper Manhattan interstate bus terminal. Security footage caught him at 7:12 AM, backpack over shoulder, walking to the departures platform.",
      "The exit route. Forty-three minutes after the shooting, the suspect was on an outbound bus crossing the Hudson. Ghost gun still on him. No one looked twice.",
      "The portal. A commuter terminal most New Yorkers have never noticed became the bottleneck the federal manhunt ran through for five days.",
      "The Gate of the River — the crossing where the Cipher slipped out of the city and into the mythology of the open road.",
    ],
  },
  {
    id: "loc-6",
    name: "Central Park (CPW)",
    role: "Flight Path",
    roleColor: "var(--green)",
    descs: [
      "Central Park West escape route. Suspect seen on e-bike at 6:54 AM entering the park at 65th Street; bike abandoned near 86th Street.",
      "A pre-dawn bike ride north through Central Park on an e-bike with the registration plate scraped off. Twelve minutes later the bike was left in the grass.",
      "The cover. Seven minutes after the shooting, the suspect was threading the park's path system on a rented e-bike — the one variable NYPD command couldn't predict.",
      "The route that mapped itself in real time — a park escape that turned Central Park's bridle paths into the most scrutinized 1.3 miles of asphalt in New York.",
      "The Wild Grove — the emerald corridor through which the assassin rode out of the polis, leaving the body of a king on the pavement behind.",
    ],
  },
]

// Events timeline data (legacy format for compatibility)
export const EVENTS = [
  { id: "f1", lane: "factual", date: "2024-12-18", docket: "1", title: "Sealed Complaint Filed", description: "Charges under Sections 2261A, 924(j), 924(c).", tier: 1, type: "filing" },
  { id: "f2", lane: "factual", date: "2025-04-17", docket: "22", title: "Redacted Indictment", description: "THE operative charging document - 4 counts.", tier: 1, type: "charging" },
  { id: "f3", lane: "factual", date: "2025-04-24", docket: "25", title: "Death Penalty Notice", description: "Government seeks the death penalty.", tier: 1, type: "notice" },
  { id: "f4", lane: "factual", date: "2025-09-20", docket: "51", title: "Defense Attacks", description: "Constitutional attack on prosecution.", tier: 2, type: "motion" },
  { id: "f5", lane: "factual", date: "2025-10-11", docket: "59", title: "Motion: Dismiss + Suppress", description: "Dispute over arrest and search.", tier: 2, type: "motion" },
  { id: "f8", lane: "factual", date: "2026-01-30", docket: "102", title: "Suppression Denied", description: "Evidence stays in. Search lawful.", tier: 1, type: "order" },
  { id: "f9", lane: "factual", date: "2026-01-30", docket: "103", title: "Murder Counts Gone", description: "Counts 3 and 4 DISMISSED.", tier: 1, type: "order" },
  { id: "f10", lane: "factual", date: "2026-02-27", docket: "113", title: "Death Penalty Dropped", description: "No longer seeking death.", tier: 1, type: "notice" },
  { id: "p1", lane: "procedural", date: "2024-12-18", docket: "1", title: "Case Filed", description: "Complaint filed in S.D.N.Y.", tier: 1, type: "filing" },
  { id: "p2", lane: "procedural", date: "2024-12-19", docket: "-", title: "Arrest", description: "Defendant taken into custody.", tier: 1, type: "event" },
  { id: "p3", lane: "procedural", date: "2024-12-19", docket: "5", title: "Initial Appearance", description: "Detention on consent.", tier: 1, type: "hearing" },
  { id: "p7", lane: "procedural", date: "2025-04-17", docket: "22", title: "Indictment Returns", description: "Grand jury charges - 4 counts.", tier: 1, type: "filing" },
  { id: "p8", lane: "procedural", date: "2025-04-25", docket: "-", title: "Not Guilty Plea", description: "Arraignment on all counts.", tier: 1, type: "hearing" },
  { id: "p12", lane: "procedural", date: "2026-01-23", docket: "-", title: "Suppression Hearing", description: "Live testimony taken.", tier: 1, type: "hearing" },
  { id: "p17", lane: "procedural", date: "2026-03-18", docket: "120", title: "Motion to Continue", description: "Defense seeks postponement.", tier: 2, type: "motion" },
  { id: "s5", lane: "scheduling", date: "2026-02-03", docket: "105", title: "MASTER SCHEDULE", description: "14 trial-prep dates.", tier: 1, type: "scheduling-order" },
  { id: "s6", lane: "scheduling", date: "2026-03-23", docket: "123", title: "Conference 4/1/26", description: "Continuance motion conf.", tier: 2, type: "order" },
]

// Schedule items
export const SCHEDULE_ITEMS = [
  { date: "2026-08-04", label: "Motions in Limine", hot: true },
  { date: "2026-09-02", label: "FINAL PRE-TRIAL", hot: true },
  { date: "2026-09-08", label: "Voir dire begins", hot: true },
  { date: "2026-10-13", label: "TRIAL BEGINS", hot: true },
]

// Case evidence
export const CASE_EVIDENCE = [
  { id: "ce1", name: "Complaint (Dkt 1)", type: "filing", date: "12/18/24", active: true, tier: 1, icon: "file-text", starred: true, pinned: false },
  { id: "ce2", name: "Indictment (Dkt 22)", type: "filing", date: "04/17/25", active: true, tier: 1, icon: "zap", starred: true, pinned: false },
  { id: "ce3", name: "DP Notice (Dkt 25)", type: "notice", date: "04/24/25", active: true, tier: 1, icon: "megaphone", starred: false, pinned: false },
  { id: "ce5", name: "Suppression Ruling (Dkt 102)", type: "order", date: "01/30/26", active: true, tier: 1, icon: "gavel", starred: false, pinned: false },
  { id: "ce7", name: "Schedule Order (Dkt 105)", type: "scheduling", date: "02/03/26", active: true, tier: 1, icon: "star", starred: false, pinned: false },
]

// Secondary evidence
export const SECONDARY_EVIDENCE = [
  { id: "se1", name: "Smith Deposition.pdf", type: "transcript", active: true, icon: "mic", description: "47 pages", starred: false, pinned: false },
  { id: "se2", name: "Opposition Emails.zip", type: "documents", active: true, icon: "mail", description: "312 messages", starred: false, pinned: false },
  { id: "se3", name: "Surveillance Video.mp4", type: "video", active: false, icon: "video", description: "4:23 duration", starred: false, pinned: false },
  { id: "se4", name: "Courtroom Sketches", type: "photos", active: true, icon: "image", description: "6 illustrations", starred: false, pinned: false },
]

// Collaborators
export const COLLABORATORS = [
  { id: "u1", name: "Raj A.", role: "Admin", avatar: "RA", online: true, color: "purple", typing: false },
  { id: "u2", name: "Eros I.", role: "Admin", avatar: "EI", online: true, color: "green", typing: true },
  { id: "u3", name: "Apoorv S.", role: "Collaborator", avatar: "AS", online: false, color: "cyan", typing: false },
]

// Activity log
export const ACTIVITY_LOG = [
  { time: "2m ago", user: "Eros I.", action: "uploaded", target: "Sketches", type: "add", flash: true },
  { time: "15m ago", user: "Raj A.", action: "toggled", target: "Video", type: "edit", flash: false },
  { time: "1hr ago", user: "Raj A.", action: "added", target: "DP Dropped", type: "add", flash: false },
]

// Treatment texts
export const TREATMENT_TEXTS = {
  factual: "On December 4, 2024, Brian Thompson was shot outside the Hilton Midtown. Luigi Mangione was arrested and charged with four counts.",
  dramatized: "The killing of a healthcare CEO sends shockwaves. Investigators piece together a manifesto and a portrait of calculated rage.",
  creative: "A young graduate plans an act that will force the nation to confront corporate indifference. A manhunt, a trial, a reckoning.",
}

// Courts list
export const COURTS = [
  "S.D.N.Y. - Southern District of New York",
  "E.D.N.Y. - Eastern District of New York",
  "C.D. Cal. - Central District of California",
  "N.D. Ill. - Northern District of Illinois",
  "D. Mass. - District of Massachusetts",
  "N.D. Cal. - Northern District of California",
  "S.D. Fla. - Southern District of Florida",
  "W.D. Tex. - Western District of Texas",
]

// Docket entries (legacy)
export const DOCKET_ENTRIES = [
  { number: 1, text: "SEALED COMPLAINT as to Luigi Nicholas Mangione (1), 18 U.S.C. 2261A, 2261(b), 924(j), and 924(c).", date: "12/18/2024" },
  { number: 0, text: "Arrest of Luigi Nicholas Mangione (on writ).", date: "12/19/2024" },
  { number: 3, text: "NOTICE OF ATTORNEY APPEARANCE: Karen Friedman Agnifilo.", date: "12/19/2024" },
  { number: 5, text: "Minute Entry: Initial Appearance. Detention Hearing.", date: "12/19/2024" },
  { number: 7, text: "Brady ORDER as to Luigi Nicholas Mangione.", date: "12/19/2024" },
  { number: 8, text: "ORDER TO CONTINUE IN THE INTEREST OF JUSTICE. Time excluded 1/6/25 - 2/17/25.", date: "01/06/2025" },
]

// Initial bookmarks
export const INITIAL_BOOKMARKS = [
  { id: "b1", label: "test", caseName: "USA v. Mangione", docket: "1:25-cr-00176-MMG-1 (S.D.N.Y.)", checked: true },
  { id: "b2", label: "self-cut", caseName: "Estores v. The Partnerships...", docket: "1:25-cv-06151 (N.D. Ill.)", checked: false },
  { id: "b3", label: "Ehheh", caseName: "Delgado v. Donald J. Trump", docket: "1:19-cv-11764-AT-KHP (S.D.N.Y.)", checked: false },
  { id: "b4", label: "fas", caseName: "MANDO INT'L v. AIDP INC", docket: "3:25-cv-10682-TLT (N.D. Cal.)", checked: false },
  { id: "b5", label: "nd", caseName: "LegalForce RAPC v. US Patent", docket: "5:25-cv-09010-PCP (N.D. Cal.)", checked: false },
]

// Files list for upload
export const INITIAL_FILES = [
  { name: "Smith Deposition.pdf", type: "Transcript", icon: "file-text", status: "uploaded" },
  { name: "Opposition Emails.zip", type: "Documents", icon: "mail", status: "uploaded" },
  { name: "Surveillance Video.mp4", type: "Video", icon: "video", status: "uploaded" },
]

// ──────────────────────────────────────────────────────────────
// ASSET LIBRARY DATA (F1-F9)
// ──────────────────────────────────────────────────────────────

export interface Asset {
  id: string
  name: string
  category: "photo" | "video" | "document" | "audio"
  date: string
  uploader: string
  linkedEntries: string[]  // docket entry refs
  starred: boolean
  pinned: boolean
  // Photo-specific
  width?: number
  height?: number
  // Video-specific
  duration?: string
  // Document-specific
  pages?: number
  fileSize?: string
  // Audio-specific
  audioDuration?: string
  description?: string
}

export const ASSET_LIBRARY: Asset[] = [
  // ─── Photos ───
  { id: "ph1", name: "Arrest at McDonald's — Altoona, PA", category: "photo", date: "12/09/2024", uploader: "FBI Field Office", linkedEntries: ["Dkt 1"], starred: true, pinned: true, width: 4, height: 3 },
  { id: "ph2", name: "Crime Scene — Hilton Midtown Exterior", category: "photo", date: "12/04/2024", uploader: "NYPD CSU", linkedEntries: ["Dkt 1"], starred: true, pinned: false, width: 3, height: 2 },
  { id: "ph3", name: "Recovered Firearm — Ghost Gun", category: "photo", date: "12/09/2024", uploader: "FBI Evidence Lab", linkedEntries: ["Dkt 1", "Dkt 22"], starred: false, pinned: false, width: 1, height: 1 },
  { id: "ph4", name: "Courtroom Sketch — Arraignment", category: "photo", date: "05/01/2025", uploader: "Jane Rosenberg", linkedEntries: ["Dkt 28"], starred: false, pinned: false, width: 4, height: 3 },
  { id: "ph5", name: "Defendant's Manifesto — Page 1", category: "photo", date: "12/10/2024", uploader: "FBI Evidence Lab", linkedEntries: ["Dkt 1"], starred: true, pinned: false, width: 3, height: 4 },
  { id: "ph6", name: "Surveillance Still — Hostel Check-in", category: "photo", date: "12/08/2024", uploader: "NYPD", linkedEntries: ["Dkt 59"], starred: false, pinned: false, width: 16, height: 9 },
  { id: "ph7", name: "Courtroom Sketch — Suppression Hearing", category: "photo", date: "01/23/2026", uploader: "Jane Rosenberg", linkedEntries: ["Dkt 90"], starred: false, pinned: false, width: 4, height: 3 },
  { id: "ph8", name: "Evidence — Fake ID recovered", category: "photo", date: "12/09/2024", uploader: "FBI Evidence Lab", linkedEntries: ["Dkt 1", "Dkt 59"], starred: false, pinned: false, width: 3, height: 2 },
  { id: "ph9", name: "Courtroom Sketch — Death Penalty Hearing", category: "photo", date: "04/24/2025", uploader: "Jane Rosenberg", linkedEntries: ["Dkt 25"], starred: false, pinned: false, width: 4, height: 3 },

  // ─── Videos ───
  { id: "vi1", name: "Surveillance — Hilton Midtown Shooting", category: "video", date: "12/04/2024", uploader: "NYPD", linkedEntries: ["Dkt 1"], starred: true, pinned: true, duration: "0:47", width: 16, height: 9 },
  { id: "vi2", name: "Arrest Bodycam — Altoona PD", category: "video", date: "12/09/2024", uploader: "Altoona PD", linkedEntries: ["Dkt 1", "Dkt 59"], starred: true, pinned: false, duration: "4:23", width: 16, height: 9 },
  { id: "vi3", name: "Courtroom Proceedings — Arraignment", category: "video", date: "05/01/2025", uploader: "Court AV", linkedEntries: ["Dkt 28"], starred: false, pinned: false, duration: "18:02", width: 16, height: 9 },
  { id: "vi4", name: "Suppression Hearing Day 1 — Full", category: "video", date: "01/23/2026", uploader: "Court AV", linkedEntries: ["Dkt 90"], starred: false, pinned: false, duration: "3:42:15", width: 16, height: 9 },
  { id: "vi5", name: "Suppression Hearing Day 2 — Full", category: "video", date: "01/24/2026", uploader: "Court AV", linkedEntries: ["Dkt 95"], starred: false, pinned: false, duration: "2:58:41", width: 16, height: 9 },
  { id: "vi6", name: "News Coverage — NBC Compilation", category: "video", date: "12/10/2024", uploader: "Media Team", linkedEntries: [], starred: false, pinned: false, duration: "12:30", width: 16, height: 9 },

  // ─── Documents ───
  { id: "dc1", name: "Sealed Complaint (Dkt 1)", category: "document", date: "12/18/2024", uploader: "US Attorney", linkedEntries: ["Dkt 1"], starred: true, pinned: true, pages: 32, fileSize: "4.2 MB" },
  { id: "dc2", name: "Redacted Indictment (Dkt 22)", category: "document", date: "04/17/2025", uploader: "Grand Jury", linkedEntries: ["Dkt 22"], starred: true, pinned: false, pages: 18, fileSize: "2.8 MB" },
  { id: "dc3", name: "Death Penalty Notice (Dkt 25)", category: "document", date: "04/24/2025", uploader: "US Attorney", linkedEntries: ["Dkt 25"], starred: true, pinned: false, pages: 4, fileSize: "890 KB" },
  { id: "dc4", name: "Motion to Suppress (Dkt 59)", category: "document", date: "10/11/2025", uploader: "Defense Counsel", linkedEntries: ["Dkt 59"], starred: false, pinned: false, pages: 45, fileSize: "6.1 MB" },
  { id: "dc5", name: "Suppression Ruling (Dkt 102)", category: "document", date: "01/30/2026", uploader: "Court", linkedEntries: ["Dkt 102"], starred: true, pinned: false, pages: 67, fileSize: "8.4 MB" },
  { id: "dc6", name: "Dismissal Order (Dkt 103)", category: "document", date: "01/30/2026", uploader: "Court", linkedEntries: ["Dkt 103"], starred: false, pinned: false, pages: 23, fileSize: "3.2 MB" },
  { id: "dc7", name: "Master Schedule (Dkt 105)", category: "document", date: "02/03/2026", uploader: "Court", linkedEntries: ["Dkt 105"], starred: false, pinned: false, pages: 8, fileSize: "1.1 MB" },
  { id: "dc8", name: "Smith Deposition Transcript", category: "document", date: "09/15/2025", uploader: "Court Reporter", linkedEntries: [], starred: false, pinned: false, pages: 47, fileSize: "5.5 MB" },
  { id: "dc9", name: "DP Withdrawal Notice (Dkt 113)", category: "document", date: "02/27/2026", uploader: "US Attorney", linkedEntries: ["Dkt 113"], starred: true, pinned: false, pages: 3, fileSize: "620 KB" },

  // ─── Audio ───
  { id: "au1", name: "911 Call — Hilton Midtown", category: "audio", date: "12/04/2024", uploader: "NYPD", linkedEntries: ["Dkt 1"], starred: true, pinned: true, audioDuration: "2:14", description: "Initial emergency call reporting shots fired" },
  { id: "au2", name: "Oral Argument — Suppression Motion", category: "audio", date: "11/20/2025", uploader: "Court AV", linkedEntries: ["Dkt 70"], starred: false, pinned: false, audioDuration: "1:45:30", description: "Full oral argument on pending motions" },
  { id: "au3", name: "Jail Call #1 — Mangione to Family", category: "audio", date: "12/20/2024", uploader: "MDC Brooklyn", linkedEntries: [], starred: false, pinned: false, audioDuration: "14:52", description: "Recorded jail phone call (redacted)" },
  { id: "au4", name: "Witness Interview — NYPD Detective", category: "audio", date: "01/15/2026", uploader: "FBI", linkedEntries: ["Dkt 85"], starred: false, pinned: false, audioDuration: "38:20", description: "Pre-hearing witness preparation interview" },
  { id: "au5", name: "Courtroom Audio — Ruling Announcement", category: "audio", date: "01/30/2026", uploader: "Court AV", linkedEntries: ["Dkt 102", "Dkt 103"], starred: true, pinned: false, audioDuration: "22:08", description: "Judge Garnett reads suppression and dismissal rulings" },
]

// Helpers
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00")
}

export function formatShortDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
}

export function formatLongDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

const START_DATE = parseDate("2024-12-01")
const END_DATE = parseDate("2026-11-01")
const SPAN = END_DATE.getTime() - START_DATE.getTime()

export function getDatePercent(dateStr: string): number {
  const date = parseDate(dateStr)
  // Round to 2 decimal places to avoid hydration mismatches from floating point precision
  return Math.round(Math.max(0, Math.min(100, ((date.getTime() - START_DATE.getTime()) / SPAN) * 100)) * 100) / 100
}

export function getLaneColor(lane: string): string {
  const colors: Record<string, string> = {
    factual: "var(--lane-factual)",
    procedural: "var(--lane-procedural)",
    scheduling: "var(--lane-scheduling)",
    narrative: "var(--lane-narrative)",
  }
  return colors[lane] || "var(--muted-foreground)"
}

export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    filing: "var(--red)",
    notice: "var(--red)",
    charging: "var(--orange)",
    motion: "var(--orange)",
    order: "var(--purple)",
    scheduling: "var(--yellow)",
    "scheduling-order": "var(--yellow)",
    transcript: "var(--cyan)",
    video: "var(--pink)",
    audio: "var(--green)",
    photos: "var(--orange)",
    documents: "var(--cyan)",
    event: "var(--green)",
    hearing: "var(--cyan)",
  }
  return colors[type] || "var(--muted-foreground)"
}

export type Event = (typeof EVENTS)[number]
export type Evidence = (typeof CASE_EVIDENCE)[number]
export type SecondaryEvidence = (typeof SECONDARY_EVIDENCE)[number]
export type Collaborator = (typeof COLLABORATORS)[number]
export type ActivityItem = (typeof ACTIVITY_LOG)[number]
