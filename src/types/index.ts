// Core domain types for the cyber maturity assessment platform.

export type FrameworkId = 'NIST_CSF_2_0' | 'CIS_V8_1_2' | 'NCSC_CAF_4_0';

export interface Framework {
  id: FrameworkId;
  name: string;
  shortName: string;
  version: string;
  description: string;
  groups: FrameworkGroup[];
}

/** Top-level grouping: NIST Function, CIS Control, CAF Objective */
export interface FrameworkGroup {
  id: string;
  code: string; // e.g. GV, 01, A
  name: string;
  description?: string;
  categories: FrameworkCategory[];
}

/** Mid-level: NIST Category, CIS Control families (single layer), CAF Principle */
export interface FrameworkCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  items: FrameworkItem[];
}

/** Leaf: NIST Subcategory, CIS Safeguard, CAF Contributing Outcome */
export interface FrameworkItem {
  id: string;
  code: string;
  title: string;
  description: string;
  igTier?: 1 | 2 | 3;
  assetType?: string;
  securityFunction?: string;
}

// ----------------------------------------------------------------------------

export type IGTier = 1 | 2 | 3;

export type EngagementStatus =
  | 'Setup'
  | 'Footprint'
  | 'Documentation Review'
  | 'Workshops & Notes'
  | 'Observations'
  | 'Scoring'
  | 'Risks'
  | 'Recommendations'
  | 'Roadmap'
  | 'Benchmarking'
  | 'Reporting'
  | 'QA Review'
  | 'Signed Off';

export const ENGAGEMENT_STAGES: EngagementStatus[] = [
  'Setup',
  'Footprint',
  'Documentation Review',
  'Workshops & Notes',
  'Observations',
  'Scoring',
  'Risks',
  'Recommendations',
  'Roadmap',
  'Benchmarking',
  'Reporting',
  'QA Review',
  'Signed Off',
];

/** Derive percentage from current stage (Signed Off = 100%, Setup = ~8%). */
export function progressFromStatus(status: EngagementStatus): number {
  const idx = ENGAGEMENT_STAGES.indexOf(status);
  return Math.round(((idx + 1) / ENGAGEMENT_STAGES.length) * 100);
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  country: string;
  region: string;
  sizeBand: 'Small' | 'Mid-market' | 'Large' | 'Enterprise';
  revenueBand: string;
  employees: number;
  logoColour: string;
  businessFootprint: BusinessFootprint;
  techFootprint: TechFootprint;
}

export interface BusinessFootprint {
  markets: string[];
  linesOfBusiness: string[];
  regulatoryRegimes: string[];
  criticalProcesses: string[];
  dataClassifications: string[];
}

export interface TechFootprint {
  cloudProviders: string[];
  identityProviders: string[];
  keyPlatforms: string[];
  endpointEstate: { workstations: number; servers: number; mobile: number };
  internetFacingAssets: number;
  saasApps: number;
  ot: boolean;
}

export interface QASignOff {
  reviewerId: string;
  decision: 'Approved' | 'Approved with comments' | 'Rejected';
  comments: string;
  signedAt: string;
}

export interface Engagement {
  id: string;
  clientId: string;
  framework: FrameworkId;
  igTier?: IGTier;
  year: number;
  status: EngagementStatus;
  leadAssessor: string;
  team: string[];
  startDate: string;
  targetEndDate: string;
  scope: string;
  priorEngagementId?: string;
  /** Derived from status — kept on the entity for filtering convenience. */
  progressPct: number;
  qaSignOff?: QASignOff;
  reportVersion: number;
}

// ----------------------------------------------------------------------------
// Per-item assessment data

export type DocStatus = 'in_place' | 'partial' | 'out_of_date' | 'not_in_place' | 'not_applicable';

export interface EvidenceDoc {
  id: string;
  name: string;
  status: DocStatus;
  version?: string;
  lastReviewed?: string;
  uploadedBy: string;
  comments?: string;
}

export type Provenance = 'manual' | 'ai-suggested' | 'ai-accepted' | 'ai-edited';

export interface NoteEntry {
  id: string;
  body: string;
  author: string;
  createdAt: string;
  provenance: Provenance;
  sourceTranscriptId?: string;
}

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Observation {
  id: string;
  title: string;
  body: string;
  theme: string;
  severity: Severity;
  provenance: Provenance;
  linkedItemIds: string[];
  assigneeId?: string;
  status?: 'Draft' | 'In Review' | 'Confirmed';
  evidenceRefs?: string[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  impact: 1 | 2 | 3 | 4 | 5;
  likelihood: 1 | 2 | 3 | 4 | 5;
  inherentScore: number;
  treatedScore?: number;
  treatment: 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid';
  owner?: string;
  assigneeId?: string;
  provenance: Provenance;
  linkedObservationIds: string[];
  linkedItemIds?: string[];
  rationale?: string;
}

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type Effort = 'S' | 'M' | 'L' | 'XL';
export type CostBand = '<£25k' | '£25–100k' | '£100–500k' | '>£500k';
export type Horizon = '0–3m' | '3–6m' | '6–12m' | '12–24m';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  effort: Effort;
  costBand: CostBand;
  horizon: Horizon;
  capabilityArea: string;
  provenance: Provenance;
  linkedItemIds: string[];
  linkedObservationIds: string[];
  assigneeId?: string;
  benefits?: string;
  successCriteria?: string[];
}

/** CMMI 0–5: 0=Not Performed, 1=Initial, 2=Managed, 3=Defined, 4=Quantitatively Managed, 5=Optimising */
export type CMMIScore = 0 | 1 | 2 | 3 | 4 | 5;

export interface AssessmentItem {
  id: string;
  engagementId: string;
  itemId: string;
  docStatus: DocStatus;
  evidence: EvidenceDoc[];
  notes: NoteEntry[];
  observations: Observation[];
  risks: Risk[];
  recommendations: Recommendation[];
  currentScore: CMMIScore;
  targetScore: CMMIScore;
  rationale?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// ----------------------------------------------------------------------------

export interface RoadmapInitiative {
  id: string;
  engagementId: string;
  title: string;
  description: string;
  horizon: Horizon;
  effort: Effort;
  costBand: CostBand;
  owner?: string;
  assigneeId?: string;
  dependencies: string[];
  linkedRecommendationIds: string[];
  capabilityArea: string;
  status: 'Proposed' | 'Approved' | 'In Progress' | 'Complete';
  outcomes?: string[];
}

export interface BenchmarkSnapshot {
  scope: 'industry' | 'country' | 'global' | 'size-band';
  scopeValue: string;
  framework: FrameworkId;
  averageByGroup: Record<string, number>;
  topQuartileByGroup: Record<string, number>;
  bottomQuartileByGroup: Record<string, number>;
  cohortSize: number;
}

export interface Transcript {
  id: string;
  engagementId: string;
  title: string;
  uploadedAt: string;
  uploadedBy: string;
  durationMinutes: number;
  participants: string[];
  status: 'queued' | 'processing' | 'extracted' | 'failed';
  derivedNoteCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Senior Consultant' | 'Lead Assessor' | 'Assessor' | 'Reviewer' | 'Read-only';
  initials: string;
  avatarColour: string;
}
