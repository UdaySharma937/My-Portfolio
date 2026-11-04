import "server-only";
import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { storedFiles } from "@/db/schema";

/**
 * File storage in Postgres (bytea). Every upload is validated by size AND magic bytes
 * (the browser-reported MIME type is never trusted). To move to S3/R2/Supabase
 * Storage later, only this file and /api/files need to change.
 */
export const BUCKETS = {
  projects: { kinds: ["image"], maxMB: 6 },
  certificates: { kinds: ["image", "pdf"], maxMB: 10 },
  avatars: { kinds: ["image"], maxMB: 4 },
  resume: { kinds: ["pdf"], maxMB: 10 },
  blog: { kinds: ["image"], maxMB: 6 },
  media: { kinds: ["image", "pdf"], maxMB: 10 },
} as const;
export type Bucket = keyof typeof BUCKETS;

export function isBucket(v: string): v is Bucket {
  return Object.prototype.hasOwnProperty.call(BUCKETS, v);
}

export const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif", ico: "image/x-icon", pdf: "application/pdf",
};

/** Detects the real file type from its first bytes. */
export function sniff(buf: Buffer): { ext: string; kind: "image" | "pdf" } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", kind: "image" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", kind: "image" };
  if (buf.subarray(0, 4).toString("ascii") === "GIF8") return { ext: "gif", kind: "image" };
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return { ext: "webp", kind: "image" };
  if (buf.subarray(4, 12).toString("ascii") === "ftypavif") return { ext: "avif", kind: "image" };
  if (buf.subarray(0, 5).toString("ascii") === "%PDF-") return { ext: "pdf", kind: "pdf" };
  if (buf[0] === 0 && buf[1] === 0 && buf[2] === 1 && buf[3] === 0) return { ext: "ico", kind: "image" };
  return null;
}

export class UploadError extends Error {}

export async function saveUpload(file: File, bucket: Bucket) {
  const rule = BUCKETS[bucket];
  if (file.size === 0) throw new UploadError("The file is empty.");
  if (file.size > rule.maxMB * 1024 * 1024) throw new UploadError(`File too large (max ${rule.maxMB} MB for ${bucket}).`);
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniff(buf);
  const allowed = rule.kinds as readonly string[];
  if (!type || !allowed.includes(type.kind)) throw new UploadError(`Unsupported file type. Allowed: ${allowed.join(", ")}.`);
  const filename = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.${type.ext}`;
  await db.insert(storedFiles).values({ bucket, filename, mime: MIME_BY_EXT[type.ext], data: buf });
  return { url: `/api/files/${bucket}/${filename}`, bucket, filename, mime: MIME_BY_EXT[type.ext], size: file.size };
}

export async function deleteUpload(bucket: string, filename: string): Promise<void> {
  if (!isBucket(bucket) || !/^[\w.-]+$/.test(filename)) return;
  await db.delete(storedFiles).where(and(eq(storedFiles.bucket, bucket), eq(storedFiles.filename, filename)));
}
