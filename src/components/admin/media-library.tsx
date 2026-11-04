"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import { uploadFile } from "@/components/admin/fields";
import { useConfirm, useToast } from "@/components/admin/ui";
import { deleteMedia, pruneMissingMedia } from "@/lib/admin/actions";

interface Item { id: number; url: string; bucket: string; filename: string; mime: string; size: number; createdAt: string }

export function MediaLibrary({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [bucket, setBucket] = useState("media");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => setItems(initial), [initial]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      try { await uploadFile(f, bucket); toast("success", `Uploaded ${f.name}`); } catch (e) { toast("error", `${f.name}: ${e instanceof Error ? e.message : "failed"}`); }
    }
    setBusy(false);
    router.refresh();
  };
  const remove = async (m: Item) => {
    if (!(await confirm({ title: "Delete this file?", text: "If it is used on a page, that image/PDF will disappear from the site.", confirmLabel: "Delete", danger: true }))) return;
    setItems((x) => x.filter((i) => i.id !== m.id));
    await deleteMedia(m.id);
    toast("success", "File deleted");
  };
  const copy = async (url: string) => { await navigator.clipboard.writeText(`${location.origin}${url}`).catch(() => {}); toast("success", "URL copied"); };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select aria-label="Bucket" value={bucket} onChange={(e) => setBucket(e.target.value)} className="field w-auto">
          {["media", "projects", "certificates", "avatars", "resume", "blog"].map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn btn-primary">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} Upload files</button>
        <button type="button" className="btn btn-ghost" onClick={async () => { const r = await pruneMissingMedia(); toast("success", `${r.removed} missing record(s) cleaned`); router.refresh(); }}>Clean missing</button>
        <input ref={input} type="file" multiple hidden accept="image/png,image/jpeg,image/webp,image/gif,image/avif,application/pdf" onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} />
      </div>
      {items.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center text-muted">No uploads yet.</div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <li key={m.id} className="glass overflow-hidden rounded-2xl">
              {m.mime === "application/pdf"
                ? <span className="grid aspect-[4/3] place-items-center bg-primary/10 text-accent"><FileText className="h-10 w-10" /></span>
                // eslint-disable-next-line @next/next/no-img-element
                : <img src={m.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />}
              <div className="p-3">
                <p className="truncate text-xs font-semibold" title={m.filename}>{m.filename}</p>
                <p className="text-[11px] text-muted">{m.bucket} · {(m.size / 1024).toFixed(0)} KB</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="chip" onClick={() => copy(m.url)}><Copy className="h-3 w-3" /> Copy URL</button>
                  <button type="button" className="chip hover:!text-red-500" aria-label="Delete file" onClick={() => remove(m)}><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
