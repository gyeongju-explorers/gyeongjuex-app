import { NaverMapMarkerOverlay, NaverMapView } from '@mj-studio/react-native-naver-map';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import myLocationIcon from '@/assets/icons/my-location.svg';
import image1 from '@/assets/images/image1.png';
import image2 from '@/assets/images/image2.png';
import { ThemedView } from '@/components/global/themed-view';
import Marker from '@/components/Mission/Marker';
import type { MissionCardProps } from '@/components/Mission/MissionCard';
import MissionChipList from '@/components/Mission/MissionChipList';
import MissionListModal from '@/components/Mission/MissionListModal';
import MissionSlide from '@/components/Mission/MissionSlide';
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
  {
    photos: [image1, image2, image1, image1, image2, image1],
    title: '첨성대',
    description: '경주 첨성대 일대',
  },
  { photos: [image2, image1], title: '동궁과 월지', description: '경주 동궁과 월지 일대' },
];

const GYEONGJU_CENTER = { latitude: 35.8354, longitude: 129.2194 };

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
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== 'granted') return;

        return Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced }, (location) => {
          setMyLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }).then((sub) => {
          subscription = sub;
        });
      })
      .catch(() => {
        // 위치 접근 실패(권한 거부, 위치 설정 꺼짐 등) — 내 위치 마커 없이 진행.
      });

    return () => subscription?.remove();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <NaverMapView
        style={StyleSheet.absoluteFill}
        initialCamera={{ ...GYEONGJU_CENTER, zoom: 14 }}
      >
        {filteredPlaces
          .filter((place) => place.latitude !== null && place.longitude !== null)
          .map((place) =>
            place.isCompleted ? (
              <NaverMapMarkerOverlay
                key={place.id}
                latitude={place.latitude!}
                longitude={place.longitude!}
                width={91}
                height={140}
                onTap={() => setViewingPhotoPlaceId(place.id)}
              >
                <PhotoMarker photos={[place.image ? { uri: place.image } : image1]} active />
              </NaverMapMarkerOverlay>
            ) : (
              <NaverMapMarkerOverlay
                key={place.id}
                latitude={place.latitude!}
                longitude={place.longitude!}
                width={34}
                height={34}
                onTap={() =>
                  setSelectedPlaceId((current) => (current === place.id ? null : place.id))
                }
              >
                <Marker variant={selectedPlaceId === place.id ? 'selected' : 'inactive'} />
              </NaverMapMarkerOverlay>
            ),
          )}
        {myLocation && (
          <NaverMapMarkerOverlay
            latitude={myLocation.latitude}
            longitude={myLocation.longitude}
            width={32}
            height={32}
          >
            <Image source={myLocationIcon} style={{ width: 32, height: 32 }} />
          </NaverMapMarkerOverlay>
        )}
      </NaverMapView>
      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <View pointerEvents="box-none">
          <MissionChipList
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>
        <MissionSlide
          photos={[image1, image2, image1, image2, image1, image2, image1, image2]}
          onOpenListModal={() => setIsListModalOpen(true)}
        />
      </SafeAreaView>
      {selectedPlace && (
        <PlaceInfoModal place={selectedPlace} onClose={() => setSelectedPlaceId(null)} />
      )}
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
