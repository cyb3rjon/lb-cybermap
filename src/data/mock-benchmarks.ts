import type { BenchmarkSnapshot, FrameworkId } from '@/types';

// Industry / country / size-band benchmark percentiles (illustrative).
// Indexed by group code from the relevant framework.

const NIST_GROUPS = ['GV', 'ID', 'PR', 'DE', 'RS', 'RC'];
const CIS_GROUPS = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18'];
const CAF_GROUPS = ['A', 'B', 'C', 'D'];

function buildSnapshot(
  scope: BenchmarkSnapshot['scope'],
  scopeValue: string,
  framework: FrameworkId,
  groups: string[],
  baseline: Record<string, number>,
  cohortSize: number,
): BenchmarkSnapshot {
  const averageByGroup: Record<string, number> = {};
  const topQuartileByGroup: Record<string, number> = {};
  const bottomQuartileByGroup: Record<string, number> = {};
  for (const g of groups) {
    const avg = baseline[g] ?? 2.6;
    averageByGroup[g] = +avg.toFixed(2);
    topQuartileByGroup[g] = +(Math.min(5, avg + 0.9)).toFixed(2);
    bottomQuartileByGroup[g] = +(Math.max(0, avg - 0.9)).toFixed(2);
  }
  return { scope, scopeValue, framework, averageByGroup, topQuartileByGroup, bottomQuartileByGroup, cohortSize };
}

export const MOCK_BENCHMARKS: BenchmarkSnapshot[] = [
  buildSnapshot('industry', 'Financial Services', 'NIST_CSF_2_0', NIST_GROUPS,
    { GV: 3.1, ID: 2.9, PR: 3.0, DE: 2.7, RS: 2.8, RC: 2.6 }, 38),
  buildSnapshot('industry', 'Healthcare', 'NIST_CSF_2_0', NIST_GROUPS,
    { GV: 2.4, ID: 2.5, PR: 2.6, DE: 2.2, RS: 2.3, RC: 2.1 }, 26),
  buildSnapshot('industry', 'Energy & Utilities', 'NIST_CSF_2_0', NIST_GROUPS,
    { GV: 2.7, ID: 2.8, PR: 2.7, DE: 2.5, RS: 2.5, RC: 2.4 }, 19),
  buildSnapshot('industry', 'Retail', 'NIST_CSF_2_0', NIST_GROUPS,
    { GV: 2.5, ID: 2.6, PR: 2.7, DE: 2.4, RS: 2.5, RC: 2.3 }, 22),
  buildSnapshot('country', 'United Kingdom', 'NIST_CSF_2_0', NIST_GROUPS,
    { GV: 2.8, ID: 2.7, PR: 2.8, DE: 2.5, RS: 2.6, RC: 2.4 }, 110),
  buildSnapshot('global', 'All', 'NIST_CSF_2_0', NIST_GROUPS,
    { GV: 2.6, ID: 2.5, PR: 2.6, DE: 2.3, RS: 2.4, RC: 2.2 }, 240),
  buildSnapshot('size-band', 'Enterprise', 'NIST_CSF_2_0', NIST_GROUPS,
    { GV: 3.2, ID: 3.0, PR: 3.1, DE: 2.9, RS: 2.9, RC: 2.7 }, 64),

  buildSnapshot('industry', 'Healthcare', 'CIS_V8_1_2', CIS_GROUPS,
    Object.fromEntries(CIS_GROUPS.map((g, i) => [g, 2.3 + ((i % 5) * 0.12)])), 18),
  buildSnapshot('industry', 'Retail', 'CIS_V8_1_2', CIS_GROUPS,
    Object.fromEntries(CIS_GROUPS.map((g, i) => [g, 2.5 + ((i % 4) * 0.15)])), 24),
  buildSnapshot('industry', 'Manufacturing', 'CIS_V8_1_2', CIS_GROUPS,
    Object.fromEntries(CIS_GROUPS.map((g, i) => [g, 2.4 + ((i % 6) * 0.1)])), 16),

  buildSnapshot('industry', 'Energy & Utilities', 'NCSC_CAF_4_0', CAF_GROUPS,
    { A: 2.8, B: 2.7, C: 2.5, D: 2.4 }, 14),
  buildSnapshot('industry', 'Transport & Logistics', 'NCSC_CAF_4_0', CAF_GROUPS,
    { A: 2.6, B: 2.5, C: 2.3, D: 2.2 }, 11),
  buildSnapshot('country', 'United Kingdom', 'NCSC_CAF_4_0', CAF_GROUPS,
    { A: 2.7, B: 2.7, C: 2.5, D: 2.4 }, 42),
];

export function findBenchmark(
  scope: BenchmarkSnapshot['scope'],
  scopeValue: string,
  framework: FrameworkId,
): BenchmarkSnapshot | undefined {
  return MOCK_BENCHMARKS.find(
    (b) => b.scope === scope && b.scopeValue === scopeValue && b.framework === framework,
  );
}
