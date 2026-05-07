import type { AssessmentItem, Engagement, Framework, FrameworkId, CMMIScore, RoadmapInitiative } from '@/types';
import { ENGAGEMENT_STAGES } from '@/types';
import { FRAMEWORKS, findGroupForItem } from '@/data/frameworks';
import { findBenchmark } from '@/data/mock-benchmarks';

export interface GroupAggregate {
  groupCode: string;
  groupName: string;
  count: number;
  averageCurrent: number;
  averageTarget: number;
  benchmark?: number;
}

export function averageByGroup(engagement: Engagement, items: AssessmentItem[]): GroupAggregate[] {
  const fw = FRAMEWORKS[engagement.framework];
  const groupMap: Record<string, { items: AssessmentItem[]; name: string }> = {};
  for (const ai of items) {
    const meta = findGroupForItem(fw, ai.itemId);
    if (!meta) continue;
    const code = meta.group.code;
    if (!groupMap[code]) groupMap[code] = { items: [], name: meta.group.name };
    groupMap[code].items.push(ai);
  }
  return fw.groups.map((g) => {
    const bucket = groupMap[g.code]?.items || [];
    const sumCurrent = bucket.reduce((a, b) => a + b.currentScore, 0);
    const sumTarget = bucket.reduce((a, b) => a + b.targetScore, 0);
    return {
      groupCode: g.code,
      groupName: g.name,
      count: bucket.length,
      averageCurrent: bucket.length ? +(sumCurrent / bucket.length).toFixed(2) : 0,
      averageTarget: bucket.length ? +(sumTarget / bucket.length).toFixed(2) : 0,
    };
  });
}

export function overallAverage(items: AssessmentItem[]): number {
  if (!items.length) return 0;
  return +(items.reduce((a, b) => a + b.currentScore, 0) / items.length).toFixed(2);
}

export function overallTarget(items: AssessmentItem[]): number {
  if (!items.length) return 0;
  return +(items.reduce((a, b) => a + b.targetScore, 0) / items.length).toFixed(2);
}

export function distributionOfScores(items: AssessmentItem[]): Record<CMMIScore, number> {
  const dist: Record<CMMIScore, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const it of items) dist[it.currentScore]++;
  return dist;
}

export function topRisks(items: AssessmentItem[], limit = 5) {
  const all = items.flatMap((i) => i.risks);
  return all.sort((a, b) => b.inherentScore - a.inherentScore).slice(0, limit);
}

export function topRecommendations(items: AssessmentItem[], limit = 5) {
  const order = { P1: 1, P2: 2, P3: 3, P4: 4 };
  const all = items.flatMap((i) => i.recommendations);
  return all.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, limit);
}

export function buildBenchmarkSeries(
  engagement: Engagement,
  items: AssessmentItem[],
  scope: 'industry' | 'country' | 'global' | 'size-band',
  scopeValue: string,
) {
  const aggs = averageByGroup(engagement, items);
  const bm = findBenchmark(scope, scopeValue, engagement.framework);
  return aggs.map((a) => ({
    axis: a.groupCode,
    current: a.averageCurrent,
    benchmark: bm?.averageByGroup[a.groupCode] ?? 0,
    topQuartile: bm?.topQuartileByGroup[a.groupCode] ?? 0,
    bottomQuartile: bm?.bottomQuartileByGroup[a.groupCode] ?? 0,
  }));
}

export function buildRadarSeries(engagement: Engagement, items: AssessmentItem[], showBenchmark?: { scope: 'industry' | 'country' | 'global' | 'size-band'; value: string }) {
  const aggs = averageByGroup(engagement, items);
  const bm = showBenchmark
    ? findBenchmark(showBenchmark.scope, showBenchmark.value, engagement.framework)
    : undefined;
  return aggs.map((a) => ({
    axis: `${a.groupCode}`,
    current: a.averageCurrent,
    target: a.averageTarget,
    benchmark: bm?.averageByGroup[a.groupCode] ?? 0,
  }));
}

export function buildHeatmapRows(engagement: Engagement, items: AssessmentItem[]) {
  const fw = FRAMEWORKS[engagement.framework];
  return fw.groups.map((g) => {
    const cells: { code: string; title: string; current: CMMIScore; target?: CMMIScore }[] = [];
    for (const c of g.categories) {
      for (const it of c.items) {
        const ai = items.find((x) => x.itemId === it.id);
        if (!ai) continue;
        cells.push({ code: it.code, title: it.title, current: ai.currentScore, target: ai.targetScore });
      }
    }
    return { groupCode: g.code, groupName: g.name, cells };
  });
}

export function frameworkLabel(id: FrameworkId): string {
  return FRAMEWORKS[id].shortName;
}

export function frameworkOf(id: FrameworkId): Framework {
  return FRAMEWORKS[id];
}

/** Detailed engagement progress — combines stage position with within-stage completion. */
export function detailedProgress(
  engagement: Engagement,
  items: AssessmentItem[],
  initiatives: RoadmapInitiative[],
): { pct: number; withinStage: number; stageIndex: number } {
  const idx = ENGAGEMENT_STAGES.indexOf(engagement.status);
  let withinStage = 0;
  switch (engagement.status) {
    case 'Setup': withinStage = engagement.scope ? 1 : 0.4; break;
    case 'Footprint': withinStage = 1; break;
    case 'Documentation Review':
      withinStage = items.length ? items.filter((i) => i.docStatus !== 'not_in_place').length / items.length : 0;
      break;
    case 'Workshops & Notes':
      withinStage = items.length ? items.filter((i) => i.notes.length > 0).length / items.length : 0;
      break;
    case 'Observations': {
      const candidates = items.filter((i) => i.currentScore <= 2);
      withinStage = candidates.length ? candidates.filter((i) => i.observations.length > 0).length / candidates.length : 1;
      break;
    }
    case 'Scoring':
      withinStage = items.length ? items.filter((i) => i.rationale).length / items.length : 0;
      break;
    case 'Risks': {
      const obs = items.flatMap((i) => i.observations);
      const risks = items.flatMap((i) => i.risks);
      withinStage = obs.length ? Math.min(1, risks.length / obs.length) : 1;
      break;
    }
    case 'Recommendations': {
      const obs = items.flatMap((i) => i.observations);
      const recs = items.flatMap((i) => i.recommendations);
      withinStage = obs.length ? Math.min(1, recs.length / obs.length) : 1;
      break;
    }
    case 'Roadmap': withinStage = initiatives.length > 0 ? 1 : 0; break;
    case 'Benchmarking': withinStage = 1; break;
    case 'Reporting': withinStage = engagement.reportVersion > 0 ? 1 : 0.4; break;
    case 'QA Review': withinStage = engagement.qaSignOff ? 1 : 0.4; break;
    case 'Signed Off': return { pct: 100, withinStage: 1, stageIndex: idx };
  }
  const total = ENGAGEMENT_STAGES.length;
  const pct = Math.min(100, Math.max(0, Math.round(((idx + Math.min(1, withinStage)) / total) * 100)));
  return { pct, withinStage, stageIndex: idx };
}
