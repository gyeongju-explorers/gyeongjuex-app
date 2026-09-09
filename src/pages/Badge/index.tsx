import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getGradeProgress, type GradeProgress } from '@/api/missions';
import badgeActiveIcon from '@/assets/icons/badge-active.svg';
import badgeInactiveIcon from '@/assets/icons/badge-inactive.svg';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

// 로그인/토큰 연동 전 임시 폴백 — 서버의 GRADE_TIERS와 동일 (server/src/lib/gradeTiers.ts).
// 실제 로그인 붙으면 getGradeProgress() 실패 시 폴백 없이 에러 처리로 교체.
const FALLBACK_GRADE_PROGRESS: GradeProgress = {
  completedCount: 0,
  currentTier: null,
  nextTier: { threshold: 3, title: '골목길 탐색자' },
  missionsToNext: 3,
  tiers: [
    { threshold: 3, title: '골목길 탐색자', earned: false },
    { threshold: 5, title: '숨은 명소 탐험가', earned: false },
    { threshold: 10, title: '경주 로컬 가이드', earned: false },
    { threshold: 14, title: '경주 마스터 탐험가', earned: false },
  ],
};

export default function Badge() {
  const [progress, setProgress] = useState<GradeProgress>(FALLBACK_GRADE_PROGRESS);

  useEffect(() => {
    getGradeProgress()
      .then(setProgress)
      .catch(() => {
        // 로그인 연동 전이라 인증 실패가 예상되는 상태 — 폴백 값 유지.
      });
  }, []);

  return (
    <ThemedView style={{ flex: 1, alignItems: 'center' }}>
      <SafeAreaView
        style={{
          flex: 1,
          width: '100%',
          maxWidth: MaxContentWidth,
          paddingHorizontal: Spacing.four,
          paddingBottom: BottomTabInset + Spacing.three,
        }}
      >
        <ThemedText className="text-xl font-bold pt-16">뱃지</ThemedText>
        <ThemedText className="text-gray-700 mt-8">
          지금까지 {progress.completedCount}곳의 미션을 완료했어요
          {progress.missionsToNext !== null && progress.nextTier
            ? ` · 다음 등급까지 ${progress.missionsToNext}개 남았어요`
            : ' · 모든 등급을 달성했어요!'}
        </ThemedText>

        <View className="mt-24 gap-12">
          {progress.tiers.map((tier) => (
            <View
              key={tier.threshold}
              className={`flex-row items-center gap-12 rounded-2xl p-16 ${
                tier.earned ? 'bg-primary/10' : 'bg-gray-100'
              }`}
            >
              <Image
                source={tier.earned ? badgeActiveIcon : badgeInactiveIcon}
                style={{ width: 28, height: 28 }}
              />
              <View className="flex-1">
                <ThemedText className={`font-bold ${tier.earned ? 'text-black' : 'text-gray-700'}`}>
                  {tier.title}
                </ThemedText>
                <ThemedText className="text-gray-700 text-xs mt-2">
                  누적 방문 {tier.threshold}곳
                </ThemedText>
              </View>
              {tier.earned && <ThemedText className="text-primary font-bold">달성</ThemedText>}
            </View>
          ))}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
