import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FeaturedPhoto from '@/components/Record/FeaturedPhoto';
import PhotoPost from '@/components/Record/PhotoPost';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type RecordEntry = {
  id: string;
  type: 'mission' | 'camera';
  location: string;
  place: string;
  date: string;
  photos: string[];
};

const makePhotos = (seedPrefix: string, count: number) =>
  Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${seedPrefix}${i}/400/560`);

const records: RecordEntry[] = [
  {
    id: '1',
    type: 'mission',
    location: '경상북도 경주시',
    place: '경북 경주시 첨성대 앞',
    date: '2025.05.18.SUN',
    photos: makePhotos('r1-', 14),
  },
  {
    id: '2',
    type: 'mission',
    location: '경상북도 경주시',
    place: '경북 경주시 대릉원',
    date: '2025.03.02.SUN',
    photos: makePhotos('r2-', 3),
  },
  {
    id: '3',
    type: 'mission',
    location: '경상북도 경주시',
    place: '경북 경주시 불국사',
    date: '2024.11.09.SAT',
    photos: makePhotos('r3-', 6),
  },
  {
    id: '4',
    type: 'mission',
    location: '경상북도 경주시',
    place: '경북 경주시 동궁과 월지',
    date: '2024.08.01.THU',
    photos: makePhotos('r4-', 2),
  },
  {
    id: '5',
    type: 'camera',
    location: '경상북도 경주시',
    place: '',
    date: '2025.04.20.SUN',
    photos: makePhotos('c1-', 5),
  },
  {
    id: '6',
    type: 'camera',
    location: '경상북도 경주시',
    place: '',
    date: '2024.09.12.THU',
    photos: makePhotos('c2-', 2),
  },
];

const STACK_SIZE = 3;

function SectionTitle({ children }: { children: string }) {
  return (
    <ThemedText weight="bold" className="text-lg text-black">
      {children}
    </ThemedText>
  );
}

export default function Record() {
  const missionRecords = records.filter((record) => record.type === 'mission');
  const cameraRecords = records.filter((record) => record.type === 'camera');

  const missionPhotos = missionRecords.flatMap((record) => record.photos);

  const featuredRecords = missionRecords.slice(0, STACK_SIZE);
  const featuredPhotos = featuredRecords.map((record) => record.photos[0]);
  const hasFeaturedPhotos = featuredPhotos.length > 0;
  const featuredLocation = featuredRecords[0]?.location ?? '';
  const featuredDateRange = hasFeaturedPhotos
    ? `${featuredRecords[featuredRecords.length - 1].date} ~ ${featuredRecords[0].date}`
    : '';

  const cameraPhotos = cameraRecords.flatMap((record) => record.photos);
  const cameraDateRange =
    cameraRecords.length > 0
      ? `${cameraRecords[cameraRecords.length - 1].date} ~ ${cameraRecords[0].date}`
      : '';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {hasFeaturedPhotos && (
            <View className="gap-8">
              <ThemedText weight="bold" className="text-[24px] text-black">
                {featuredLocation}
              </ThemedText>
              <ThemedText className="text-[12px] text-gray-900">{featuredDateRange}</ThemedText>
            </View>
          )}

          <FeaturedPhoto photos={featuredPhotos} />

          {missionPhotos.length > 0 && (
            <View className="mt-16 gap-16">
              <SectionTitle>미션 모아보기</SectionTitle>
              <PhotoPost photos={missionPhotos} />
            </View>
          )}

          {cameraPhotos.length > 0 && (
            <View className="mt-16 gap-16">
              <SectionTitle>최근 찍은 사진 모아보기</SectionTitle>
              <ThemedText className="text-[12px] text-gray-900">{cameraDateRange}</ThemedText>
              <PhotoPost photos={cameraPhotos} />
            </View>
          )}
        </ScrollView>
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
    paddingTop: 21,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 132,
  },
});
