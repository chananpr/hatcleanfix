import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const {
  SPACES_ENDPOINT,
  SPACES_BUCKET,
  SPACES_REGION = 'nyc3',
  SPACES_KEY,
  SPACES_SECRET,
  SPACES_BASE_URL
} = process.env;

export const s3 = new S3Client({
  region: SPACES_REGION,
  endpoint: SPACES_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: SPACES_KEY || '',
    secretAccessKey: SPACES_SECRET || ''
  }
});

export function makeObjectKey(originalName = '') {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : '';
  const random = crypto.randomUUID();
  return ext ? `${random}.${ext}` : random;
}

export async function uploadBufferToSpaces(buffer, mimeType, originalName) {
  const Key = makeObjectKey(originalName);
  await s3.send(
    new PutObjectCommand({
      Bucket: SPACES_BUCKET,
      Key,
      Body: buffer,
      ACL: 'public-read',
      ContentType: mimeType
    })
  );
  const urlBase = SPACES_BASE_URL || SPACES_ENDPOINT?.replace('https://', `https://${SPACES_BUCKET}.`);
  const url = urlBase ? `${urlBase}/${Key}` : `https://${SPACES_BUCKET}.${SPACES_REGION}.digitaloceanspaces.com/${Key}`;
  return { key: Key, url };
}
