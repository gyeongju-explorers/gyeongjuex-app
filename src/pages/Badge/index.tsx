import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMe } from '@/api/auth';
import { getGradeProgress, type GradeProgress } from '@/api/missions';
import badgeEmblemInactiveIcon from '@/assets/icons/badge-emblem-inactive.svg';
import badgeEmblemIcon from '@/assets/icons/badge-emblem.svg';
import indicatorDotIcon from '@/assets/icons/indicator-dot.svg';
import rank1Image from '@/assets/images/rank-1.png';
import rank2Image from '@/assets/images/rank-2.png';
import rank3Image from '@/assets/images/rank-3.png';
import rank4Image from '@/assets/images/rank-4.png';
import { ThemedText } from '@/components/global/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

// GRADE_TIERS(server/src/lib/gradeTiers.ts)와 같은 순서 — 등급 인덱스로 매칭.
const RANK_IMAGES = [rank1Image, rank2Image, rank3Image, rank4Image];

// 로그인/토큰 연동 전 임시 폴백 — 서버의 GRADE_TIERS와 동일 (server/src/lib/gradeTiers.ts).
// 실제 로그인 붙으면 getGradeProgress() 실패 시 폴백 없이 에러 처리로 교체.
const FALLBACK_GRADE_PROGRESS: GradeProgress = {
  completedCount: 0,
  currentTier: null,
  nextTier: { threshold: 3, title: '골목길 탐색자' },
  missionsToNext: 3,
  tiers: [
    { threshold: 3, title: '골목길 탐색자', earned: false },
    { threshold: 5, title: '명소 탐험가', earned: false },
    { threshold: 10, title: '로컬 가이드', earned: false },
    { threshold: 14, title: '마스터 탐험가', earned: false },
  ],
};

// 점(등급 마커)은 라벨과 똑같이 균등 간격(justify-between)으로 배치한다 — 두 줄이 같은
// 레이아웃 규칙을 쓰기 때문에 항상 서로 정확히 정렬된다. 채워지는 길이만 실제 completedCount에
// 맞춰 등급 사이 구간을 선형 보간해서, 각 등급을 달성하는 순간 정확히 그 점까지 채워지게 한다.
function getFillPercent(tiers: GradeProgress['tiers'], completedCount: number) {
  if (tiers.length === 0) return 0;
  if (completedCount <= tiers[0].threshold) return 0;

  const step = 100 / (tiers.length - 1 || 1);
  for (let i = 0; i < tiers.length - 1; i++) {
    const current = tiers[i];
    const next = tiers[i + 1];
    if (completedCount <= next.threshold) {
      const segmentRatio =
        (completedCount - current.threshold) / (next.threshold - current.threshold);
      return i * step + segmentRatio * step;
    }
  }
  return 100;
}

function GradeProgressBar({
  tiers,
  completedCount,
}: {
  tiers: GradeProgress['tiers'];
  completedCount: number;
}) {
  const fillPercent = getFillPercent(tiers, completedCount);

  return (
    <View className="mt-24">
      <View className="h-16 rounded-full bg-black/50">
        <View
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: `${fillPercent}%` }}
        />
        <View className="absolute inset-0 flex-row items-center justify-between">
          {tiers.map((tier) => (
            <Image
              key={tier.threshold}
              source={indicatorDotIcon}
              tintColor={tier.earned ? '#29D9CE' : '#d9d9d9'}
              style={styles.progressDot}
            />
          ))}
        </View>
      </View>

      <View className="mt-12 flex-row justify-between">
        {tiers.map((tier) => (
          <ThemedText
            key={tier.threshold}
            weight={tier.earned ? 'bold' : 'medium'}
            className={`text-[10px] ${tier.earned ? 'text-white' : 'text-gray-300'}`}
          >
            {tier.title}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

export default function Badge() {
  const [progress, setProgress] = useState<GradeProgress>(FALLBACK_GRADE_PROGRESS);
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    getGradeProgress()
      .then(setProgress)
      .catch((error) => {
        console.error('Failed to fetch grade progress', error);
      });

    getMe()
      .then((me) => setNickname(me.nickname))
      .catch((error) => {
        console.error('Failed to fetch user profile', error);
      });
  }, []);

  const currentTierIndex = progress.tiers.findIndex(
    (tier) => tier.threshold === progress.currentTier?.threshold,
  );
  const rankImage = RANK_IMAGES[currentTierIndex === -1 ? 0 : currentTierIndex];
  const tierTitle = progress.currentTier?.title ?? progress.nextTier?.title ?? '탐험가';
  // 뱃지 그리드는 특정 장소가 아니라 누적 미션 완료 개수만큼 순서대로 칠해진다.
  const totalBadges = progress.tiers[progress.tiers.length - 1]?.threshold ?? 0;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View className="bg-secondary px-24 pb-28 pt-24">
          <ThemedText className="text-base text-gray-300">
            {nickname ?? '탐험가'}님의 등급
          </ThemedText>

          <View className="mt-8">
            <ThemedText weight="bold" className="pr-140 text-[36px] text-white">
              {tierTitle}
            </ThemedText>
            <Image source={rankImage} style={styles.rankImage} contentFit="contain" />
          </View>

          <ThemedText weight="bold" className="mt-8 text-[36px] text-primary mb-32">
            {progress.completedCount}개
          </ThemedText>

          <GradeProgressBar tiers={progress.tiers} completedCount={progress.completedCount} />
        </View>

        <ScrollView
          className="flex-1 bg-white"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
        >
          <View style={styles.badgeGrid}>
            {Array.from({ length: totalBadges }, (_, index) => (
              <View key={index} style={styles.badgeCell}>
                <Image
                  source={
                    index < progress.completedCount ? badgeEmblemIcon : badgeEmblemInactiveIcon
                  }
                  style={styles.badgeImage}
                  contentFit="contain"
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  rankImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 160,
    height: 140,
  },
  progressDot: {
    width: 10,
    height: 10,
  },
  gridContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    // Nav의 하단 탭바(80px)+PICK 버튼 돌출분까지 확실히 가리지 않도록 넉넉하게 비운다.
    paddingBottom: BottomTabInset + 132,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.three,
    rowGap: Spacing.three,
  },
  badgeCell: {
    width: '30%',
    aspectRatio: 1,
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
});
