"use client";

import { useRouter } from "next/navigation";
import { ResourceForm, type RelationOptions, type Row } from "@/components/admin/resource-form";
import type { ResourceDef } from "@/lib/admin/definitions";

/** Inline form for single-row settings (hero, about, site, theme). */
export function SingletonEditor({ def, row, relationOptions }: { def: ResourceDef; row: Row; relationOptions: RelationOptions }) {
  const router = useRouter();
  return (
    <div className="glass rounded-3xl p-5 sm:p-8">
      <ResourceForm def={def} row={row} relationOptions={relationOptions} onSaved={() => router.refresh()} />
    </div>
  );
}
