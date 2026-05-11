import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Engagement, AssessmentItem, RoadmapInitiative, Transcript, Client,
  CMMIScore, DocStatus, NoteEntry, Observation, Risk, Recommendation, QASignOff, EngagementStatus,
} from '@/types';
import { progressFromStatus, ENGAGEMENT_STAGES } from '@/types';
import { MOCK_CLIENTS } from '@/data/mock-clients';
import { MOCK_USERS, CURRENT_USER } from '@/data/mock-users';
import { MOCK_ENGAGEMENTS, MOCK_ROADMAP_INITIATIVES, MOCK_TRANSCRIPTS, generateAssessmentItems } from '@/data/mock-engagements';
import { themeForItem, FINDINGS_BY_THEME, THEME_TO_CAPABILITY } from '@/data/content-library';
import { findItem } from '@/data/frameworks';

interface FilterState {
  industry?: string;
  country?: string;
  framework?: string;
  igTier?: number;
  year?: number;
  sizeBand?: string;
}

const EMPTY_ITEMS: AssessmentItem[] = [];
const EMPTY_ROADMAP: RoadmapInitiative[] = [];
const EMPTY_TRANSCRIPTS: Transcript[] = [];

interface AppState {
  clients: Client[];
  users: typeof MOCK_USERS;
  currentUserId: string;
  engagements: Engagement[];
  assessmentItemsByEngagement: Record<string, AssessmentItem[]>;
  roadmapByEngagement: Record<string, RoadmapInitiative[]>;
  transcriptsByEngagement: Record<string, Transcript[]>;
  filters: FilterState;

  getEngagement: (id: string) => Engagement | undefined;
  getClient: (id: string) => Client | undefined;
  getUser: (id: string) => typeof MOCK_USERS[number] | undefined;
  getAssessmentItems: (engagementId: string) => AssessmentItem[];
  getAssessmentItem: (engagementId: string, itemId: string) => AssessmentItem | undefined;
  getRoadmap: (engagementId: string) => RoadmapInitiative[];
  getTranscripts: (engagementId: string) => Transcript[];

  setFilters: (f: Partial<FilterState>) => void;
  clearFilters: () => void;

  updateAssessmentItem: (engagementId: string, itemId: string, patch: Partial<AssessmentItem>) => void;
  setDocStatus: (engagementId: string, itemId: string, status: DocStatus) => void;
  setScore: (engagementId: string, itemId: string, current: CMMIScore, target?: CMMIScore) => void;

  addNote: (engagementId: string, itemId: string, note: Omit<NoteEntry, 'id' | 'createdAt'>) => void;
  addObservation: (engagementId: string, itemId: string, obs: Omit<Observation, 'id'>) => void;
  updateObservation: (engagementId: string, itemId: string, obsId: string, patch: Partial<Observation>) => void;
  addRisk: (engagementId: string, itemId: string, risk: Omit<Risk, 'id' | 'inherentScore'>) => void;
  updateRisk: (engagementId: string, itemId: string, riskId: string, patch: Partial<Risk>) => void;
  addRecommendation: (engagementId: string, itemId: string, rec: Omit<Recommendation, 'id'>) => void;
  updateRecommendation: (engagementId: string, itemId: string, recId: string, patch: Partial<Recommendation>) => void;

  addRoadmapInitiative: (init: Omit<RoadmapInitiative, 'id'>) => string;
  updateRoadmapInitiative: (id: string, patch: Partial<RoadmapInitiative>) => void;
  removeRoadmapInitiative: (id: string) => void;

  setEngagementStatus: (engagementId: string, status: EngagementStatus) => void;
  advanceEngagementStage: (engagementId: string) => void;
  createEngagement: (eng: Omit<Engagement, 'id' | 'progressPct' | 'status' | 'reportVersion'> & { status?: EngagementStatus }) => string;
  setQASignOff: (engagementId: string, signOff: QASignOff) => void;
  bumpReportVersion: (engagementId: string) => void;

