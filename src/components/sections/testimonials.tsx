"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { EmptyState, SectionHeading } from "@/components/ui/motion";
import { SmartImage } from "@/components/ui/smart-image";
import { useI18n } from "@/components/providers";

export interface TestimonialCard { id: number; name: string; role: string; photoUrl: string; text: string }

export function Testimonials({ items }: { items: TestimonialCard[] }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;

  useEffect(() => {
    if (n < 2 || paused || reduce) return;
    const id = setInterval(() => setI((v) => (v + 1) % n), 7000);
    return () => clearInterval(id);
  }, [n, paused, reduce]);

  const cur = items[i % Math.max(n, 1)];
  return (
    <section id="testimonials" className="section">
      <div className="container-x">
        <SectionHeading eyebrow={t.nav.testimonials} title={t.testimonials} sub={t.testimonialsSub} />
        {!cur ? (
          <EmptyState>{t.noTestimonials}</EmptyState>
        ) : (
          <div className="mx-auto max-w-3xl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
            <div className="glass relative min-h-[18rem] overflow-hidden rounded-[2rem] p-8 sm:p-12" aria-live="polite">
              <Quote className="absolute right-6 top-6 h-14 w-14 text-secondary/25" aria-hidden />
              <AnimatePresence mode="wait">
                <motion.figure key={cur.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4 }}>
                  <blockquote className="font-display text-xl font-semibold leading-relaxed sm:text-2xl">“{cur.text}”</blockquote>
                  <figcaption className="mt-8 flex items-center gap-4">
                    <span className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-secondary bg-primary/30">
                      {cur.photoUrl && <SmartImage src={cur.photoUrl} alt={cur.name} sizes="56px" />}
                    </span>
                    <span><span className="block font-bold">{cur.name}</span><span className="text-sm text-muted">{cur.role}</span></span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
            {n > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button type="button" aria-label={t.prevSlide} onClick={() => setI((v) => (v - 1 + n) % n)} className="glass grid h-11 w-11 place-items-center rounded-full hover:text-accent"><ChevronLeft className="h-5 w-5" /></button>
                <div className="flex gap-2">
                  {items.map((it, k) => (
                    <button key={it.id} type="button" aria-label={`${k + 1} / ${n}`} aria-current={k === i} onClick={() => setI(k)}
                      className={`h-2.5 rounded-full transition-all ${k === i ? "w-8 bg-secondary" : "w-2.5 bg-muted/40"}`} />
                  ))}
                </div>
                <button type="button" aria-label={t.nextSlide} onClick={() => setI((v) => (v + 1) % n)} className="glass grid h-11 w-11 place-items-center rounded-full hover:text-accent"><ChevronRight className="h-5 w-5" /></button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
