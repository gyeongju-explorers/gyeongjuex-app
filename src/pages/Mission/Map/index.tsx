import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import image1 from '@/assets/images/image1.png';
import image2 from '@/assets/images/image2.png';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import type { MissionCardProps } from '@/components/Mission/MissionCard';
import MissionChipList from '@/components/Mission/MissionChipList';
import MissionListModal from '@/components/Mission/MissionListModal';
import MissionSlide from '@/components/Mission/MissionSlide';
import PhotoMarker from '@/components/Mission/PhotoMarker';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const MISSIONS: MissionCardProps[] = [
  {
    photos: [image1, image2, image1, image1, image2, image1],
    title: '첨성대',
    description: '경주 첨성대 일대',
  },
  { photos: [image2, image1], title: '동궁과 월지', description: '경주 동궁과 월지 일대' },
  {
    photos: [image1, image2, image1, image1, image2, image1],
    title: '첨성대',
    description: '경주 첨성대 일대',
  },
  { photos: [image2, image1], title: '동궁과 월지', description: '경주 동궁과 월지 일대' },
];

export default function MissionMap() {
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText weight="bold">Mission/Map</ThemedText>
        <View>
          <MissionChipList />
        </View>
        <PhotoMarker photos={[image1]} />
        <PhotoMarker photos={[image1, image1]} />
        <MissionSlide
          photos={[image1, image2, image1, image2, image1, image2, image1, image2]}
          onOpenListModal={() => setIsListModalOpen(true)}
        />
      </SafeAreaView>
      <MissionListModal
        visible={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        missions={MISSIONS}
      />
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
