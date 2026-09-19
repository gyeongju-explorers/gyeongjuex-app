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

export async function uploadGeneralPhoto(params: { photoUri: string }): Promise<{
  photoUrl: string;
}> {
  const formData = new FormData();
  // React Native의 FormData는 { uri, name, type } 형태를 파일로 취급한다.
  formData.append('photo', {
    uri: params.photoUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const { data } = await apiClient.post<{ photoUrl: string }>('/api/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
