import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RelatedTouristSpot } from '@/api/missions';
import badgeEmblem from '@/assets/icons/badge-emblem.svg';
import { ThemedText } from '@/components/global/themed-text';

function parseRelatedPlaces(raw?: string): RelatedTouristSpot[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function MissionSuccess() {
  const { placeName, nextTierTitle, missionsToNext, relatedPlaces } = useLocalSearchParams<{
    placeName?: string;
    completedCount?: string;
    currentTierTitle?: string;
    nextTierTitle?: string;
    missionsToNext?: string;
    relatedPlaces?: string;
  }>();

  const subtitle =
    nextTierTitle && missionsToNext
      ? `다음 등급까지 미션이 ${missionsToNext}개 남았어요`
      : '모든 등급을 달성했어요!';

  // 한국관광공사 연관 관광지 API에서 나온 결과가 있을 때만 노출 — 없으면 섹션째로 숨긴다.
  const recommendations = parseRelatedPlaces(relatedPlaces);

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1 px-24 justify-center gap-100">
        <View className="items-center justify-center gap-20">
          <ThemedText className="text-3xl font-bold text-center">
            {placeName ? `${placeName} 픽투어 완료!` : '픽투어 완료!'}
          </ThemedText>
          <ThemedText className="text-gray-900 text-center">{subtitle}</ThemedText>

          <Image source={badgeEmblem} style={{ width: 270, height: 270 }} className="mt-24" />
        </View>

        <View className="gap-20">
          <View className="flex-row gap-12 px-36">
            <Pressable
              onPress={() => router.replace('/')}
              className="flex-1 items-center rounded-full bg-secondary py-12"
            >
              <ThemedText className="text-white font-bold text-base px-36">홈으로</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push('/badge')}
              className="flex-1 items-center rounded-full bg-primary py-12 px-36"
            >
              <ThemedText className="text-black font-bold text-base">뱃지 보러가기</ThemedText>
            </Pressable>
          </View>

          {recommendations.length > 0 && (
            <View className="m-24 p-16 gap-8 rounded-2xl bg-primary/10">
              <ThemedText className="text-gray-900 text-lg font-bold text-center">
                이런 곳도 함께 가보세요
              </ThemedText>
              {recommendations.map((spot, index) => (
                <View
                  key={spot.name}
                  className={`flex-row items-center justify-between pt-8 ${
                    index > 0 ? 'border-t border-gray-200' : ''
                  }`}
                >
                  <ThemedText className="text-base flex-1" numberOfLines={1}>
                    {spot.name}
                  </ThemedText>
                  <ThemedText className="text-sm text-gray-900 bg-white py-2 px-8 border-primary border-2 rounded-full">
                    {spot.category}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
