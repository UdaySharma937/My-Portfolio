import { ImageResponse } from "next/og";
import { getSingleton } from "@/lib/data";
import * as s from "@/db/schema";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Portfolio";
export const dynamic = "force-dynamic";

/** Generated Open Graph card (used when no custom OG image is set in Admin → Site settings). */
export default async function OG() {
  let name = "Portfolio", line = "";
  try {
    const [site, hero] = await Promise.all([getSingleton(s.siteSettings), getSingleton(s.hero)]);
    name = hero.name || site.siteName;
    line = hero.roles[0] ?? "";
  } catch { /* fall back to defaults */ }
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#1a0505,#5c0f0a 50%,#b3261e)", color: "#fdeee2" }}>
        <div style={{ width: 120, height: 120, borderRadius: 60, background: "radial-gradient(circle at 32% 28%, #f9c58a, #e4572e 45%, #5c0f0a)", marginBottom: 40 }} />
        <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>{name}</div>
        <div style={{ fontSize: 40, marginTop: 16, color: "#f4a259" }}>{line}</div>
      </div>
    ),
    size,
  );
}
