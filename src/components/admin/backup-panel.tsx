"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Upload } from "lucide-react";
import { useConfirm, useToast } from "@/components/admin/ui";

export function BackupPanel() {
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const restore = async (file?: File) => {
    if (!file) return;
    const ok = await confirm({ title: "Replace all content?", text: "Importing overwrites every content table (projects, certificates, skills, settings…). Messages and analytics are kept. Export a backup first if unsure.", confirmLabel: "Import & replace", danger: true });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/backup", { method: "POST", headers: { "Content-Type": "application/json" }, body: await file.text() });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Import failed");
      toast("success", `Imported ${json.rows} rows`);
      router.refresh();
    } catch (e) { toast("error", e instanceof Error ? e.message : "Import failed"); }
    setBusy(false);
  };

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <section className="glass rounded-3xl p-6">
        <h2 className="text-xl font-bold">Export</h2>
        <p className="mt-2 text-sm text-muted">Creates a JSON snapshot of all site content.</p>
        <a href="/api/admin/backup" className="btn btn-primary mt-5"><Download className="h-4 w-4" /> Download backup</a>
      </section>
      <section className="glass rounded-3xl p-6">
        <h2 className="text-xl font-bold">Import</h2>
        <p className="mt-2 text-sm text-muted">Restore from a file previously exported here.</p>
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn btn-ghost mt-5">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Choose backup file</button>
        <input ref={input} type="file" accept="application/json,.json" hidden onChange={(e) => { void restore(e.target.files?.[0]); e.target.value = ""; }} />
      </section>
    </div>
  );
}
