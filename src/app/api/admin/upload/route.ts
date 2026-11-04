import { db } from "@/db";
import { media } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/request";
import { UploadError, isBucket, saveUpload } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** Admin-only upload endpoint. Validates bucket, size and real file type (magic bytes). */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  if (!(await getAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const bucket = String(form?.get("bucket") ?? "media");
  if (!(file instanceof File) || !isBucket(bucket)) return Response.json({ error: "Invalid upload" }, { status: 400 });
  try {
    const saved = await saveUpload(file, bucket);
    await db.insert(media).values({ url: saved.url, bucket, filename: saved.filename, mime: saved.mime, size: saved.size });
    return Response.json({ url: saved.url });
  } catch (e) {
    if (e instanceof UploadError) return Response.json({ error: e.message }, { status: 400 });
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
