import { apiClient } from '@/api/client';

export type RecordSummary = {
  featured: {
    photos: { photoUrl: string; completedAt: string }[];
  };
  mission: {
    photos: string[];
  };
  camera: {
    photos: { photoUrl: string; createdAt: string }[];
  };
};

export async function getRecordSummary() {
  const { data } = await apiClient.get<RecordSummary>('/api/record');
  return data;
}
