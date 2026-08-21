import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const MAX_STORED_IMAGE_BYTES = 5 * 1024 * 1024;
const STORED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new Error("R2 image storage is not configured");
  }

  return {
    bucket,
    publicUrl: publicUrl.replace(/\/$/, ""),
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

function publicUrlForKey(base: string, key: string): string {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${base}/${encodedKey}`;
}

export async function uploadCarImage(file: Blob): Promise<string> {
  if (!STORED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Unsupported image type");
  }
  if (file.size <= 0 || file.size > MAX_STORED_IMAGE_BYTES) {
    throw new Error("Optimized image must be smaller than 5 MB");
  }

  const { bucket, publicUrl, client } = config();
  const extension = file.type === "image/webp" ? "webp" : file.type.split("/")[1];
  const key = `cars/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: new Uint8Array(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return publicUrlForKey(publicUrl, key);
}

function r2KeyFromUrl(value: string, publicUrl: string): string | null {
  try {
    const url = new URL(value);
    const base = new URL(`${publicUrl}/`);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
      return null;
    }
    return decodeURIComponent(url.pathname.slice(base.pathname.length));
  } catch {
    return null;
  }
}

export async function deleteR2Images(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!publicUrl) return;
  const keys = urls
    .map((url) => r2KeyFromUrl(url, publicUrl))
    .filter((key): key is string => Boolean(key));
  if (keys.length === 0) return;

  const { bucket, client } = config();

  await Promise.allSettled(
    keys.map((key) =>
      client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
    )
  );
}
