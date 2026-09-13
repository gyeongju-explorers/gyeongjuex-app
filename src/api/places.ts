import { apiClient } from '@/api/client';

export type PlaceCategory = 'HISTORY_CULTURE' | 'WORLD_HERITAGE' | 'NATURE_HEALING';

export type Place = {
  id: number;
  name: string;
  address: string;
  image: string | null;
  category: PlaceCategory | null;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
  isCompleted: boolean;
};

export async function getPlaces(params?: { lat?: number; lng?: number }): Promise<Place[]> {
  const { data } = await apiClient.get<{ places: Place[] }>('/api/places', { params });
  return data.places;
}

export async function getNearbyPlaces(params: {
  lat: number;
  lng: number;
  limit?: number;
}): Promise<Place[]> {
  const { data } = await apiClient.get<{ places: Place[] }>('/api/places/nearby', { params });
  return data.places;
}

// 미션을 완료한 장소만, lat/lng을 주면 가까운 순으로 반환 (일반 사진 촬영 시 사진첩 배정용).
export async function getCompletedPlaces(params?: { lat?: number; lng?: number }): Promise<Place[]> {
  const { data } = await apiClient.get<{ places: Place[] }>('/api/places/completed', { params });
  return data.places;
}
