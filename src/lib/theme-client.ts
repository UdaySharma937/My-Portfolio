"use client";

/** Flips light/dark, persists the choice and animates the colour change. */
export function toggleTheme(): boolean {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  const dark = !root.classList.contains("dark");
  root.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    /* private mode – ignore */
  }
  window.setTimeout(() => root.classList.remove("theme-transition"), 500);
  return dark;
}
