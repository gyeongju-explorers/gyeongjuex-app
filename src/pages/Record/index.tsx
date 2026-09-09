import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecordSummary, type RecordSummary } from '@/api/record';
import FeaturedPhoto from '@/components/Record/FeaturedPhoto';
import PhotoPost from '@/components/Record/PhotoPost';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const FEATURED_LOCATION = '경상북도 경주시';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}.${DAY_NAMES[date.getDay()]}`;
}

function formatDateRange(oldest: string, newest: string) {
  return `${formatDate(oldest)} ~ ${formatDate(newest)}`;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <ThemedText weight="bold" className="text-lg text-black">
      {children}
    </ThemedText>
  );
}

export default function Record() {
  const [summary, setSummary] = useState<RecordSummary | null>(null);

  useEffect(() => {
    let isMounted = true;

    getRecordSummary()
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch(() => {
        // 기록을 불러오지 못한 경우, 섹션 없이 빈 화면을 보여준다.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredPhotos = summary?.featured.photos ?? [];
  const hasFeaturedPhotos = featuredPhotos.length > 0;
  const featuredDateRange = hasFeaturedPhotos
    ? formatDateRange(
        featuredPhotos[featuredPhotos.length - 1].completedAt,
        featuredPhotos[0].completedAt
      )
    : '';

  const missionPhotos = summary?.mission.photos ?? [];

  const cameraPhotos = summary?.camera.photos ?? [];
  const cameraDateRange =
    cameraPhotos.length > 0
      ? formatDateRange(
          cameraPhotos[cameraPhotos.length - 1].createdAt,
          cameraPhotos[0].createdAt
        )
      : '';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {hasFeaturedPhotos && (
            <View className="gap-8">
              <ThemedText weight="bold" className="text-[24px] text-black">
                {FEATURED_LOCATION}
              </ThemedText>
              <ThemedText className="text-[12px] text-gray-900">{featuredDateRange}</ThemedText>
            </View>
          )}

          <FeaturedPhoto photos={featuredPhotos.map((photo) => photo.photoUrl)} />

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
              <PhotoPost photos={cameraPhotos.map((photo) => photo.photoUrl)} />
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
