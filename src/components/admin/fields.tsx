"use client";

import { useRef, useState } from "react";
import { FileText, GripVertical, ImagePlus, Loader2, Trash2, UploadCloud, X } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { useToast } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/** Uploads one file to the admin-only endpoint and returns its public URL. */
export async function uploadFile(file: File, bucket: string): Promise<string> {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("bucket", bucket);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Upload failed");
  return json.url as string;
}

const isPdf = (u: string) => /\.pdf$/i.test(u);

function Preview({ url, className }: { url: string; className?: string }) {
  return isPdf(url) ? (
    <span className={cn("grid place-items-center bg-primary/10 text-accent", className)}><FileText className="h-8 w-8" /></span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className={cn("object-cover", className)} />
  );
}

/** Drag-and-drop / click upload for a single image or file. */
export function FileField({ value, onChange, bucket, accept }: { value: string; onChange: (v: string) => void; bucket: string; accept: string }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const send = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try { onChange(await uploadFile(file, bucket)); } catch (e) { toast("error", e instanceof Error ? e.message : "Upload failed"); }
    setBusy(false);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); void send(e.dataTransfer.files[0]); }}
      className={cn("flex items-center gap-4 rounded-2xl border-2 border-dashed p-3 transition", over ? "border-accent bg-primary/10" : "border-line")}
    >
      {value ? <Preview url={value} className="h-20 w-20 shrink-0 rounded-xl" /> : <span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-primary/10 text-muted"><UploadCloud className="h-7 w-7" /></span>}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-muted">{value ? value.split("/").pop() : "Drop a file here or browse"}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost !px-4 !py-2 !text-sm" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} {value ? "Replace" : "Upload"}
          </button>
          {value && <button type="button" className="btn btn-ghost !px-4 !py-2 !text-sm" onClick={() => onChange("")}><Trash2 className="h-4 w-4" /> Remove</button>}
        </div>
        <input ref={input} type="file" accept={accept} hidden onChange={(e) => { void send(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
    </div>
  );
}

/** Multiple images with drag-and-drop re-ordering. */
export function ImagesField({ value, onChange, bucket }: { value: string[]; onChange: (v: string[]) => void; bucket: string }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const drag = useRef<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const add = async (files: FileList | File[]) => {
    setBusy(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      try { urls.push(await uploadFile(f, bucket)); } catch (e) { toast("error", `${f.name}: ${e instanceof Error ? e.message : "failed"}`); }
    }
    onChange([...value, ...urls]);
    setBusy(false);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  };

  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); void add(e.dataTransfer.files); } }}>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((u, i) => (
          <li key={u + i} draggable onDragStart={() => (drag.current = i)} onDrop={(e) => { e.stopPropagation(); if (drag.current !== null) move(drag.current, i); drag.current = null; }}
            className="group relative cursor-grab overflow-hidden rounded-xl border border-line">
            <Preview url={u} className="aspect-[4/3] w-full" />
            <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 text-xs text-white"><GripVertical className="inline h-3 w-3" /> {i + 1}</span>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
              <span className="flex gap-1">
                <button type="button" aria-label="Move earlier" className="px-1.5" onClick={() => move(i, i - 1)}>←</button>
                <button type="button" aria-label="Move later" className="px-1.5" onClick={() => move(i, i + 1)}>→</button>
              </span>
              <button type="button" aria-label="Remove image" className="px-1.5" onClick={() => onChange(value.filter((_, k) => k !== i))}><X className="h-4 w-4" /></button>
            </div>
          </li>
        ))}
        <li>
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="grid aspect-[4/3] w-full place-items-center rounded-xl border-2 border-dashed border-line text-muted transition hover:border-accent hover:text-accent">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <span className="flex flex-col items-center gap-1 text-xs"><ImagePlus className="h-6 w-6" />Add images</span>}
          </button>
        </li>
      </ul>
      <input ref={input} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,image/avif" hidden onChange={(e) => { if (e.target.files) void add(e.target.files); e.target.value = ""; }} />
    </div>
  );
}

/** Type + Enter to add chips. */
export function TagsField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...new Set([...value, ...parts])]);
    setDraft("");
  };
  return (
    <div className="field flex flex-wrap items-center gap-2 !py-2">
      {value.map((t) => (
        <span key={t} className="chip chip-active">{t}<button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}><X className="h-3 w-3" /></button></span>
      ))}
      <input value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1)); }}
        placeholder="Type and press Enter" className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm outline-none" />
    </div>
  );
}

/** Markdown editor with live preview (side-by-side on desktop, tabs on mobile) and inline image upload. */
export function MarkdownField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const toast = useToast();
  const [tab, setTab] = useState<"write" | "preview">("write");
  const area = useRef<HTMLTextAreaElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const insertImage = async (file?: File) => {
    if (!file) return;
    try {
      const url = await uploadFile(file, "blog");
      const pos = area.current?.selectionStart ?? value.length;
      onChange(`${value.slice(0, pos)}\n![${file.name}](${url})\n${value.slice(pos)}`);
    } catch (e) { toast("error", e instanceof Error ? e.message : "Upload failed"); }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex gap-1 md:hidden">
          {(["write", "preview"] as const).map((t) => <button key={t} type="button" onClick={() => setTab(t)} className={cn("chip capitalize", tab === t && "chip-active")}>{t}</button>)}
        </div>
        <span className="hidden text-xs text-muted md:block">Markdown · GFM tables, task lists and code blocks supported</span>
        <button type="button" className="chip" onClick={() => input.current?.click()}><ImagePlus className="h-3.5 w-3.5" /> Insert image</button>
        <input ref={input} type="file" hidden accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => { void insertImage(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <textarea ref={area} value={value} onChange={(e) => onChange(e.target.value)} rows={18} spellCheck
          className={cn("field min-h-[24rem] resize-y font-mono text-sm", tab === "preview" && "hidden md:block")} aria-label="Markdown source" />
        <div className={cn("field max-h-[36rem] min-h-[24rem] overflow-auto", tab === "write" && "hidden md:block")} aria-label="Live preview">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-muted">Live preview appears here.</p>}
        </div>
      </div>
    </div>
  );
}