  createClient: (client: Omit<Client, 'id'>) => string;

  // AI generation (mocked locally — wire to backend when available)
  aiGenerateNotes: (engagementId: string) => number;
  aiGenerateFindings: (engagementId: string) => number; // generates obs+risk+rec triples
  aiGenerateObservations: (engagementId: string) => number;
  aiGenerateRisks: (engagementId: string) => number;
  aiGenerateRecommendations: (engagementId: string) => number;
  aiGenerateRoadmap: (engagementId: string) => number;
  aiSuggestScores: (engagementId: string) => number;

  // Transcript ingest (front-end mock)
  addTranscript: (engagementId: string, transcript: Omit<Transcript, 'id' | 'uploadedAt' | 'engagementId'>) => string;
  ingestTranscript: (engagementId: string, title: string, body: string, uploadedBy: string) => { transcriptId: string; notesAdded: number };

  resetMockData: () => void;
}

function buildInitialAssessmentItems(): Record<string, AssessmentItem[]> {
  const out: Record<string, AssessmentItem[]> = {};
  for (const eng of MOCK_ENGAGEMENTS) out[eng.id] = generateAssessmentItems(eng);
  return out;
}

function groupRoadmap(): Record<string, RoadmapInitiative[]> {
  return MOCK_ROADMAP_INITIATIVES.reduce<Record<string, RoadmapInitiative[]>>((acc, r) => {
    (acc[r.engagementId] ||= []).push(r);
    return acc;
  }, {});
}

function groupTranscripts(): Record<string, Transcript[]> {
  return MOCK_TRANSCRIPTS.reduce<Record<string, Transcript[]>>((acc, t) => {
    (acc[t.engagementId] ||= []).push(t);
    return acc;
  }, {});
}

const initialState = () => ({
  clients: MOCK_CLIENTS,
  users: MOCK_USERS,
  currentUserId: CURRENT_USER.id,
  engagements: MOCK_ENGAGEMENTS,
  assessmentItemsByEngagement: buildInitialAssessmentItems(),
  roadmapByEngagement: groupRoadmap(),
  transcriptsByEngagement: groupTranscripts(),
  filters: {} as FilterState,
});

