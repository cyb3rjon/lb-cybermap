import type {
  Engagement, AssessmentItem, RoadmapInitiative, Transcript, CMMIScore, DocStatus,
  Observation, Risk, Recommendation, NoteEntry,
} from '@/types';
import { progressFromStatus } from '@/types';
import { FRAMEWORKS, flattenItems } from './frameworks';
import { themeForItem, FINDINGS_BY_THEME, THEME_TO_CAPABILITY } from './content-library';

export const MOCK_ENGAGEMENTS: Engagement[] = ([
  {
    id: 'eng-2025-meridian-nist',
    clientId: 'client-001', framework: 'NIST_CSF_2_0', year: 2025, status: 'Recommendations',
    leadAssessor: 'u-002', team: ['u-002', 'u-004', 'u-006'],
    startDate: '2025-09-01', targetEndDate: '2025-12-15',
    scope: 'Group-wide assessment covering Retail Banking, Wealth Management and Corporate Lending. Excludes acquired Channel Islands subsidiary.',
    priorEngagementId: 'eng-2024-meridian-nist', reportVersion: 1,
  },
  {
    id: 'eng-2024-meridian-nist',
    clientId: 'client-001', framework: 'NIST_CSF_2_0', year: 2024, status: 'Signed Off',
    leadAssessor: 'u-002', team: ['u-002', 'u-005'],
    startDate: '2024-09-01', targetEndDate: '2024-12-15',
    scope: 'Group-wide NIST CSF assessment.', reportVersion: 3,
    qaSignOff: { reviewerId: 'u-006', decision: 'Approved', comments: 'High-quality assessment. Findings well-evidenced. Minor edits in section 7 prior to issue.', signedAt: '2024-12-12T15:20:00Z' },
  },
  {
    id: 'eng-2025-northwind-caf',
    clientId: 'client-002', framework: 'NCSC_CAF_4_0', year: 2025, status: 'Scoring',
    leadAssessor: 'u-003', team: ['u-003', 'u-004'],
    startDate: '2025-10-01', targetEndDate: '2026-02-28',
    scope: 'Operator of Essential Services assessment covering generation and transmission. SCADA in scope.',
    reportVersion: 0,
  },
  {
    id: 'eng-2025-acorn-cis',
    clientId: 'client-003', framework: 'CIS_V8_1_2', igTier: 2, year: 2025, status: 'Documentation Review',
    leadAssessor: 'u-002', team: ['u-002', 'u-005'],
    startDate: '2025-11-15', targetEndDate: '2026-03-31',
    scope: 'Trust-wide CIS Controls IG2 assessment with focus on patient data and clinical systems.',
    reportVersion: 0,
  },
  {
    id: 'eng-2025-halcyon-cis',
    clientId: 'client-004', framework: 'CIS_V8_1_2', igTier: 1, year: 2025, status: 'Workshops & Notes',
    leadAssessor: 'u-003', team: ['u-003', 'u-005'],
    startDate: '2025-10-20', targetEndDate: '2026-01-31',
    scope: 'IG1 baseline assessment across head office and 240 retail stores.',
    reportVersion: 0,
  },
  {
    id: 'eng-2025-bluerver-caf',
    clientId: 'client-005', framework: 'NCSC_CAF_4_0', year: 2025, status: 'QA Review',
    leadAssessor: 'u-002', team: ['u-002', 'u-006'],
    startDate: '2025-07-01', targetEndDate: '2025-11-30',
    scope: 'Cross-border CAF assessment with NIS2 alignment overlay.',
    reportVersion: 1,
  },
  {
    id: 'eng-2025-apex-cis',
    clientId: 'client-006', framework: 'CIS_V8_1_2', igTier: 3, year: 2025, status: 'Roadmap',
    leadAssessor: 'u-003', team: ['u-003', 'u-004'],
    startDate: '2025-08-15', targetEndDate: '2025-12-20',
    scope: 'IG3 hardening review prior to MoD bid.', reportVersion: 0,
  },
  {
    id: 'eng-2024-acorn-cis',
    clientId: 'client-003', framework: 'CIS_V8_1_2', igTier: 1, year: 2024, status: 'Signed Off',
    leadAssessor: 'u-003', team: ['u-003'],
    startDate: '2024-09-01', targetEndDate: '2024-12-31',
    scope: 'Trust-wide CIS Controls IG1 baseline assessment.', reportVersion: 2,
    qaSignOff: { reviewerId: 'u-006', decision: 'Approved with comments', comments: 'Approved. Recommend richer benchmark commentary for next year.', signedAt: '2024-12-22T10:05:00Z' },
  },
] as Omit<Engagement, 'progressPct'>[]).map((e) => ({ ...e, progressPct: progressFromStatus(e.status) }));

