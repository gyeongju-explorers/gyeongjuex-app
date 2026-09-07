import { useEffect, useMemo, useState } from 'react';

import { getPlaces, type Place, type PlaceCategory } from '@/api/places';

// 로그인/토큰 연동 전 임시 폴백 — 실제 로그인 붙으면 getPlaces() 결과만 쓰도록 제거.
export const FALLBACK_PLACES: Place[] = [
  {
    id: -1,
    name: '첨성대',
    address: '경주 첨성대 일대',
    image: null,
    category: 'HISTORY_CULTURE',
    latitude: 35.8354,
    longitude: 129.2194,
    distance: null,
    isCompleted: true,
  },
  {
    id: -2,
    name: '동궁과 월지',
    address: '경주 동궁과 월지 일대',
    image: null,
    category: 'WORLD_HERITAGE',
    latitude: 35.8347,
    longitude: 129.2249,
    distance: null,
    isCompleted: false,
  },
  {
    id: -3,
    name: '대릉원',
    address: '경주 대릉원 일대',
    image: null,
    category: 'NATURE_HEALING',
    latitude: 35.8367,
    longitude: 129.2119,
    distance: null,
    isCompleted: false,
  },
];

export function useMissionMapData() {
  const [places, setPlaces] = useState<Place[]>(FALLBACK_PLACES);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
  // 회색(미완료) 마커 탭 — 상단 정보 모달 + 해당 마커 selected 표시.
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  // 포토마커(완료) 탭 — 사진 확대 뷰어.
  const [viewingPhotoPlaceId, setViewingPhotoPlaceId] = useState<number | null>(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  useEffect(() => {
    getPlaces()
      .then((fetched) => {
        if (fetched.length > 0) setPlaces(fetched);
      })
      .catch(() => {
        // 로그인 연동 전이라 인증 실패가 예상되는 상태 — 폴백 목록 유지.
      });
  }, []);

  const filteredPlaces = useMemo(
    () =>
      selectedCategory === null
        ? places
        : places.filter((place) => place.category === selectedCategory),
    [places, selectedCategory],
  );

  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selectedPlaceId) ?? null,
    [places, selectedPlaceId],
  );

  const viewingPhotoPlace = useMemo(
    () => places.find((place) => place.id === viewingPhotoPlaceId) ?? null,
    [places, viewingPhotoPlaceId],
  );

  return {
    places,
    filteredPlaces,
    selectedCategory,
    setSelectedCategory,
    selectedPlaceId,
    setSelectedPlaceId,
    selectedPlace,
    viewingPhotoPlaceId,
    setViewingPhotoPlaceId,
    viewingPhotoPlace,
    isListModalOpen,
    setIsListModalOpen,
  };
}
