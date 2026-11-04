"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Privacy-friendly page-view beacon: no cookies, honours Do-Not-Track. */
export function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (navigator.doNotTrack === "1") return;
    const body = JSON.stringify({ path: pathname, referrer: document.referrer ? new URL(document.referrer).hostname : "" });
    fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  }, [pathname]);
  return null;
}