// ----------------------------------------------------------------------------

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}

function pseudoRandom(seed: number): () => number {
  let x = seed || 1;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return ((x >>> 0) % 10000) / 10000;
  };
}

const DOC_STATUSES: DocStatus[] = ['in_place', 'partial', 'out_of_date', 'not_in_place', 'not_applicable'];
const SAMPLE_DOC_NAMES = [
  'Information Security Policy v3.2', 'Acceptable Use Policy', 'Risk Management Framework',
  'Asset Management Standard', 'Vulnerability Management Procedure', 'Identity & Access Management Policy',
  'Incident Response Plan', 'Business Continuity Plan', 'Data Classification Standard',
  'Third-Party Risk Management Procedure', 'Logging & Monitoring Standard', 'Secure Development Lifecycle Guide',
];

const ASSIGNEE_POOL = ['u-002','u-003','u-004','u-005','u-006'];

export function generateAssessmentItems(engagement: Engagement): AssessmentItem[] {
  const fw = FRAMEWORKS[engagement.framework];
  const items = flattenItems(fw, engagement.igTier);
  return items.map((it, idx) => {
    const seed = hashSeed(`${engagement.id}::${it.id}`);
    const rnd = pseudoRandom(seed);
    const docStatus: DocStatus = DOC_STATUSES[Math.floor(rnd() * DOC_STATUSES.length)];

    // Score distribution: skew so meaningful gaps exist
    const baseScore = Math.floor(rnd() * 4) + 1;
    const currentScore = Math.min(5, baseScore) as CMMIScore;
    const targetScore = Math.min(5, currentScore + 1 + Math.floor(rnd() * 2)) as CMMIScore;

    const theme = themeForItem(it.id, engagement.framework);
    const findings = FINDINGS_BY_THEME[theme] || [];

    // Generate a finding (observation + paired risk + paired recommendation) when there's a gap
    const hasGap = currentScore <= 2 && findings.length > 0 && rnd() > 0.25;
    const observations: Observation[] = [];
    const risks: Risk[] = [];
    const recommendations: Recommendation[] = [];

    if (hasGap) {
      const finding = findings[Math.floor(rnd() * findings.length)];
      const obsId = `ob-${seed}`;
      const observation: Observation = {
        id: obsId,
        title: finding.observation.title,
        body: finding.observation.body,
        theme,
        severity: finding.observation.severity,
        evidenceRefs: finding.observation.evidenceRefs,
        provenance: rnd() > 0.45 ? 'manual' : 'ai-suggested',
        linkedItemIds: [it.id],
        status: rnd() > 0.5 ? 'Confirmed' : 'In Review',
        assigneeId: ASSIGNEE_POOL[Math.floor(rnd() * ASSIGNEE_POOL.length)],
      };
      observations.push(observation);

      const risk: Risk = {
        id: `rk-${seed}`,
        title: finding.risk.title,
        description: finding.risk.description,
        impact: finding.risk.impact,
        likelihood: finding.risk.likelihood,
        inherentScore: finding.risk.impact * finding.risk.likelihood,
        treatment: finding.risk.treatment,
        rationale: finding.risk.rationale,
        provenance: observation.provenance,
        linkedObservationIds: [obsId],
        linkedItemIds: [it.id],
        owner: 'CISO Office',
        assigneeId: observation.assigneeId,
      };
      risks.push(risk);

      const recommendation: Recommendation = {
        id: `rc-${seed}`,
        title: finding.recommendation.title,
        description: finding.recommendation.description,
        priority: finding.recommendation.priority,
        effort: finding.recommendation.effort,
        costBand: finding.recommendation.costBand,
        horizon: finding.recommendation.horizon,
        capabilityArea: THEME_TO_CAPABILITY[theme],
        benefits: finding.recommendation.benefits,
        successCriteria: finding.recommendation.successCriteria,
        provenance: observation.provenance,
        linkedItemIds: [it.id],
        linkedObservationIds: [obsId],
        assigneeId: observation.assigneeId,
      };
      recommendations.push(recommendation);
    }

    const notes: NoteEntry[] = [];
    if (hasGap || rnd() > 0.65) {
      const sample = [
        `Workshop with ${theme} owners confirmed the documented procedure but identified gaps in measurement. The current SLA is defined at policy level but not yet wired through to the operational dashboard. Owners requested support in defining the metric set.`,
        `Evidence reviewed (policy + most recent operating report) is consistent with documented design. Workshop participants noted that recent organisational change has not yet been reflected in the procedure text and committed to an update by end of next quarter.`,
        `Operational practice is broadly aligned to the documented intent but exception handling is informal. Two cases reviewed in the last quarter were managed through ad-hoc engagement rather than the published exception process.`,
        `Capability has been the subject of recent investment and a credible plan exists. Workshop participants requested that the assessment recognise the in-flight uplift in the rationale rather than scoring purely against current state.`,
      ];
      notes.push({
        id: `nt-${seed}`, body: sample[idx % sample.length],
        author: 'u-002', createdAt: '2025-11-08T10:00:00Z',
        provenance: rnd() > 0.4 ? 'manual' : 'ai-edited',
      });
    }

    return {
      id: `ai-${engagement.id}-${it.id}`,
      engagementId: engagement.id, itemId: it.id, docStatus,
      evidence: docStatus !== 'not_applicable' && rnd() > 0.5
        ? [{ id: `ev-${seed}`, name: SAMPLE_DOC_NAMES[Math.floor(rnd() * SAMPLE_DOC_NAMES.length)], status: docStatus, version: `v${1 + Math.floor(rnd() * 4)}.${Math.floor(rnd() * 9)}`, lastReviewed: `2025-0${1 + Math.floor(rnd() * 9)}-15`, uploadedBy: 'u-002', comments: 'Reviewed against current operating practices.' }]
        : [],
      notes, observations, risks, recommendations,
      currentScore, targetScore,
      rationale: notes.length ? `Score reflects evidence reviewed and workshop discussion. Operational delivery against the documented intent is broadly consistent but measurement and exception handling are informal.` : undefined,
      reviewedBy: 'u-002', reviewedAt: '2025-11-09T14:32:00Z',
    };
  });
}

