import { randomUUID } from 'crypto';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;
// 버킷이 퍼블릭 read를 CloudFront/커스텀 도메인으로 제공하는 경우를 위한 선택 값.
// 없으면 버킷의 기본 S3 URL을 사용.
const publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;

const s3Client = new S3Client({ region });

export async function uploadMissionPhoto(params: {
  userId: number;
  placeId: number;
  buffer: Buffer;
  contentType: string;
}): Promise<string> {
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET 환경변수가 설정되지 않았습니다.');
  }

  const extension = params.contentType === 'image/png' ? 'png' : 'jpg';
  const key = `missions/${params.userId}/${params.placeId}/${Date.now()}-${randomUUID()}.${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: params.buffer,
      ContentType: params.contentType,
    }),
  );

  return publicBaseUrl
    ? `${publicBaseUrl.replace(/\/$/, '')}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
