import type { Framework, FrameworkId, FrameworkItem } from '@/types';
import { NIST_CSF } from './nist-csf';
import { CIS_CONTROLS } from './cis-controls';
import { NCSC_CAF } from './ncsc-caf';

export const FRAMEWORKS: Record<FrameworkId, Framework> = {
  NIST_CSF_2_0: NIST_CSF,
  CIS_V8_1_2: CIS_CONTROLS,
  NCSC_CAF_4_0: NCSC_CAF,
};

export function getFramework(id: FrameworkId): Framework {
  return FRAMEWORKS[id];
}

export function listFrameworks(): Framework[] {
  return [NIST_CSF, CIS_CONTROLS, NCSC_CAF];
}

export function flattenItems(framework: Framework, igFilter?: 1 | 2 | 3): FrameworkItem[] {
  const out: FrameworkItem[] = [];
  for (const g of framework.groups) {
    for (const c of g.categories) {
      for (const i of c.items) {
        if (igFilter && i.igTier && i.igTier > igFilter) continue;
        out.push(i);
      }
    }
  }
  return out;
}

export function findItem(framework: Framework, itemId: string): FrameworkItem | undefined {
  for (const g of framework.groups) {
    for (const c of g.categories) {
      for (const i of c.items) {
        if (i.id === itemId) return i;
      }
    }
  }
  return undefined;
}

export function findGroupForItem(framework: Framework, itemId: string) {
  for (const g of framework.groups) {
    for (const c of g.categories) {
      for (const i of c.items) {
        if (i.id === itemId) return { group: g, category: c };
      }
    }
  }
  return undefined;
}

export { NIST_CSF, CIS_CONTROLS, NCSC_CAF };