function patchItems(
  state: AppState['assessmentItemsByEngagement'],
  engagementId: string,
  itemId: string,
  patch: (ai: AssessmentItem) => AssessmentItem,
) {
  const list = state[engagementId] || [];
  return { ...state, [engagementId]: list.map((ai) => (ai.itemId === itemId ? patch(ai) : ai)) };
}

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 6)}`;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState(),

      getEngagement: (id) => get().engagements.find((e) => e.id === id),
      getClient: (id) => get().clients.find((c) => c.id === id),
      getUser: (id) => get().users.find((u) => u.id === id),
      getAssessmentItems: (engagementId) => get().assessmentItemsByEngagement[engagementId] || EMPTY_ITEMS,
      getAssessmentItem: (engagementId, itemId) =>
        (get().assessmentItemsByEngagement[engagementId] || EMPTY_ITEMS).find((ai) => ai.itemId === itemId),
      getRoadmap: (engagementId) => get().roadmapByEngagement[engagementId] || EMPTY_ROADMAP,
      getTranscripts: (engagementId) => get().transcriptsByEngagement[engagementId] || EMPTY_TRANSCRIPTS,

      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      clearFilters: () => set({ filters: {} }),

      updateAssessmentItem: (engagementId, itemId, patch) =>
        set((s) => ({
          assessmentItemsByEngagement: patchItems(s.assessmentItemsByEngagement, engagementId, itemId, (ai) => ({ ...ai, ...patch })),
        })),

      setDocStatus: (engagementId, itemId, status) =>
        get().updateAssessmentItem(engagementId, itemId, { docStatus: status }),

      setScore: (engagementId, itemId, current, target) =>
        get().updateAssessmentItem(engagementId, itemId, {
          currentScore: current,
          ...(target !== undefined ? { targetScore: target } : {}),
        }),

      addNote: (engagementId, itemId, note) =>
        set((s) => ({
          assessmentItemsByEngagement: patchItems(s.assessmentItemsByEngagement, engagementId, itemId, (ai) => ({
            ...ai,
            notes: [...ai.notes, { ...note, id: newId('nt'), createdAt: new Date().toISOString() }],
          })),
        })),

      addObservation: (engagementId, itemId, obs) =>
        set((s) => ({
          assessmentItemsByEngagement: patchItems(s.assessmentItemsByEngagement, engagementId, itemId, (ai) => ({
            ...ai,
            observations: [...ai.observations, { ...obs, id: newId('ob') }],
          })),
        })),

      updateObservation: (engagementId, itemId, obsId, patch) =>
        set((s) => ({
          assessmentItemsByEngagement: patchItems(s.assessmentItemsByEngagement, engagementId, itemId, (ai) => ({
            ...ai,
            observations: ai.observations.map((o) => (o.id === obsId ? { ...o, ...patch } : o)),
          })),
        })),

      addRisk: (engagementId, itemId, risk) =>
        set((s) => ({
          assessmentItemsByEngagement: patchItems(s.assessmentItemsByEngagement, engagementId, itemId, (ai) => ({
            ...ai,
            risks: [...ai.risks, { ...risk, inherentScore: risk.impact * risk.likelihood, id: newId('rk') }],
          })),
        })),

      updateRisk: (engagementId, itemId, riskId, patch) =>
        set((s) => ({
          assessmentItemsByEngagement: patchItems(s.assessmentItemsByEngagement, engagementId, itemId, (ai) => ({
            ...ai,
            risks: ai.risks.map((r) => (r.id === riskId ? { ...r, ...patch, inherentScore: (patch.impact ?? r.impact) * (patch.likelihood ?? r.likelihood) } : r)),
          })),
        })),

      addRecommendation: (engagementId, itemId, rec) =>
        set((s) => ({
          assessmentItemsByEngagement: patchItems(s.assessmentItemsByEngagement, engagementId, itemId, (ai) => ({
            ...ai,
            recommendations: [...ai.recommendations, { ...rec, id: newId('rc') }],
          })),
        })),

      updateRecommendation: (engagementId, itemId, recId, patch) =>
        set((s) => ({
          assessmentItemsByEngagement: patchItems(s.assessmentItemsByEngagement, engagementId, itemId, (ai) => ({
            ...ai,
            recommendations: ai.recommendations.map((r) => (r.id === recId ? { ...r, ...patch } : r)),
          })),
        })),

      addRoadmapInitiative: (init) => {
        const id = newId('rm');
        set((s) => ({
          roadmapByEngagement: {
            ...s.roadmapByEngagement,
            [init.engagementId]: [...(s.roadmapByEngagement[init.engagementId] || []), { ...init, id }],
          },
        }));
        return id;
      },

      updateRoadmapInitiative: (id, patch) =>
        set((s) => {
          const next = { ...s.roadmapByEngagement };
          for (const k of Object.keys(next)) next[k] = next[k].map((r) => (r.id === id ? { ...r, ...patch } : r));
          return { roadmapByEngagement: next };
        }),

      removeRoadmapInitiative: (id) =>
        set((s) => {
          const next = { ...s.roadmapByEngagement };
          for (const k of Object.keys(next)) next[k] = next[k].filter((r) => r.id !== id);
          return { roadmapByEngagement: next };
        }),

      setEngagementStatus: (engagementId, status) =>
        set((s) => ({
          engagements: s.engagements.map((e) =>
            e.id === engagementId ? { ...e, status, progressPct: progressFromStatus(status) } : e,
          ),
        })),

      advanceEngagementStage: (engagementId) =>
        set((s) => ({
          engagements: s.engagements.map((e) => {
            if (e.id !== engagementId) return e;
            const idx = ENGAGEMENT_STAGES.indexOf(e.status);
            const next = ENGAGEMENT_STAGES[Math.min(ENGAGEMENT_STAGES.length - 1, idx + 1)];
            return { ...e, status: next, progressPct: progressFromStatus(next) };
          }),
        })),

      createEngagement: (eng) => {
        const id = newId('eng');
        const status = eng.status ?? 'Setup';
        const newEng: Engagement = {
          ...eng, id, status,
          progressPct: progressFromStatus(status),
          reportVersion: 0,
        };
        set((s) => ({
          engagements: [newEng, ...s.engagements],
          assessmentItemsByEngagement: { ...s.assessmentItemsByEngagement, [id]: generateAssessmentItems(newEng) },
          roadmapByEngagement: { ...s.roadmapByEngagement, [id]: [] },
          transcriptsByEngagement: { ...s.transcriptsByEngagement, [id]: [] },
        }));
        return id;
      },

      setQASignOff: (engagementId, signOff) =>
        set((s) => ({
          engagements: s.engagements.map((e) => {
            if (e.id !== engagementId) return e;
            const status: EngagementStatus = signOff.decision === 'Approved' || signOff.decision === 'Approved with comments' ? 'Signed Off' : 'Reporting';
            return { ...e, qaSignOff: signOff, status, progressPct: progressFromStatus(status) };
          }),
        })),

      bumpReportVersion: (engagementId) =>
        set((s) => ({
          engagements: s.engagements.map((e) =>
            e.id === engagementId ? { ...e, reportVersion: e.reportVersion + 1 } : e,
          ),
        })),

      createClient: (client) => {
        const id = newId('client');
        set((s) => ({ clients: [...s.clients, { ...client, id }] }));
        return id;
      },

      // ---- AI generation (mocked) -----------------------------------------

      aiGenerateNotes: (engagementId) => {
        const eng = get().engagements.find((e) => e.id === engagementId);
        if (!eng) return 0;
        const items = get().assessmentItemsByEngagement[engagementId] || [];
        let generated = 0;
        const phrases = [
          'AI summary from workshop transcript: participants confirmed the documented control intent but identified measurement gaps and noted in-flight investment.',
          'AI summary: cross-referenced policy text against operational evidence; control owner indicated planned uplift in next quarter.',
          'AI summary: workshop discussion highlighted exception handling as informal; control owner agreed to formalise via standard exception register.',
        ];
        const next = items.map((ai, i) => {
          if (ai.notes.length > 0) return ai;
          generated++;
          return {
            ...ai,
            notes: [{
              id: newId('nt'),
              author: 'u-002',
              body: phrases[i % phrases.length],
              createdAt: new Date().toISOString(),
              provenance: 'ai-suggested' as const,
            }],
          };
        });
        set((s) => ({ assessmentItemsByEngagement: { ...s.assessmentItemsByEngagement, [engagementId]: next } }));
        return generated;
      },

      aiGenerateFindings: (engagementId) => {
        const eng = get().engagements.find((e) => e.id === engagementId);
        if (!eng) return 0;
        const items = get().assessmentItemsByEngagement[engagementId] || [];

        // Determine in-use observation titles already on the engagement so we never
        // re-emit the same finding text against another safeguard.
        const usedTitles = new Set<string>();
        for (const ai of items) for (const o of ai.observations) usedTitles.add(o.title);

        // Group candidates by theme — only items with a low score and no existing finding qualify.
        const byTheme: Record<string, typeof items> = {};
        for (const ai of items) {
          if (ai.observations.length > 0) continue;
          if (ai.currentScore > 3) continue;
          const theme = themeForItem(ai.itemId, eng.framework);
          (byTheme[theme] ||= []).push(ai);
        }

        const assignments = new Map<string, Finding>();
        for (const [theme, candidates] of Object.entries(byTheme)) {
          const pool = (FINDINGS_BY_THEME[theme as keyof typeof FINDINGS_BY_THEME] || [])
            .filter((f) => !usedTitles.has(f.observation.title));
          if (pool.length === 0) continue;
          const sorted = [...candidates].sort(
            (a, b) => a.currentScore - b.currentScore || a.itemId.localeCompare(b.itemId),
          );
          const n = Math.min(sorted.length, pool.length);
          for (let i = 0; i < n; i++) {
            assignments.set(sorted[i].itemId, pool[i]);
            usedTitles.add(pool[i].observation.title);
          }
        }

        if (assignments.size === 0) return 0;

        let generated = 0;
        const next = items.map((ai) => {
          const f = assignments.get(ai.itemId);
          if (!f) return ai;
          const theme = themeForItem(ai.itemId, eng.framework);
          const obsId = newId('ob');
          const observation: Observation = {
            id: obsId,
            title: f.observation.title, body: f.observation.body, theme,
            severity: f.observation.severity, evidenceRefs: f.observation.evidenceRefs,
            provenance: 'ai-suggested', status: 'Draft', linkedItemIds: [ai.itemId],
          };
          const risk: Risk = {
            id: newId('rk'),
            title: f.risk.title, description: f.risk.description,
            impact: f.risk.impact, likelihood: f.risk.likelihood,
            inherentScore: f.risk.impact * f.risk.likelihood,
            treatment: f.risk.treatment, rationale: f.risk.rationale,
            provenance: 'ai-suggested',
            linkedObservationIds: [obsId], linkedItemIds: [ai.itemId],
            owner: 'CISO Office',
          };
          const recommendation: Recommendation = {
            id: newId('rc'),
            title: f.recommendation.title, description: f.recommendation.description,
            priority: f.recommendation.priority, effort: f.recommendation.effort,
            costBand: f.recommendation.costBand, horizon: f.recommendation.horizon,
            capabilityArea: THEME_TO_CAPABILITY[theme],
            benefits: f.recommendation.benefits, successCriteria: f.recommendation.successCriteria,
            provenance: 'ai-suggested',
            linkedItemIds: [ai.itemId], linkedObservationIds: [obsId],
          };
          generated++;
          return {
            ...ai,
            observations: [...ai.observations, observation],
            risks: [...ai.risks, risk],
            recommendations: [...ai.recommendations, recommendation],
          };
        });
        set((s) => ({ assessmentItemsByEngagement: { ...s.assessmentItemsByEngagement, [engagementId]: next } }));
        return generated;
      },

      // Backwards-compatible single-stage generators — they all delegate to aiGenerateFindings
      // because observation / risk / recommendation must travel together.
      aiGenerateObservations: (engagementId) => get().aiGenerateFindings(engagementId),
      aiGenerateRisks: (engagementId) => {
        // For items with an observation but no risk (rare after the triple migration), backfill
        const eng = get().engagements.find((e) => e.id === engagementId);
        if (!eng) return 0;
        const items = get().assessmentItemsByEngagement[engagementId] || [];
        let generated = 0;
        const next = items.map((ai) => {
          if (ai.risks.length > 0) return ai;
          if (ai.observations.length === 0) return ai;
          const theme = themeForItem(ai.itemId, eng.framework);
          const pool = FINDINGS_BY_THEME[theme] || [];
          if (!pool.length) return ai;
          const f = pool[0];
          generated++;
          return {
            ...ai,
            risks: [{
              id: newId('rk'),
              title: f.risk.title, description: f.risk.description,
              impact: f.risk.impact, likelihood: f.risk.likelihood,
              inherentScore: f.risk.impact * f.risk.likelihood,
              treatment: f.risk.treatment, rationale: f.risk.rationale,
              provenance: 'ai-suggested',
              linkedObservationIds: ai.observations.map((o) => o.id),
              linkedItemIds: [ai.itemId], owner: 'CISO Office',
            }],
          };
        });
        set((s) => ({ assessmentItemsByEngagement: { ...s.assessmentItemsByEngagement, [engagementId]: next } }));
        return generated;
      },
      aiGenerateRecommendations: (engagementId) => {
        const eng = get().engagements.find((e) => e.id === engagementId);
        if (!eng) return 0;
        const items = get().assessmentItemsByEngagement[engagementId] || [];
        let generated = 0;
        const next = items.map((ai) => {
          if (ai.recommendations.length > 0) return ai;
          if (ai.observations.length === 0) return ai;
          const theme = themeForItem(ai.itemId, eng.framework);
          const pool = FINDINGS_BY_THEME[theme] || [];
          if (!pool.length) return ai;
          const f = pool[0];
          generated++;
          return {
            ...ai,
            recommendations: [{
              id: newId('rc'),
              title: f.recommendation.title, description: f.recommendation.description,
              priority: f.recommendation.priority, effort: f.recommendation.effort,
              costBand: f.recommendation.costBand, horizon: f.recommendation.horizon,
              capabilityArea: THEME_TO_CAPABILITY[theme],
              benefits: f.recommendation.benefits, successCriteria: f.recommendation.successCriteria,
              provenance: 'ai-suggested',
              linkedItemIds: [ai.itemId],
              linkedObservationIds: ai.observations.map((o) => o.id),
            }],
          };
        });
        set((s) => ({ assessmentItemsByEngagement: { ...s.assessmentItemsByEngagement, [engagementId]: next } }));
        return generated;
      },

      aiGenerateRoadmap: (engagementId) => {
        const eng = get().engagements.find((e) => e.id === engagementId);
        if (!eng) return 0;
        const items = get().assessmentItemsByEngagement[engagementId] || [];
        const existing = get().roadmapByEngagement[engagementId] || [];
        // Cluster recommendations by capability area
        const allRecs = items.flatMap((i) => i.recommendations);
        if (!allRecs.length) return 0;
        const clusters: Record<string, Recommendation[]> = {};
        for (const r of allRecs) (clusters[r.capabilityArea] ||= []).push(r);
        const horizonRank = { '0–3m': 0, '3–6m': 1, '6–12m': 2, '12–24m': 3 } as const;
        const priorityRank = { P1: 0, P2: 1, P3: 2, P4: 3 } as const;
        let generated = 0;
        const newInitiatives: RoadmapInitiative[] = [];
        for (const [area, recs] of Object.entries(clusters)) {
          if (existing.some((i) => i.capabilityArea === area)) continue;
          recs.sort((a, b) => horizonRank[a.horizon] - horizonRank[b.horizon] || priorityRank[a.priority] - priorityRank[b.priority]);
          const top = recs[0];
          newInitiatives.push({
            id: newId('rm'),
            engagementId,
            title: `${area} Programme`,
            description: `Cluster of ${recs.length} recommendation${recs.length > 1 ? 's' : ''} in ${area}. Lead recommendation: "${top.title}". Sequence proposed by priority and horizon, with quarterly milestones tracked through the resilience steering committee.`,
            horizon: top.horizon,
            effort: top.effort,
            costBand: top.costBand,
            owner: 'CISO Office',
            dependencies: [],
            linkedRecommendationIds: recs.map((r) => r.id),
            capabilityArea: area,
            status: 'Proposed',
            outcomes: recs.flatMap((r) => r.successCriteria || []).slice(0, 4),
          });
          generated++;
        }
        if (!generated) return 0;
        set((s) => ({
          roadmapByEngagement: {
            ...s.roadmapByEngagement,
            [engagementId]: [...existing, ...newInitiatives],
          },
        }));
        return generated;
      },

      aiSuggestScores: (engagementId) => {
        const items = get().assessmentItemsByEngagement[engagementId] || [];
        let touched = 0;
        const next = items.map((ai) => {
          // Suggest a target one above current (capped at 5) and add rationale if missing
          if (ai.rationale) return ai;
          touched++;
          return {
            ...ai,
            targetScore: Math.min(5, ai.currentScore + 1) as CMMIScore,
            rationale: 'AI suggestion: target raised by one level based on observation severity and capability dependencies. Verify against planned investment.',
          };
        });
        set((s) => ({ assessmentItemsByEngagement: { ...s.assessmentItemsByEngagement, [engagementId]: next } }));
        return touched;
      },

      addTranscript: (engagementId, transcript) => {
        const id = newId('tr');
        const t: Transcript = { ...transcript, id, engagementId, uploadedAt: new Date().toISOString() };
        set((s) => ({
          transcriptsByEngagement: { ...s.transcriptsByEngagement, [engagementId]: [t, ...(s.transcriptsByEngagement[engagementId] || [])] },
        }));
        return id;
      },

      ingestTranscript: (engagementId, title, body, uploadedBy) => {
        const minutes = Math.max(2, Math.round(body.split(/\s+/).length / 150));
        const transcriptId = newId('tr');
        const transcript: Transcript = {
          id: transcriptId, engagementId, title,
          uploadedAt: new Date().toISOString(), uploadedBy,
          durationMinutes: minutes, participants: ['Workshop participants'],
          status: 'extracted', derivedNoteCount: 0,
        };

        // Generate notes from the transcript: pick a slice of items lacking notes and write a synthetic note that references the transcript.
        const eng = get().engagements.find((e) => e.id === engagementId);
        if (!eng) return { transcriptId, notesAdded: 0 };
        const items = get().assessmentItemsByEngagement[engagementId] || [];
        const phrases = body.length > 80
          ? body.split(/(?<=[.?!])\s+/).filter((s) => s.length > 40).slice(0, 12)
          : [
              `Workshop participants confirmed the documented procedure but identified gaps in measurement that should feed into the operating-rhythm dashboard.`,
              `Evidence cited during the session aligned with the policy intent; control owner committed to refresh the procedure to reflect organisational change.`,
              `Workshop highlighted that exception handling is informal and would benefit from a published standard exception register with sunset dates.`,
              `Recent investment is recognised by participants and a credible plan exists; the assessment recognises the in-flight uplift in the rationale field.`,
            ];

        let notesAdded = 0;
        const target = Math.min(8, items.filter((i) => i.notes.length === 0 && i.currentScore <= 3).length);
        const updated = [...items];
        let written = 0;
        for (let i = 0; i < updated.length && written < target; i++) {
          const ai = updated[i];
          if (ai.notes.length > 0 || ai.currentScore > 3) continue;
          updated[i] = {
            ...ai,
            notes: [{
              id: newId('nt'),
              author: uploadedBy,
              body: phrases[written % phrases.length].trim().slice(0, 600),
              createdAt: new Date().toISOString(),
              provenance: 'ai-suggested',
              sourceTranscriptId: transcriptId,
            }],
          };
          written++;
          notesAdded++;
        }

        transcript.derivedNoteCount = notesAdded;

        set((s) => ({
          transcriptsByEngagement: { ...s.transcriptsByEngagement, [engagementId]: [transcript, ...(s.transcriptsByEngagement[engagementId] || [])] },
          assessmentItemsByEngagement: { ...s.assessmentItemsByEngagement, [engagementId]: updated },
        }));

        return { transcriptId, notesAdded };
      },

      resetMockData: () => set(initialState()),
    }),
    {
      name: 'lb-cybermap',
      version: 4,
      migrate: (_persisted, _v) => initialState() as any,
      partialize: (s) => ({
        filters: s.filters,
        engagements: s.engagements,
        assessmentItemsByEngagement: s.assessmentItemsByEngagement,
        roadmapByEngagement: s.roadmapByEngagement,
        transcriptsByEngagement: s.transcriptsByEngagement,
        clients: s.clients,
      }),
    },
  ),
);

// helper used elsewhere
export { findItem };
