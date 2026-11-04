import "server-only";
import { z, type ZodTypeAny } from "zod";
import type { FieldDef, ResourceDef } from "@/lib/admin/definitions";

const urlLike = (allowMail: boolean) =>
  z
    .string()
    .trim()
    .max(1000)
    .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v) || (allowMail && /^(mailto|tel):/i.test(v)), "Enter a valid URL (https://…)");

const emptyToNull = (v: unknown) => (v === "" || v === undefined || v === null ? null : v);

function fieldSchema(f: FieldDef): ZodTypeAny {
  const req = !!f.required;
  const needed = (s: z.ZodString) => (req ? s.min(1, `${f.label} is required`) : s);
  switch (f.type) {
    case "text": return needed(z.string().trim().max(500)).default("");
    case "textarea": return needed(z.string().trim().max(10000)).default("");
    case "markdown": return z.string().max(200000).default("");
    case "email": return z.string().trim().max(200).refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email").default("");
    case "url": return needed(urlLike(true)).default("");
    case "image": case "file": return needed(urlLike(false)).default("");
    case "slug": return z.string().trim().toLowerCase().min(1, "Slug is required").max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only");
    case "color": return z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #b3261e");
    case "boolean": return z.boolean().default(false);
    case "number": case "range":
      return z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().finite().min(f.min ?? 0).max(f.max ?? 1_000_000));
    case "date": {
      const d = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker").nullable();
      return z.preprocess(emptyToNull, req ? d.refine((v) => v !== null, "Required") : d);
    }
    case "datetime": return z.preprocess(emptyToNull, z.coerce.date().nullable());
    case "select": {
      const values = (f.options ?? []).map((o) => o.value);
      return z.string().refine((v) => values.includes(v), "Pick one of the options");
    }
    case "relation": {
      const n = z.number().int().positive().nullable();
      return z.preprocess((v) => (v === "" || v == null ? null : Number(v)), req ? n.refine((v) => v !== null, "Required") : n);
    }
    case "tags": case "images": return z.array(z.string().trim().min(1).max(1000)).max(60).default([]);
  }
}

/** Builds a strict Zod object for a resource from its field definitions. Unknown keys are stripped. */
export function buildSchema(def: ResourceDef, forUpdate: boolean) {
  const shape: Record<string, ZodTypeAny> = {};
  for (const f of def.fields) {
    if (f.readOnly && forUpdate) continue;
    shape[f.name] = fieldSchema(f);
  }
  return z.object(shape);
}
