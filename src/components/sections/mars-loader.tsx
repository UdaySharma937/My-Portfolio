"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const MarsPlanet = dynamic(() => import("./mars-planet"), { ssr: false });

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

function canRender3D(): boolean {
  const n = navigator as Nav;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if ((n.hardwareConcurrency ?? 8) <= 2 || (n.deviceMemory ?? 8) <= 2 || n.connection?.saveData) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** CSS planet first (instant, zero JS cost), upgraded to a lazy-loaded 3D Mars on capable devices. */
export function MarsLoader() {
  const box = useRef<HTMLDivElement>(null);
  const [use3d, setUse3d] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!canRender3D()) return;
    const start = () => setUse3d(true);
    // Wait until the page is interactive before pulling in three.js.
    const id = window.setTimeout(start, 700);
    return () => clearTimeout(id);
  }, []);

  // Pause rendering whenever the planet scrolls out of view.
  useEffect(() => {
    if (!box.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(box.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className="relative mx-auto aspect-square w-full max-w-[min(78vw,30rem)]" role="img" aria-label="Rotating 3D model of the planet Mars">
      <div className="absolute inset-[6%] rounded-full bg-secondary/30 blur-3xl" aria-hidden />
      {use3d ? (
        <div className="absolute inset-0"><MarsPlanet active={visible} /></div>
      ) : (
        <div className="planet-static absolute inset-[8%]" />
      )}
    </div>
  );
}
