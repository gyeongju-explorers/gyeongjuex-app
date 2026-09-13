import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecordSummary, type RecordSummary } from '@/api/record';
import recordEmptyImage from '@/assets/images/record-empty.svg';
import MissionButton from '@/components/Mission/MissionButton';
import FeaturedPhoto from '@/components/Record/FeaturedPhoto';
import PhotoDetailOverlay from '@/components/Record/PhotoDetailOverlay';
import PhotoPost from '@/components/Record/PhotoPost';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type PhotoGroup = 'mission' | 'camera';

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
  const [viewingGroup, setViewingGroup] = useState<PhotoGroup | null>(null);
  const [viewingIndex, setViewingIndex] = useState(0);

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

  const hasRecords = hasFeaturedPhotos || missionPhotos.length > 0 || cameraPhotos.length > 0;

  if (!hasRecords) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View className="flex-1 items-center px-24">
            <Image
              source={recordEmptyImage}
              contentFit="contain"
              style={{ width: 229, height: 179, marginTop: 125, marginBottom: 50 }}
            />
            <View className="items-center gap-20 mb-44">
              <ThemedText weight="bold" className="text-xl text-black">
                미션 기록이 없어요
              </ThemedText>
              <ThemedText className="text-gray-500">미션을 해결하고 기록을 남겨보세요!</ThemedText>
            </View>
            <MissionButton text="미션 하러가기" href="/mission/map" className="self-center" />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

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
              <PhotoPost
                photos={missionPhotos}
                onPressPhoto={(index) => {
                  setViewingGroup('mission');
                  setViewingIndex(index);
                }}
              />
            </View>
          )}

          {cameraPhotos.length > 0 && (
            <View className="mt-16 gap-16">
              <SectionTitle>최근 찍은 사진 모아보기</SectionTitle>
              <ThemedText className="text-[12px] text-gray-900">{cameraDateRange}</ThemedText>
              <PhotoPost
                photos={cameraPhotos.map((photo) => photo.photoUrl)}
                onPressPhoto={(index) => {
                  setViewingGroup('camera');
                  setViewingIndex(index);
                }}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {viewingGroup === 'mission' && (
        <PhotoDetailOverlay
          photos={missionPhotos}
          initialIndex={viewingIndex}
          onClose={() => setViewingGroup(null)}
        />
      )}
      {viewingGroup === 'camera' && (
        <PhotoDetailOverlay
          photos={cameraPhotos.map((photo) => photo.photoUrl)}
          initialIndex={viewingIndex}
          onClose={() => setViewingGroup(null)}
          header={
            <View className="mb-16 w-full gap-8 px-24">
              <ThemedText weight="bold" className="text-[24px] text-white">
                {FEATURED_LOCATION}
              </ThemedText>
              <ThemedText className="text-[12px] text-gray-100">{cameraDateRange}</ThemedText>
            </View>
          }
        />
      )}
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
