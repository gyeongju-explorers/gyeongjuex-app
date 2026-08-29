import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import image1 from '@/assets/images/image1.png';
import image2 from '@/assets/images/image2.png';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import MissionChipList from '@/components/Mission/MissionChipList';
import MissionSlide from '@/components/Mission/MissionSlide';
import PhotoMarker from '@/components/Mission/PhotoMarker';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function MissionMap() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText weight="bold">Mission/Map</ThemedText>
        <View>
          <MissionChipList />
        </View>
        <PhotoMarker photos={[image1]} />
        <PhotoMarker photos={[image1, image1]} />
        <MissionSlide photos={[image1, image2, image1, image2, image1, image2, image1, image2]} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#333333',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
});
