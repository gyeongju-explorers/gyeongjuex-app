import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Place } from '@/api/places';
import { default as image1, default as image2 } from '@/assets/images/image2.png';
import { ThemedText } from '@/components/global/themed-text';
import { ThemedView } from '@/components/global/themed-view';
import Marker from '@/components/Mission/Marker';
import type { MissionCardProps } from '@/components/Mission/MissionCard';
import MissionChipList from '@/components/Mission/MissionChipList';
import MissionListModal from '@/components/Mission/MissionListModal';
import PhotoMarker from '@/components/Mission/PhotoMarker';
import PhotoViewerOverlay from '@/components/Mission/PhotoViewerOverlay';
import PlaceInfoModal from '@/components/Mission/PlaceInfoModal';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

import { useMissionMapData } from './useMissionMapData';

const MISSIONS: MissionCardProps[] = [
  {
    photos: [image1, image2, image1, image1, image2, image1],
    title: '첨성대',
    description: '경주 첨성대 일대',
  },
  { photos: [image2, image1], title: '동궁과 월지', description: '경주 동궁과 월지 일대' },
];

// 위도/경도를 0~1 사이 값으로 정규화 — 실제 지도 없이도 마커들의 상대 위치를 대충 재현.
function normalizeCoordinates(places: Place[]) {
  const withCoords = places.filter(
    (place): place is Place & { latitude: number; longitude: number } =>
      place.latitude !== null && place.longitude !== null,
  );

  const lats = withCoords.map((place) => place.latitude);
  const lngs = withCoords.map((place) => place.longitude);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  const latSpan = maxLat - minLat || 1;
  const lngSpan = maxLng - minLng || 1;

  return withCoords.map((place) => ({
    place,
    // 위도가 클수록(북쪽) 화면 위쪽 — y는 반전.
    xPercent: ((place.longitude - minLng) / lngSpan) * 70 + 15,
    yPercent: 70 - ((place.latitude - minLat) / latSpan) * 55,
  }));
}

export default function MissionMap() {
  const {
    filteredPlaces,
    selectedCategory,
    setSelectedCategory,
    selectedPlaceId,
    setSelectedPlaceId,
    selectedPlace,
    setViewingPhotoPlaceId,
    viewingPhotoPlace,
    isListModalOpen,
    setIsListModalOpen,
  } = useMissionMapData();

  const markers = useMemo(() => normalizeCoordinates(filteredPlaces), [filteredPlaces]);

  return (
    <ThemedView style={styles.container}>
      <View style={StyleSheet.absoluteFill} className="bg-gray-100">
        {markers.map(({ place, xPercent, yPercent }) => (
          <Pressable
            key={place.id}
            style={{ position: 'absolute', left: `${xPercent}%`, top: `${yPercent}%` }}
            onPress={() =>
              place.isCompleted
                ? setViewingPhotoPlaceId(place.id)
                : setSelectedPlaceId((current) => (current === place.id ? null : place.id))
            }
          >
            {place.isCompleted ? (
              <PhotoMarker photos={[place.image ? { uri: place.image } : image1, image2]} active />
            ) : (
              <Marker variant={selectedPlaceId === place.id ? 'selected' : 'inactive'} />
            )}
          </Pressable>
        ))}
      </View>
      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <View pointerEvents="box-none">
          <MissionChipList
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>
        <ThemedText className="text-gray-400 text-xs px-4">
          웹 미리보기: 지도 타일 없이 마커 위치만 대략 재현했어요.
        </ThemedText>
      </SafeAreaView>
      {selectedPlace && <PlaceInfoModal place={selectedPlace} />}
      {viewingPhotoPlace && (
        <PhotoViewerOverlay
          // TODO: photo 테이블에서 실제 여러 장을 받아오도록 교체 — 지금은 폴백 장소(-1)에 테스트용 2장만 하드코딩.
          photos={
            viewingPhotoPlace.id === -1
              ? [image1, image2]
              : [viewingPhotoPlace.image ? { uri: viewingPhotoPlace.image } : image1]
          }
          onClose={() => setViewingPhotoPlaceId(null)}
        />
      )}
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
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
});