export const MOCK_ROADMAP_INITIATIVES: RoadmapInitiative[] = [
  {
    id: 'rm-001', engagementId: 'eng-2025-meridian-nist',
    title: 'Identity Modernisation Programme',
    description: 'Federate remaining legacy applications, retire local administrator accounts, and migrate exempt service accounts to managed / workload identities and certificate-based authentication. Phased delivery: cloud-first migration in months 1–3, on-premise gMSA migration in months 3–5, exclusion-group sunset in months 4–6.',
    horizon: '3–6m', effort: 'L', costBand: '£100–500k',
    owner: 'CISO Office', assigneeId: 'u-002', dependencies: [], linkedRecommendationIds: [],
    capabilityArea: 'Identity & Access', status: 'Approved',
    outcomes: ['Service-account MFA bypass eliminated', 'Privileged Linux/mainframe access brokered through PAM', 'Same-day leaver deprovisioning SLA met for ≥95%'],
  },
  {
    id: 'rm-002', engagementId: 'eng-2025-meridian-nist',
    title: 'Resilience Exercise Programme',
    description: 'Establish quarterly tabletop exercises and twice-yearly full-scope live recovery exercises across tier-1 platforms with measurable RTO/RPO outcomes. First exercise focuses on the immutable backup chain assumption.',
    horizon: '0–3m', effort: 'M', costBand: '£25–100k',
    owner: 'Head of Resilience', assigneeId: 'u-003', dependencies: [], linkedRecommendationIds: [],
    capabilityArea: 'Resilience', status: 'In Progress',
    outcomes: ['RTO verified for all tier-1 platforms', 'Immutable backup integrity proven via adversary simulation'],
  },
  {
    id: 'rm-003', engagementId: 'eng-2025-meridian-nist',
    title: 'OT Asset Visibility Uplift',
    description: 'Deploy passive OT discovery and onboard branch operational assets to the central CMDB with lifecycle ownership. Pilot in two regional clusters before phased rollout.',
    horizon: '6–12m', effort: 'L', costBand: '£100–500k',
    owner: 'Head of Infrastructure', assigneeId: 'u-004', dependencies: ['rm-001'], linkedRecommendationIds: [],
    capabilityArea: 'Asset Management', status: 'Proposed',
    outcomes: ['100% OT asset inventory in CMDB', 'Vulnerability scanner targeting confirmed for safe-to-scan OT segments'],
  },
  {
    id: 'rm-004', engagementId: 'eng-2025-meridian-nist',
    title: 'Third-Party Risk Operating Model',
    description: 'Re-tier inherited supplier portfolio; deploy continuous external posture monitoring across tier-1/tier-2; integrate to procurement and contract lifecycle.',
    horizon: '6–12m', effort: 'L', costBand: '£100–500k',
    owner: 'CRO', assigneeId: 'u-006', dependencies: [], linkedRecommendationIds: [],
    capabilityArea: 'Third-Party Risk', status: 'Proposed',
    outcomes: ['100% inherited suppliers re-tiered', 'Continuous monitoring across tier-1/tier-2'],
  },
  {
    id: 'rm-005', engagementId: 'eng-2025-meridian-nist',
    title: 'Detection Engineering Maturity',
    description: 'Onboard cloud-native telemetry to the SIEM, develop MITRE-aligned cloud detection content, adopt detection-as-code, and stand up a quarterly purple team programme.',
    horizon: '12–24m', effort: 'XL', costBand: '>£500k',
    owner: 'Head of SOC', assigneeId: 'u-005', dependencies: ['rm-001'], linkedRecommendationIds: [],
    capabilityArea: 'Detection & Response', status: 'Proposed',
    outcomes: ['MITRE Cloud TTP coverage ≥70%', 'True-positive rate ≥15% sustained over two quarters'],
  },
  {
    id: 'rm-006', engagementId: 'eng-2025-meridian-nist',
    title: 'Governance & Policy Currency',
    description: 'Appoint Policy Framework Owner; implement quarterly policy review cadence; close out the most overdue policies first.',
    horizon: '0–3m', effort: 'S', costBand: '<£25k',
    owner: 'Head of GRC', assigneeId: 'u-002', dependencies: [], linkedRecommendationIds: [],
    capabilityArea: 'Governance & Risk', status: 'In Progress',
    outcomes: ['Zero Group policies more than 18 months from last review', 'Quarterly minuted reviews evidenced'],
  },
];

