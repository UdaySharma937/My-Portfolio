"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, ExternalLink, FileText, X } from "lucide-react";
import { EmptyState, Reveal, SectionHeading } from "@/components/ui/motion";
import { SmartImage } from "@/components/ui/smart-image";
import { useI18n } from "@/components/providers";
import { cn, formatDate, safeHref } from "@/lib/utils";

export interface CertCard {
  id: number; title: string; issuer: string; category: string; issueDate: string | null; expiryDate: string | null;
  credentialId: string; credentialUrl: string; fileUrl: string; isFeatured: boolean;
}

const isPdf = (u: string) => /\.pdf$/i.test(u);

export function Certifications({ certs }: { certs: CertCard[] }) {
  const { t, locale } = useI18n();
  const [category, setCategory] = useState("all");
  const [issuer, setIssuer] = useState("all");
  const [open, setOpen] = useState<CertCard | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const categories = useMemo(() => [...new Set(certs.map((c) => c.category).filter(Boolean))], [certs]);
  const issuers = useMemo(() => [...new Set(certs.map((c) => c.issuer).filter(Boolean))], [certs]);
  const shown = certs.filter((c) => (category === "all" || c.category === category) && (issuer === "all" || c.issuer === issuer));

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <section id="certifications" className="section">
      <div className="container-x">
        <SectionHeading eyebrow={t.nav.certifications} title={t.certs} sub={t.certsSub} />
        {certs.length === 0 ? (
          <EmptyState>{t.noCerts}</EmptyState>
        ) : (
          <>
            <Reveal>
              <div className="mb-8 flex flex-wrap items-center gap-2">
                {["all", ...categories].map((c) => (
                  <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}
                    className={cn("chip px-4 py-2 text-sm transition hover:text-fg", category === c && "chip-active hover:text-white")}>
                    {c === "all" ? t.all : c}
                  </button>
                ))}
                {issuers.length > 1 && (
                  <select aria-label={t.issuedBy} value={issuer} onChange={(e) => setIssuer(e.target.value)} className="field ml-auto w-auto py-2 text-sm">
                    <option value="all">{t.issuedBy}: {t.all}</option>
                    {issuers.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                )}
              </div>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((c, i) => {
                const expired = c.expiryDate && new Date(c.expiryDate) < new Date();
                return (
                  <Reveal key={c.id} delay={(i % 3) * 0.06}>
                    <article className="glass flex h-full flex-col overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1">
                      <button type="button" onClick={() => c.fileUrl && setOpen(c)} disabled={!c.fileUrl} aria-label={`${t.viewCert}: ${c.title}`}
                        className="relative block aspect-[4/3] w-full overflow-hidden bg-primary/15 disabled:cursor-default">
                        {c.fileUrl && !isPdf(c.fileUrl) ? (
                          <SmartImage src={c.fileUrl} alt={`${c.title} certificate`} sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover transition duration-500 hover:scale-105" />
                        ) : (
                          <span className="grid h-full place-items-center text-accent">{c.fileUrl ? <FileText className="h-14 w-14" /> : <Award className="h-14 w-14" />}</span>
                        )}
                      </button>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold leading-snug">{c.title}</h3>
                          {expired && <span className="chip shrink-0 !border-secondary text-[10px] uppercase">Expired</span>}
                        </div>
                        <p className="mt-1 text-sm font-medium text-accent">{c.issuer}</p>
                        <dl className="mt-3 space-y-1 text-sm text-muted">
                          {c.issueDate && <div className="flex gap-1.5"><dt>{t.issued}:</dt><dd>{formatDate(c.issueDate, locale)}</dd></div>}
                          {c.expiryDate && <div className="flex gap-1.5"><dt>{t.expires}:</dt><dd>{formatDate(c.expiryDate, locale)}</dd></div>}
                          {c.credentialId && <div className="flex gap-1.5"><dt>ID:</dt><dd className="break-all font-mono text-xs">{c.credentialId}</dd></div>}
                        </dl>
                        {c.credentialUrl && (
                          <a href={safeHref(c.credentialUrl)} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-accent hover:underline">
                            {t.verify} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                          </a>
                        )}
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div role="dialog" aria-modal="true" aria-label={open.title} onClick={(e) => e.stopPropagation()}
              className="glass-solid relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl"
              initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}>
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <p className="truncate font-semibold">{open.title}</p>
                <button ref={closeRef} type="button" onClick={() => setOpen(null)} aria-label={t.close} className="grid h-9 w-9 place-items-center rounded-full hover:bg-primary/10"><X className="h-5 w-5" /></button>
              </div>
              <div className="min-h-0 flex-1 overflow-auto bg-black/20">
                {isPdf(open.fileUrl) ? (
                  <iframe src={open.fileUrl} title={open.title} className="h-[75vh] w-full" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={open.fileUrl} alt={`${open.title} certificate`} className="mx-auto max-h-[80vh] w-auto object-contain" />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
