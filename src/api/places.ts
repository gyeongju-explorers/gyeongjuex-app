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
  const { data } = await apiClient.get<{ places: Place[] }>('/places', { params });
  return data.places;
}
