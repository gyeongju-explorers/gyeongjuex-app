import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/global/themed-text';

export default function MissionFailure() {
  const { message, placeId, image, name, latitude, longitude } = useLocalSearchParams<{
    message?: string;
    placeId?: string;
    image?: string;
    name?: string;
    latitude?: string;
    longitude?: string;
  }>();

  const handleRetry = () => {
    router.replace({
      pathname: '/mission/camera',
      params: { placeId, image, name, latitude, longitude },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1 px-24 gap-[240px] justify-center">
        <View className="items-center justify-center gap-16">
          <ThemedText className="text-3xl font-bold text-center">미션 실패</ThemedText>
          <ThemedText className="text-gray-900 text-center">
            {message ?? '미션 인증에 실패했어요. 다시 시도해주세요.'}
          </ThemedText>
        </View>

        <View className="flex-row gap-12 px-36">
          <Pressable
            onPress={() => router.replace('/')}
            className="flex-1 items-center rounded-full bg-secondary py-12"
          >
            <ThemedText className="text-white font-bold text-base px-32">홈으로</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleRetry}
            className="flex-1 items-center rounded-full bg-primary py-12 px-32"
          >
            <ThemedText className="text-black font-bold text-base">다시 촬영하기</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
