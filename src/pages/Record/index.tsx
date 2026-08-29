import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FeaturedPhoto from '@/components/Record/FeaturedPhoto';
import PhotoIndicator from '@/components/Record/PhotoIndicator';
import PhotoPost from '@/components/Record/PhotoPost';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type RecordEntry = {
  id: string;
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
    location: '경상북도 경주시',
    place: '경북 경주시 첨성대 앞',
    date: '2025.05.18.SUN',
    photos: makePhotos('r1-', 14),
  },
  {
    id: '2',
    location: '경상북도 경주시',
    place: '경북 경주시 대릉원',
    date: '2025.03.02.SUN',
    photos: makePhotos('r2-', 3),
  },
  {
    id: '3',
    location: '경상북도 경주시',
    place: '경북 경주시 불국사',
    date: '2024.11.09.SAT',
    photos: makePhotos('r3-', 6),
  },
  {
    id: '4',
    location: '경상북도 경주시',
    place: '경북 경주시 동궁과 월지',
    date: '2024.08.01.THU',
    photos: makePhotos('r4-', 2),
  },
];

const FEATURED_COUNT = 3;

export default function Record() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);

  const featuredRecords = records.slice(0, FEATURED_COUNT);
  const hasRecord = featuredRecords.length > 0;
  const activeRecord = featuredRecords[activeIndex];
  const featuredDateRange = hasRecord
    ? `${featuredRecords[featuredRecords.length - 1].date} ~ ${featuredRecords[0].date}`
    : '';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-24 pb-[132px]"
        >
          {hasRecord && (
            <View className="gap-8">
              <ThemedText weight="bold" className="text-[24px] text-black">
                {activeRecord.location}
              </ThemedText>
              <ThemedText className="text-[12px] text-gray-900">{featuredDateRange}</ThemedText>
            </View>
          )}

          {hasRecord ? (
            <View>
              <View onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}>
                {pageWidth > 0 && (
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={(event) => {
                      const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
                      setActiveIndex(index);
                    }}
                  >
                    {featuredRecords.map((record) => (
                      <View key={record.id} style={{ width: pageWidth }}>
                        <FeaturedPhoto photos={record.photos} />
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
              <View className="pt-14">
                <PhotoIndicator total={featuredRecords.length} activeIndex={activeIndex} />
              </View>
            </View>
          ) : (
            <FeaturedPhoto photos={[]} />
          )}

          <View className="mt-8 gap-40">
            {records.map((record) => (
              <PhotoPost
                key={record.id}
                location={record.place}
                date={record.date}
                photos={record.photos}
              />
            ))}
          </View>
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
});
