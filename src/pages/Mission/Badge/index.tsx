import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// TODO: 등급별 실제 배지 일러스트로 교체 — 지금은 기존 네비 배지 아이콘을 확대한 임시 그래픽.
import badgeEmblem from '@/assets/icons/badge-emblem.svg';
import { ThemedText } from '@/components/global/themed-text';

export default function MissionBadge() {
  const { placeName, nextTierTitle, missionsToNext } = useLocalSearchParams<{
    placeName?: string;
    completedCount?: string;
    currentTierTitle?: string;
    nextTierTitle?: string;
    missionsToNext?: string;
  }>();

  const subtitle =
    nextTierTitle && missionsToNext
      ? `다음 등급(${nextTierTitle})까지 미션이 ${missionsToNext}개 남았어요`
      : '모든 등급을 달성했어요!';

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1 px-24">
        <ThemedText className="text-gray-700 text-xs">뱃지</ThemedText>

        <View className="flex-1 items-center justify-center gap-16 pb-40">
          <ThemedText className="text-2xl font-bold text-center">
            {placeName ? `${placeName} 픽투어 완료!` : '픽투어 완료!'}
          </ThemedText>
          <ThemedText className="text-gray-900 text-center">{subtitle}</ThemedText>

          <Image source={badgeEmblem} style={{ width: 220, height: 220 }} className="mt-24" />
        </View>

        <View className="flex-row gap-12 pb-40">
          <Pressable
            onPress={() => router.replace('/')}
            className="flex-1 items-center rounded-full bg-secondary py-16"
          >
            <ThemedText className="text-white font-bold">홈으로</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push('/badge')}
            className="flex-1 items-center rounded-full bg-primary py-16"
          >
            <ThemedText className="text-black font-bold">뱃지 보러가기</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
