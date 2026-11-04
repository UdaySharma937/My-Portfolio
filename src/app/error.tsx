"use client";

import { useEffect } from "react";
import { useI18n } from "@/components/providers";

/** Route-level error boundary with a retry button. */
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="glass max-w-md rounded-3xl p-10">
        <h1 className="text-3xl font-extrabold">{t.errorTitle}</h1>
        <p className="mt-3 text-muted">{error.digest ? `Ref: ${error.digest}` : ""}</p>
        <button type="button" onClick={reset} className="btn btn-primary mt-6">{t.retry}</button>
      </div>
    </main>
  );
}
