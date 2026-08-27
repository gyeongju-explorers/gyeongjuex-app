import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import MissionButton from '@/components/Mission/MissionButton';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function MissionHome() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* banner */}
        <View className="bg-black flex-1">
          <ThemedText>Pick:TOUR</ThemedText>
          <ThemedText weight="bold" className="text-3xl text-white">
            이번에는 어디로 픽투어를 떠나게 될까요?
          </ThemedText>
          <View>
            <MissionButton text="미션 하러가기" border href="/mission/map" />
            <MissionButton text="PICK !" />
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
});
