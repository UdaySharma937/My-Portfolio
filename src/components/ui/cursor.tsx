"use client";

import { useEffect, useRef } from "react";

/** Dot + trailing ring cursor. Only mounts behaviour on fine-pointer, motion-OK desktops. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    let tx = -100, ty = -100, rx = -100, ry = -100, raf = 0, hover = false, down = false;

    const move = (e: MouseEvent) => {
      tx = e.clientX; ty = e.clientY;
      if (dot.current) { dot.current.style.opacity = "1"; dot.current.style.transform = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`; }
      if (ring.current) ring.current.style.opacity = "1";
      hover = !!(e.target as Element | null)?.closest?.("a,button,[role=button],input,textarea,select,summary,[data-cursor]");
    };
    const tick = () => {
      rx += (tx - rx) * 0.16; ry += (ty - ry) * 0.16;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%) scale(${down ? 0.8 : hover ? 1.7 : 1})`;
      raf = requestAnimationFrame(tick);
    };
    const leave = () => { if (dot.current) dot.current.style.opacity = "0"; if (ring.current) ring.current.style.opacity = "0"; };
    const md = () => (down = true);
    const mu = () => (down = false);
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", md);
    window.addEventListener("mouseup", mu);
    document.addEventListener("mouseleave", leave);
    raf = requestAnimationFrame(tick);
    return () => {
      root.classList.remove("has-cursor");
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", md);
      window.removeEventListener("mouseup", mu);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <>
      <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100] h-2 w-2 rounded-full bg-accent opacity-0 transition-opacity" />
      <div ref={ring} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100] h-9 w-9 rounded-full border-2 border-accent/70 opacity-0 transition-[opacity] duration-300" />
    </>
  );
}
