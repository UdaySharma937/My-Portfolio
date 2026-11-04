"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Loader2, MapPin, Send } from "lucide-react";
import { SocialIcon } from "@/components/ui/icons";
import { Magnetic, Reveal, SectionHeading } from "@/components/ui/motion";
import { useI18n } from "@/components/providers";
import { contactSchema, type ContactInput } from "@/lib/validators";
import { safeHref } from "@/lib/utils";

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void } }
}

/** Cloudflare Turnstile (only rendered when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set). */
function Turnstile({ siteKey, onToken, resetKey }: { siteKey: string; onToken: (t: string) => void; resetKey: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef<string>("");
  useEffect(() => {
    const mount = () => {
      if (ref.current && window.turnstile && !id.current) id.current = window.turnstile.render(ref.current, { sitekey: siteKey, callback: onToken, "expired-callback": () => onToken("") });
    };
    if (window.turnstile) mount();
    else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true; s.onload = mount;
      document.head.appendChild(s);
    }
  }, [siteKey, onToken]);
  useEffect(() => { if (resetKey && window.turnstile) window.turnstile.reset(id.current); }, [resetKey]);
  return <div ref={ref} />;
}

interface Props { email: string; location: string; social: { id: number; label: string; platform: string; url: string }[] }

export function Contact({ email, location, social }: Props) {
  const { t } = useI18n();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setStatus("sending"); setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, turnstileToken: token }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setStatus("sent"); reset();
    } catch (e) {
      setStatus("error"); setError(e instanceof Error ? e.message : "Something went wrong");
      setResetKey((k) => k + 1);
    }
  });

  const copy = async () => {
    try { await navigator.clipboard.writeText(email); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  };
  const err = (m?: string) => m && <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-300">{m}</p>;

  return (
    <section id="contact" className="section">
      <div className="container-x">
        <SectionHeading eyebrow={t.nav.contact} title={t.contact} sub={t.contactSub} />
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <div className="glass h-full space-y-6 rounded-3xl p-6 sm:p-8">
              {email && (
                <div>
                  <p className="text-sm text-muted">{t.email}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <a href={`mailto:${email}`} className="break-all font-display text-lg font-bold hover:text-accent">{email}</a>
                    <button type="button" onClick={copy} className="chip hover:text-fg" aria-live="polite">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? t.copied : t.copyEmail}
                    </button>
                  </div>
                </div>
              )}
              {location && <p className="flex items-center gap-2 text-muted"><MapPin className="h-4 w-4 text-accent" aria-hidden />{location}</p>}
              {social.length > 0 && (
                <div>
                  <p className="mb-3 text-sm text-muted">{t.elsewhere}</p>
                  <ul className="flex flex-wrap gap-3">
                    {social.map((s) => (
                      <li key={s.id}>
                        <a href={safeHref(s.url)} target="_blank" rel="noopener noreferrer me" aria-label={s.label} title={s.label} className="glass grid h-11 w-11 place-items-center rounded-full transition hover:scale-110 hover:text-accent">
                          <SocialIcon platform={s.platform} className="h-5 w-5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={onSubmit} noValidate className="glass space-y-4 rounded-3xl p-6 sm:p-8">
              {/* Honeypot: hidden from people, irresistible to bots. */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>Website<input type="text" tabIndex={-1} autoComplete="off" {...register("website")} /></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium">{t.name}</label>
                  <input id="c-name" autoComplete="name" className="field" aria-invalid={!!errors.name} {...register("name")} />
                  {err(errors.name?.message)}
                </div>
                <div>
                  <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium">{t.email}</label>
                  <input id="c-email" type="email" autoComplete="email" className="field" aria-invalid={!!errors.email} {...register("email")} />
                  {err(errors.email?.message)}
                </div>
              </div>
              <div>
                <label htmlFor="c-subject" className="mb-1.5 block text-sm font-medium">{t.subject}</label>
                <input id="c-subject" className="field" {...register("subject")} />
              </div>
              <div>
                <label htmlFor="c-message" className="mb-1.5 block text-sm font-medium">{t.message}</label>
                <textarea id="c-message" rows={6} className="field resize-y" aria-invalid={!!errors.message} {...register("message")} />
                {err(errors.message?.message)}
              </div>
              {siteKey && <Turnstile siteKey={siteKey} onToken={setToken} resetKey={resetKey} />}
              <div className="flex flex-wrap items-center gap-4">
                <Magnetic>
                  <button type="submit" disabled={status === "sending"} className="btn btn-primary disabled:opacity-60">
                    {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {status === "sending" ? t.sending : t.send}
                  </button>
                </Magnetic>
                <p role="status" aria-live="polite" className={status === "error" ? "text-sm text-red-600 dark:text-red-300" : "text-sm text-accent"}>
                  {status === "sent" ? t.sent : status === "error" ? error : ""}
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
