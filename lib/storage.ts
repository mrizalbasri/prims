import path from "path";
import { promises as fs } from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// ponytail: check if Cloudflare R2 or AWS S3 credentials are provided in env
const isCloudStorageConfigured = (): boolean => {
  const bucket = process.env.R2_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  return Boolean(bucket && accessKeyId && secretAccessKey);
};

let cachedS3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (cachedS3Client) return cachedS3Client;

  const endpoint = process.env.R2_ENDPOINT || process.env.AWS_ENDPOINT_URL_S3;
  const region = process.env.AWS_REGION || "auto";

  cachedS3Client = new S3Client({
    region,
    endpoint: endpoint || undefined,
    credentials: {
      accessKeyId: (process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
      secretAccessKey: (process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
    },
  });

  return cachedS3Client;
}

export interface UploadAudioResult {
  url: string;
  provider: "cloud" | "local";
}

/**
 * Upload audio file buffer either to Cloudflare R2 / AWS S3, or fallback to local disk storage
 */
export async function uploadAudio(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadAudioResult> {
  if (isCloudStorageConfigured()) {
    try {
      const s3 = getS3Client();
      const bucket = (process.env.R2_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME)!;
      const key = `audio/${fileName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        })
      );

      const publicBaseUrl = process.env.R2_PUBLIC_URL || process.env.AWS_S3_PUBLIC_URL;
      const url = publicBaseUrl
        ? `${publicBaseUrl.replace(/\/$/, "")}/${key}`
        : `https://${bucket}.r2.cloudflarestorage.com/${key}`;

      return { url, provider: "cloud" };
    } catch (err) {
      console.warn("Cloud storage upload failed, falling back to local disk storage:", err);
    }
  }

  // Fallback to local disk storage
  const uploadDir = path.join(process.cwd(), "public", "uploads", "audio");
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);

  return {
    url: `/uploads/audio/${fileName}`,
    provider: "local",
  };
}
