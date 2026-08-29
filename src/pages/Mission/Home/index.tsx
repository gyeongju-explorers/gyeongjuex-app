import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import image2 from '@/assets/images/image2.png';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import MissionButton from '@/components/Mission/MissionButton';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function MissionHome() {
  return (
    <ThemedView style={styles.container}>
      {/* banner */}
      <View className="flex-1 bg-gray-500 p-24 justify-between">
        <Image source={image2} contentFit="cover" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View className="gap-20">
          <ThemedText className="mt-24 font-bold text-primary">P!CK:TOUR</ThemedText>
          <ThemedText weight="bold" className="text-3xl text-white">
            이번에는 어디로 픽투어를 떠나게 될까요?
          </ThemedText>
          <ThemedText className="text-white text-base">
            이미지를 토대로 미션을 해결해보세요!
          </ThemedText>
        </View>
        <View className="items-end mb-10">
          <MissionButton text="미션 하러가기" border href="/mission/map" />
        </View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ThemedText className="pt-38 text-xl font-bold">주변에 위치한 미션장소</ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
});
