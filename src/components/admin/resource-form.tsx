"use client";

import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { FileField, ImagesField, MarkdownField, TagsField } from "@/components/admin/fields";
import { Switch, useToast } from "@/components/admin/ui";
import { saveRecord } from "@/lib/admin/actions";
import type { FieldDef, ResourceDef } from "@/lib/admin/definitions";
import { slugify } from "@/lib/utils";

export type Row = Record<string, unknown>;
export type RelationOptions = Record<string, { value: string; label: string }[]>;
type Values = Record<string, unknown>;

const pad = (n: number) => String(n).padStart(2, "0");
const toLocalInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

function initial(f: FieldDef, v: unknown, isNew: boolean): unknown {
  switch (f.type) {
    case "tags": case "images": return Array.isArray(v) ? v : [];
    case "boolean": return v === undefined || v === null ? (isNew && f.name === "isPublished") : !!v;
    case "number": case "range": return v == null ? 0 : v;
    case "datetime": return v ? toLocalInput(new Date(v as string)) : "";
    case "relation": return v == null ? "" : String(v);
    case "date": return typeof v === "string" ? v.slice(0, 10) : v instanceof Date ? v.toISOString().slice(0, 10) : "";
    case "select": return v || f.options?.[0]?.value || "";
    case "color": return v ?? "#b3261e";
    default: return v ?? "";
  }
}

