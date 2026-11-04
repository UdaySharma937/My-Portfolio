"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------- toasts -------------------------------- */
type ToastKind = "success" | "error";
interface Toast { id: number; kind: ToastKind; text: string }
const ToastCtx = createContext<(kind: ToastKind, text: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

/* ------------------------------- confirm -------------------------------- */
interface ConfirmOpts { title: string; text?: string; confirmLabel?: string; danger?: boolean }
const ConfirmCtx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);

export function AdminProviders({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const seq = useRef(0);

  const push = useCallback((kind: ToastKind, text: string) => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setDialog({ ...o, resolve })), []);
  const close = (v: boolean) => { dialog?.resolve(v); setDialog(null); };

  return (
    <ToastCtx.Provider value={push}>
      <ConfirmCtx.Provider value={confirm}>
        {children}
        <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div key={t.id} layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
                role={t.kind === "error" ? "alert" : "status"}
                className="glass-solid pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium">
                {t.kind === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />}
                <span>{t.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {dialog && (
            <motion.div className="fixed inset-0 z-[130] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => close(false)}>
              <motion.div role="alertdialog" aria-modal="true" aria-label={dialog.title} onClick={(e) => e.stopPropagation()}
                className="glass-solid w-full max-w-md rounded-3xl p-6" initial={{ scale: 0.94 }} animate={{ scale: 1 }} exit={{ scale: 0.94 }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={cn("mt-1 h-6 w-6 shrink-0", dialog.danger ? "text-red-500" : "text-accent")} />
                  <div><h2 className="text-lg font-bold">{dialog.title}</h2>{dialog.text && <p className="mt-1 text-sm text-muted">{dialog.text}</p>}</div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" className="btn btn-ghost" autoFocus onClick={() => close(false)}>Cancel</button>
                  <button type="button" className={cn("btn", dialog.danger ? "bg-red-600 text-white hover:bg-red-700" : "btn-primary")} onClick={() => close(true)}>{dialog.confirmLabel ?? "Confirm"}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
}

/** Accessible on/off switch. */
export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} title={label} disabled={disabled} onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50", checked ? "bg-gradient-to-r from-primary to-secondary" : "bg-muted/40")}>
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}