export const MOCK_TRANSCRIPTS: Transcript[] = [
  { id: 'tr-001', engagementId: 'eng-2025-meridian-nist', title: 'Workshop — Govern (GV.OC, GV.RM, GV.RR)', uploadedAt: '2025-11-04T14:00:00Z', uploadedBy: 'u-002', durationMinutes: 92, participants: ['CISO', 'Head of GRC', 'Risk Director'], status: 'extracted', derivedNoteCount: 18 },
  { id: 'tr-002', engagementId: 'eng-2025-meridian-nist', title: 'Workshop — Identify (Asset Management, Risk Assessment)', uploadedAt: '2025-11-06T10:00:00Z', uploadedBy: 'u-004', durationMinutes: 78, participants: ['Head of Infrastructure', 'CMDB Owner', 'Vulnerability Manager'], status: 'extracted', derivedNoteCount: 14 },
  { id: 'tr-003', engagementId: 'eng-2025-meridian-nist', title: 'Workshop — Protect (Identity, Data, Platform)', uploadedAt: '2025-11-10T13:30:00Z', uploadedBy: 'u-002', durationMinutes: 105, participants: ['Identity Lead', 'Data Protection Officer', 'Platform Engineering Lead'], status: 'extracted', derivedNoteCount: 22 },
  { id: 'tr-004', engagementId: 'eng-2025-meridian-nist', title: 'Workshop — Detect & Respond', uploadedAt: '2025-11-13T09:00:00Z', uploadedBy: 'u-006', durationMinutes: 88, participants: ['Head of SOC', 'IR Manager', 'Threat Intel Lead'], status: 'processing', derivedNoteCount: 0 },
];
