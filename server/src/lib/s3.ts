import { randomUUID } from 'crypto';

import { DeleteObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;
// 버킷이 퍼블릭 read를 CloudFront/커스텀 도메인으로 제공하는 경우를 위한 선택 값.
// 없으면 버킷의 기본 S3 URL을 사용.
const publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;

const s3Client = new S3Client({ region });

async function uploadPhoto(key: string, buffer: Buffer, contentType: string): Promise<string> {
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET 환경변수가 설정되지 않았습니다.');
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return publicBaseUrl
    ? `${publicBaseUrl.replace(/\/$/, '')}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function extensionFor(contentType: string) {
  return contentType === 'image/png' ? 'png' : 'jpg';
}

export async function uploadMissionPhoto(params: {
  userId: number;
  placeId: number;
  buffer: Buffer;
  contentType: string;
}): Promise<string> {
  const key = `missions/${params.userId}/${params.placeId}/${Date.now()}-${randomUUID()}.${extensionFor(params.contentType)}`;
  return uploadPhoto(key, params.buffer, params.contentType);
}

// 미션(장소)에 묶이지 않는 일반 카메라 사진.
export async function uploadGeneralPhoto(params: {
  userId: number;
  buffer: Buffer;
  contentType: string;
}): Promise<string> {
  const key = `general/${params.userId}/${Date.now()}-${randomUUID()}.${extensionFor(params.contentType)}`;
  return uploadPhoto(key, params.buffer, params.contentType);
  function keyFromPhotoUrl(url: string): string | null {
    const prefix = publicBaseUrl
      ? `${publicBaseUrl.replace(/\/$/, '')}/`
      : `https://${bucket}.s3.${region}.amazonaws.com/`;

    return url.startsWith(prefix) ? url.slice(prefix.length) : null;
  }
}

function keyFromPhotoUrl(url: string): string | null {
  const prefix = publicBaseUrl
    ? `${publicBaseUrl.replace(/\/$/, '')}/`
    : `https://${bucket}.s3.${region}.amazonaws.com/`;

  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

// 탈퇴 등으로 사진 행을 지울 때, 실제 S3 오브젝트도 같이 정리하기 위한 배치 삭제.
export async function deletePhotosByUrl(urls: string[]): Promise<void> {
  if (!bucket || urls.length === 0) return;

  const keys = urls.map(keyFromPhotoUrl).filter((key): key is string => key !== null);

  for (let i = 0; i < keys.length; i += 1000) {
    const chunk = keys.slice(i, i + 1000);
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: chunk.map((Key) => ({ Key })) },
      }),
    );
  }
}
