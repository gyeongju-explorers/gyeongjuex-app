import { apiClient } from '@/api/client';

export type GradeTier = { threshold: number; title: string };

export type GradeProgress = {
  completedCount: number;
  currentTier: GradeTier | null;
  nextTier: GradeTier | null;
  missionsToNext: number | null;
  tiers: (GradeTier & { earned: boolean })[];
};

export type CompleteMissionResult = GradeProgress & {
  placeName: string;
  photoUrl: string;
};

export async function completeMission(params: {
  placeId: number;
  latitude: number;
  longitude: number;
  photoUri: string;
}): Promise<CompleteMissionResult> {
  const formData = new FormData();
  formData.append('placeId', String(params.placeId));
  formData.append('latitude', String(params.latitude));
  formData.append('longitude', String(params.longitude));
  // React Native의 FormData는 { uri, name, type } 형태를 파일로 취급한다.
  formData.append('photo', {
    uri: params.photoUri,
    name: 'mission-photo.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const { data } = await apiClient.post<CompleteMissionResult>('/missions/complete', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getGradeProgress(): Promise<GradeProgress> {
  const { data } = await apiClient.get<GradeProgress>('/missions/grade');
  return data;
}
