import { Asset } from 'expo-asset';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Place } from '@/api/places';
import markerInactiveIcon from '@/assets/icons/marker-inactive.svg';
import markerSelectedIcon from '@/assets/icons/marker-selected.svg';
import { default as image1, default as image2 } from '@/assets/images/image2.png';
import { ThemedView } from '@/components/global/themed-view';
import MissionChipList from '@/components/Mission/MissionChipList';
import MissionListModal from '@/components/Mission/MissionListModal';
import MissionSlide from '@/components/Mission/MissionSlide';
import PhotoViewerOverlay from '@/components/Mission/PhotoViewerOverlay';
import PlaceInfoModal from '@/components/Mission/PlaceInfoModal';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

import { useMissionMapData } from './useMissionMapData';

declare global {
  interface Window {
    naver: any;
  }
}

const GYEONGJU_CENTER = { latitude: 35.8354, longitude: 129.2194 };
const NAVER_MAPS_SCRIPT_ID = 'naver-maps-web-sdk';

// 스크립트 태그는 앱 생명주기 동안 한 번만 주입 — 화면을 여러 번 드나들어도 재삽입하지 않는다.
let scriptLoadPromise: Promise<void> | null = null;
function loadNaverMapsScript(clientId: string): Promise<void> {
  if (window.naver?.maps) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(NAVER_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.id = NAVER_MAPS_SCRIPT_ID;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

// 완료한 장소는 대표 사진을, 미완료 장소는 기존 마커 아이콘을 그대로 재사용해 HTML 오버레이로 그린다.
function buildMarkerIcon(place: Place, isSelected: boolean) {
  if (place.isCompleted) {
    const photoUrl = place.image ?? Asset.fromModule(image1).uri;
    return {
      content: `<div style="width:56px;height:74px;border-radius:14px;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.25);background:#ddd center/cover no-repeat url('${photoUrl}')"></div>`,
      size: new window.naver.maps.Size(56, 74),
      anchor: new window.naver.maps.Point(28, 74),
    };
  }

  const iconSource = isSelected ? markerSelectedIcon : markerInactiveIcon;
  const size = isSelected ? 30 : 25;
  return {
    url: Asset.fromModule(iconSource).uri,
    size: new window.naver.maps.Size(size, size),
    scaledSize: new window.naver.maps.Size(size, size),
    anchor: new window.naver.maps.Point(size / 2, size / 2),
  };
}

export default function MissionMap() {
  const {
    filteredPlaces,
    selectablePlaces,
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

  const mapContainerRef = useRef<View>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const slidePhotos = useMemo(
    () => selectablePlaces.map((place) => (place.image ? { uri: place.image } : image1)),
    [selectablePlaces],
  );
  // 지도 스크립트/인스턴스 준비가 비동기라, 마커를 그리는 effect가 이 값을 의존성으로 잡아야
  // "지도가 이제 막 준비됨" 시점에 다시 실행된다. mapRef.current만 보면 effect가 재실행될
  // 계기가 없어 마커가 영원히 그려지지 않는다.
  const [isMapReady, setIsMapReady] = useState(false);

  // 지도 인스턴스는 한 번만 생성.
  useEffect(() => {
    const clientId = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;
    if (!clientId) {
      console.warn(
        'EXPO_PUBLIC_NAVER_MAP_CLIENT_ID가 설정되어 있지 않습니다. ' +
          'NCP 콘솔의 Maps 애플리케이션에 이 화면을 띄우는 도메인이 Web 서비스 URL로 등록되어 있는지 확인하세요.',
      );
      return;
    }

    let cancelled = false;

    loadNaverMapsScript(clientId).then(() => {
      if (cancelled) return;
      const node = mapContainerRef.current as unknown as HTMLDivElement;
      if (!node) return;

      mapRef.current = new window.naver.maps.Map(node, {
        center: new window.naver.maps.LatLng(GYEONGJU_CENTER.latitude, GYEONGJU_CENTER.longitude),
        zoom: 14,
      });
      setIsMapReady(true);

      // RN Web의 flex 레이아웃이 안정되기 전에 지도가 만들어지면 컨테이너 크기를 0으로 잘못
      // 잡아서 타일이 뷰포트 밖으로 어긋난다. 다음 프레임에 사이즈를 다시 계산시켜 바로잡는다.
      requestAnimationFrame(() => {
        mapRef.current?.refresh(true);
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // 장소 목록/선택 상태가 바뀌거나 지도가 막 준비됐을 때 마커를 다시 그린다.
  useEffect(() => {
    if (!isMapReady || !mapRef.current || !window.naver?.maps) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = filteredPlaces
      .filter((place) => place.latitude !== null && place.longitude !== null)
      .map((place) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(place.latitude!, place.longitude!),
          map: mapRef.current,
          icon: buildMarkerIcon(place, selectedPlaceId === place.id),
        });

        window.naver.maps.Event.addListener(marker, 'click', () => {
          if (place.isCompleted) {
            setViewingPhotoPlaceId(place.id);
          } else {
            setSelectedPlaceId((current) => (current === place.id ? null : place.id));
          }
        });

        return marker;
      });
  }, [isMapReady, filteredPlaces, selectedPlaceId, setSelectedPlaceId, setViewingPhotoPlaceId]);

  return (
    <ThemedView style={styles.container}>
      {/* 네이버 지도 SDK가 넘겨받은 div의 position/overflow를 직접 덮어쓰기 때문에, absoluteFill로 크기를
          잡는 바깥 View와 지도가 실제로 붙는 안쪽 View를 분리한다 — 안쪽은 %기반 크기라 SDK가 position을
          바꿔도 크기가 무너지지 않는다. */}
      <View style={StyleSheet.absoluteFill}>
        <View ref={mapContainerRef} style={styles.mapSurface} />
      </View>
      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <View pointerEvents="box-none">
          <MissionChipList
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>
        {slidePhotos.length > 0 && (
          <MissionSlide
            key={selectablePlaces.map((place) => place.id).join(',')}
            photos={slidePhotos}
            onOpenListModal={() => setIsListModalOpen(true)}
          />
        )}
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
        missions={selectablePlaces}
        selectedCategory={selectedCategory}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapSurface: {
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
});