function Control_({ f, control, options, error }: { f: FieldDef; control: Control<Values>; options?: { value: string; label: string }[]; error?: string }) {
  const id = `f-${f.name}`;
  const label = (
    <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
      {f.label}{f.required && <span className="text-accent"> *</span>}
    </label>
  );
  return (
    <div className={f.type === "markdown" || f.type === "images" || f.type === "textarea" || f.type === "tags" ? "md:col-span-2" : ""}>
      <Controller
        name={f.name}
        control={control}
        render={({ field }) => {
          const v = field.value as never;
          const set = field.onChange;
          switch (f.type) {
            case "boolean":
              return <div className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3"><span className="text-sm font-semibold">{f.label}</span><Switch checked={!!v} onChange={set} label={f.label} /></div>;
            case "textarea":
              return <>{label}<textarea id={id} rows={4} className="field resize-y" value={String(v ?? "")} onChange={set} aria-invalid={!!error} /></>;
            case "markdown":
              return <>{label}<MarkdownField value={String(v ?? "")} onChange={set} /></>;
            case "tags":
              return <>{label}<TagsField value={v as string[]} onChange={set} /></>;
            case "images":
              return <>{label}<ImagesField value={v as string[]} onChange={set} bucket={f.bucket ?? "media"} /></>;
            case "image":
              return <>{label}<FileField value={String(v ?? "")} onChange={set} bucket={f.bucket ?? "media"} accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/x-icon" /></>;
            case "file":
              return <>{label}<FileField value={String(v ?? "")} onChange={set} bucket={f.bucket ?? "media"} accept={f.bucket === "resume" ? "application/pdf" : "image/png,image/jpeg,image/webp,application/pdf"} /></>;
            case "select":
              return <>{label}<select id={id} className="field" value={String(v ?? "")} onChange={set}><option value="" disabled>Select…</option>{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></>;
            case "relation":
              return <>{label}<select id={id} className="field" value={String(v ?? "")} onChange={set}><option value="">— none —</option>{options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></>;
            case "color":
              return <>{label}<div className="flex items-center gap-3"><input id={id} type="color" value={String(v)} onChange={set} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-transparent" /><input aria-label={`${f.label} hex`} className="field font-mono" value={String(v)} onChange={set} maxLength={7} /></div></>;
            case "range":
              return <>{label}<div className="flex items-center gap-3"><input id={id} type="range" min={f.min} max={f.max} value={Number(v)} onChange={(e) => set(Number(e.target.value))} className="w-full accent-[var(--secondary)]" /><span className="w-10 text-right text-sm tabular-nums">{String(v)}</span></div></>;
            default: {
              const type = f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : f.type === "email" ? "email" : "text";
              return <>{label}<input id={id} type={type} className="field" value={String(v ?? "")} readOnly={f.readOnly} min={f.min} max={f.max} onChange={set} aria-invalid={!!error} /></>;
            }
          }
        }}
      />
      {f.hint && <p className="mt-1 text-xs text-muted">{f.hint}</p>}
      {error && <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>}
    </div>
  );
}

export function ResourceForm({ def, row, relationOptions, onSaved, onCancel }: {
  def: ResourceDef; row: Row | null; relationOptions: RelationOptions; onSaved: () => void; onCancel?: () => void;
}) {
  const toast = useToast();
  const isNew = !row;
  const defaults = useMemo(() => Object.fromEntries(def.fields.map((f) => [f.name, initial(f, row?.[f.name], isNew)])) as Values, [def, row, isNew]);
  const { control, handleSubmit, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<Values>({ defaultValues: defaults });
  const slugField = def.fields.find((f) => f.type === "slug" && f.slugFrom);
  const source = slugField ? String(watch(slugField.slugFrom!) ?? "") : "";
  const slugDirty = useRef(!isNew);

  // Auto-generate the slug from the title until the user edits it by hand.
  useEffect(() => {
    if (slugField && !slugDirty.current) setValue(slugField.name, slugify(source), { shouldValidate: false });
  }, [source, slugField, setValue]);
  useEffect(() => {
    if (!slugField) return;
    const sub = watch((_v, info) => { if (info.name === slugField.name && info.type === "change") slugDirty.current = true; });
    return () => sub.unsubscribe();
  }, [slugField, watch]);

  // Live theme preview: apply the edited values straight to the page's CSS variables.
  useEffect(() => {
    if (def.preview !== "theme") return;
    const root = document.documentElement.style;
    const sub = watch((v) => {
      for (const k of ["primary", "secondary", "g1", "g2", "g3", "g4", "g5"]) if (/^#[0-9a-f]{6}$/i.test(String(v[k]))) root.setProperty(`--${k}`, String(v[k]));
      root.setProperty("--blur", `${Number(v.blur ?? 18)}px`);
      root.setProperty("--grain", v.grain ? "0.07" : "0");
      root.setProperty("--anim", v.animations ? "running" : "paused");
    });
    return () => sub.unsubscribe();
  }, [def.preview, watch]);

  const submit = handleSubmit(async (values) => {
    const payload: Values = { ...values };
    for (const f of def.fields) if (f.type === "datetime") payload[f.name] = values[f.name] ? new Date(String(values[f.name])).toISOString() : "";
    const res = await saveRecord(def.key, (row?.id as number | undefined) ?? null, payload);
    if (res.ok) { toast("success", `${def.singular} saved`); onSaved(); return; }
    Object.entries(res.fieldErrors ?? {}).forEach(([name, message]) => setError(name, { message }));
    toast("error", res.error);
  });

  const fieldError = (n: string) => (errors[n]?.message as string | undefined);
  const main = def.fields.filter((f) => !f.hi);
  const hindi = def.fields.filter((f) => f.hi);

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        {main.map((f) => <Control_ key={f.name} f={f} control={control} options={f.relation ? relationOptions[f.relation] : undefined} error={fieldError(f.name)} />)}
      </div>
      {hindi.length > 0 && (
        <details className="glass rounded-2xl p-4">
          <summary className="cursor-pointer text-sm font-bold">हिन्दी translations <span className="font-normal text-muted">(optional – falls back to English when empty)</span></summary>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {hindi.map((f) => <Control_ key={f.name} f={f} control={control} error={fieldError(f.name)} />)}
          </div>
        </details>
      )}
      <div className="sticky bottom-0 -mx-1 flex justify-end gap-3 bg-gradient-to-t from-[var(--glass-solid)] to-transparent px-1 pb-1 pt-4">
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
        <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:opacity-60">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {isSubmitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
