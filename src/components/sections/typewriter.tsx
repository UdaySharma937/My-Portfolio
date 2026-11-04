"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Types and erases each role in turn. Static first role when reduced motion is on. */
export function Typewriter({ words }: { words: string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const list = words.length ? words : [""];

  useEffect(() => {
    if (reduce) return;
    const full = list[i % list.length];
    const delay = deleting ? 35 : text === full ? 1600 : 70;
    const id = setTimeout(() => {
      if (!deleting && text === full) setDeleting(true);
      else if (deleting && text === "") { setDeleting(false); setI((n) => n + 1); }
      else setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
    }, delay);
    return () => clearTimeout(id);
  }, [text, deleting, i, list, reduce]);

  return (
    <span aria-label={list.join(", ")}>
      <span aria-hidden>{reduce ? list[0] : text}</span>
      {!reduce && <span aria-hidden className="ml-0.5 inline-block w-[2px] animate-pulse bg-accent align-middle" style={{ height: "1em" }} />}
    </span>
  );
}
