export type GradeTier = {
  threshold: number;
  title: string;
};

// 방문(미션 완료) 누적 개수 기준 등급. 오름차순 유지.
export const GRADE_TIERS: GradeTier[] = [
  { threshold: 3, title: '골목길 탐색자' },
  { threshold: 5, title: '숨은 명소 탐험가' },
  { threshold: 10, title: '경주 로컬 가이드' },
  { threshold: 14, title: '경주 마스터 탐험가' },
];

export type GradeProgress = {
  completedCount: number;
  currentTier: GradeTier | null;
  nextTier: GradeTier | null;
  missionsToNext: number | null;
  tiers: (GradeTier & { earned: boolean })[];
};

export function computeGradeProgress(completedCount: number): GradeProgress {
  let currentTier: GradeTier | null = null;
  let nextTier: GradeTier | null = null;

  for (const tier of GRADE_TIERS) {
    if (completedCount >= tier.threshold) {
      currentTier = tier;
    } else if (nextTier === null) {
      nextTier = tier;
    }
  }

  return {
    completedCount,
    currentTier,
    nextTier,
    missionsToNext: nextTier ? nextTier.threshold - completedCount : null,
    tiers: GRADE_TIERS.map((tier) => ({ ...tier, earned: completedCount >= tier.threshold })),
  };
}
