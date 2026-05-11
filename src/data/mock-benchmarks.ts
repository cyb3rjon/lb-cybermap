import type { BenchmarkSnapshot, FrameworkId } from '@/types';

// Group codes per framework
const NIST_GROUPS = ['GV', 'ID', 'PR', 'DE', 'RS', 'RC'];
const CIS_GROUPS = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18'];
const CAF_GROUPS = ['A', 'B', 'C', 'D'];

function bandFor(framework: FrameworkId): string[] {
  if (framework === 'NIST_CSF_2_0') return NIST_GROUPS;
  if (framework === 'CIS_V8_1_2') return CIS_GROUPS;
  return CAF_GROUPS;
}

/**
 * Build a benchmark snapshot from an average value with natural per-group variation.
 * Variation is small (±0.25) so a cohort average around 2.7 yields per-group values 2.45–2.95.
 */
function buildSnapshot(
  scope: BenchmarkSnapshot['scope'],
  scopeValue: string,
  framework: FrameworkId,
  averageOverall: number,
  cohortSize: number,
): BenchmarkSnapshot {
  const groups = bandFor(framework);
  const averageByGroup: Record<string, number> = {};
  const topQuartileByGroup: Record<string, number> = {};
  const bottomQuartileByGroup: Record<string, number> = {};
  for (let i = 0; i < groups.length; i++) {
    const offset = ((i % 5) - 2) * 0.12;
    const avg = +Math.min(4.6, Math.max(0.5, averageOverall + offset)).toFixed(2);
    averageByGroup[groups[i]] = avg;
    topQuartileByGroup[groups[i]] = +Math.min(5, avg + 0.9).toFixed(2);
    bottomQuartileByGroup[groups[i]] = +Math.max(0, avg - 0.9).toFixed(2);
  }
  return { scope, scopeValue, framework, averageByGroup, topQuartileByGroup, bottomQuartileByGroup, cohortSize };
}

// Industry × framework matrix. Cohort sizes reflect typical sector representation.
const INDUSTRY_AVG: Record<string, { avg: number; cohort: number }> = {
  'Financial Services':     { avg: 3.1, cohort: 38 },
  'Energy & Utilities':     { avg: 2.7, cohort: 19 },
  'Healthcare':             { avg: 2.4, cohort: 26 },
  'Retail':                 { avg: 2.5, cohort: 22 },
  'Transport & Logistics':  { avg: 2.6, cohort: 14 },
  'Manufacturing':          { avg: 2.5, cohort: 18 },
  'Technology':             { avg: 3.2, cohort: 31 },
  'Public Sector':          { avg: 2.6, cohort: 24 },
  'Telecommunications':     { avg: 3.0, cohort: 17 },
  'Pharmaceuticals':        { avg: 2.8, cohort: 12 },
  'Insurance':              { avg: 3.0, cohort: 28 },
};

const COUNTRY_AVG: Record<string, { avg: number; cohort: number }> = {
  'United Kingdom':       { avg: 2.8, cohort: 110 },
  'Republic of Ireland':  { avg: 2.7, cohort: 14 },
  'Germany':              { avg: 2.7, cohort: 42 },
  'France':               { avg: 2.6, cohort: 36 },
  'Netherlands':          { avg: 2.8, cohort: 22 },
  'United States':        { avg: 2.9, cohort: 88 },
};

const SIZE_AVG: Record<string, { avg: number; cohort: number }> = {
  'Small':       { avg: 2.0, cohort: 18 },
  'Mid-market':  { avg: 2.5, cohort: 46 },
  'Large':       { avg: 2.9, cohort: 72 },
  'Enterprise':  { avg: 3.2, cohort: 64 },
};

const GLOBAL_AVG: Record<FrameworkId, { avg: number; cohort: number }> = {
  NIST_CSF_2_0: { avg: 2.6, cohort: 240 },
  CIS_V8_1_2:   { avg: 2.5, cohort: 190 },
  NCSC_CAF_4_0: { avg: 2.6, cohort: 95 },
};

const FRAMEWORKS: FrameworkId[] = ['NIST_CSF_2_0', 'CIS_V8_1_2', 'NCSC_CAF_4_0'];

// Generate the full cartesian product of benchmarks.
function makeAll(): BenchmarkSnapshot[] {
  const out: BenchmarkSnapshot[] = [];

  for (const fw of FRAMEWORKS) {
    for (const [industry, { avg, cohort }] of Object.entries(INDUSTRY_AVG)) {
      out.push(buildSnapshot('industry', industry, fw, avg, cohort));
    }
    for (const [country, { avg, cohort }] of Object.entries(COUNTRY_AVG)) {
      out.push(buildSnapshot('country', country, fw, avg, cohort));
    }
    for (const [size, { avg, cohort }] of Object.entries(SIZE_AVG)) {
      out.push(buildSnapshot('size-band', size, fw, avg, cohort));
    }
    out.push(buildSnapshot('global', 'All', fw, GLOBAL_AVG[fw].avg, GLOBAL_AVG[fw].cohort));
  }
  return out;
}

export const MOCK_BENCHMARKS: BenchmarkSnapshot[] = makeAll();

export function findBenchmark(
  scope: BenchmarkSnapshot['scope'],
  scopeValue: string,
  framework: FrameworkId,
): BenchmarkSnapshot | undefined {
  return MOCK_BENCHMARKS.find(
    (b) => b.scope === scope && b.scopeValue === scopeValue && b.framework === framework,
  );
}

/** Calculate cohort average across all groups in a benchmark. Returns null if not available. */
export function cohortAverage(b: BenchmarkSnapshot | undefined): number | null {
  if (!b) return null;
  const values = Object.values(b.averageByGroup);
  if (!values.length) return null;
  return +(values.reduce((a, c) => a + c, 0) / values.length).toFixed(2);
}
