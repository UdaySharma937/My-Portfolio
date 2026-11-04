"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, FileText, GripVertical, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import { ResourceForm, type RelationOptions, type Row } from "@/components/admin/resource-form";
import { Switch, useConfirm, useToast } from "@/components/admin/ui";
import { deleteRecord, reorderRecords, toggleField } from "@/lib/admin/actions";
import type { ResourceDef } from "@/lib/admin/definitions";
import { cn, formatDate } from "@/lib/utils";

const isMediaCol = (n: string) => /(image|photo|file)/i.test(n);

function Cell({ def, name, value, relationOptions }: { def: ResourceDef; name: string; value: unknown; relationOptions: RelationOptions }) {
  if (value == null || value === "") return <span className="text-muted">—</span>;
  if (isMediaCol(name) && typeof value === "string") {
    return /\.pdf$/i.test(value)
      ? <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-accent"><FileText className="h-5 w-5" /></span>
      // eslint-disable-next-line @next/next/no-img-element
      : <img src={value} alt="" className="h-12 w-16 rounded-lg object-cover" />;
  }
  if (Array.isArray(value)) return <span className="flex flex-wrap gap-1">{value.slice(0, 4).map((x) => <span key={String(x)} className="chip !py-0.5">{String(x)}</span>)}</span>;
  const f = def.fields.find((x) => x.name === name);
  if (f?.type === "relation") return <>{relationOptions[f.relation!]?.find((o) => o.value === String(value))?.label ?? String(value)}</>;
  if (f?.type === "date" || f?.type === "datetime" || value instanceof Date) return <>{formatDate(value as string | Date, "en", true)}</>;
  const s = String(value);
  return <span className="line-clamp-2">{s.length > 90 ? `${s.slice(0, 90)}…` : s}</span>;
}

export function ResourceManager({ def, rows: initialRows, relationOptions }: { def: ResourceDef; rows: Row[]; relationOptions: RelationOptions }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState(initialRows);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [query, setQuery] = useState("");
  const dragFrom = useRef<number | null>(null);

  useEffect(() => setRows(initialRows), [initialRows]);
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setEditing(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [editing]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => String(r[def.titleField] ?? "").toLowerCase().includes(q)) : rows;
  }, [rows, query, def.titleField]);

  const persistOrder = async (next: Row[]) => {
    const prev = rows;
    setRows(next); // optimistic
    const res = await reorderRecords(def.key, next.map((r) => r.id as number));
    if (!res.ok) { setRows(prev); toast("error", "Could not save the new order"); } else toast("success", "Order saved");
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length || from === to) return;
    const next = [...rows];
    next.splice(to, 0, next.splice(from, 1)[0]);
    void persistOrder(next);
  };
  const toggle = async (r: Row, field: string, value: boolean) => {
    const prev = rows;
    setRows(rows.map((x) => (x.id === r.id ? { ...x, [field]: value } : x))); // optimistic
    const res = await toggleField(def.key, r.id as number, field, value);
    if (!res.ok) { setRows(prev); toast("error", "Update failed"); }
  };
  const remove = async (r: Row) => {
    const ok = await confirm({ title: `Delete this ${def.singular.toLowerCase()}?`, text: `“${String(r[def.titleField] ?? "")}” will be permanently removed.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    const prev = rows;
    setRows(rows.filter((x) => x.id !== r.id));
    const res = await deleteRecord(def.key, r.id as number);
    if (!res.ok) { setRows(prev); toast("error", res.error ?? "Delete failed"); } else toast("success", "Deleted");
  };

  const [primaryCol, ...otherCols] = def.columns.filter((c) => !isMediaCol(c));
  const mediaCol = def.columns.find(isMediaCol);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${def.title.toLowerCase()}…`} aria-label="Search" className="field !pl-10" />
        </div>
        {!def.noCreate && <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New {def.singular.toLowerCase()}</button>}
      </div>

      {visible.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center text-muted">
          {rows.length === 0 ? <>No {def.title.toLowerCase()} yet. {!def.noCreate && "Click “New” to add the first one."}</> : "Nothing matches your search."}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => {
            const index = rows.findIndex((x) => x.id === r.id);
            const reorderable = !!def.sortable && !query;
            return (
              <li key={String(r.id)} draggable={reorderable}
                onDragStart={() => (dragFrom.current = index)} onDragOver={(e) => reorderable && e.preventDefault()}
                onDrop={() => { if (dragFrom.current !== null) move(dragFrom.current, index); dragFrom.current = null; }}
                className="glass flex flex-wrap items-center gap-3 rounded-2xl p-3 sm:flex-nowrap sm:p-4">
                {reorderable && (
                  <div className="flex shrink-0 items-center gap-0.5 text-muted">
                    <GripVertical className="hidden h-5 w-5 cursor-grab sm:block" aria-hidden />
                    <span className="flex flex-col"><button type="button" aria-label="Move up" className="hover:text-accent" onClick={() => move(index, index - 1)}><ArrowUp className="h-4 w-4" /></button><button type="button" aria-label="Move down" className="hover:text-accent" onClick={() => move(index, index + 1)}><ArrowDown className="h-4 w-4" /></button></span>
                  </div>
                )}
                {mediaCol && <div className="shrink-0"><Cell def={def} name={mediaCol} value={r[mediaCol]} relationOptions={relationOptions} /></div>}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{primaryCol ? <Cell def={def} name={primaryCol} value={r[primaryCol]} relationOptions={relationOptions} /> : String(r.id)}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    {otherCols.map((c) => <span key={c} className="min-w-0"><Cell def={def} name={c} value={r[c]} relationOptions={relationOptions} /></span>)}
                  </div>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-3">
                  {def.featuredField && (
                    <button type="button" aria-label="Toggle featured" aria-pressed={!!r[def.featuredField]} title="Featured" onClick={() => toggle(r, def.featuredField!, !r[def.featuredField!])}
                      className={cn("grid h-9 w-9 place-items-center rounded-full transition", r[def.featuredField] ? "text-secondary" : "text-muted hover:text-accent")}>
                      <Star className={cn("h-5 w-5", r[def.featuredField] ? "fill-current" : "")} />
                    </button>
                  )}
                  {def.publishField && <Switch checked={!!r[def.publishField]} onChange={(v) => toggle(r, def.publishField!, v)} label={def.publishField === "isVisible" ? "Visible on site" : "Published"} />}
                  <button type="button" className="btn btn-ghost !px-3 !py-2" onClick={() => setEditing(r)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  {!def.noDelete && <button type="button" className="btn btn-ghost !px-3 !py-2 hover:!text-red-500" onClick={() => remove(r)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div className="fixed inset-0 z-[100] flex justify-end bg-black/55 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)}>
            <motion.div role="dialog" aria-modal="true" aria-label={editing === "new" ? `New ${def.singular}` : `Edit ${def.singular}`} onClick={(e) => e.stopPropagation()}
              className="glass-solid flex h-full w-full max-w-3xl flex-col overflow-y-auto rounded-l-3xl p-5 sm:p-8" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 34 }}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold">{editing === "new" ? `New ${def.singular.toLowerCase()}` : `Edit ${def.singular.toLowerCase()}`}</h2>
                <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full hover:bg-primary/10"><X className="h-5 w-5" /></button>
              </div>
              <ResourceForm def={def} row={editing === "new" ? null : editing} relationOptions={relationOptions} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); router.refresh(); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
