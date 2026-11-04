import { ImageResponse } from "next/og";

/** Renders the PWA / apple-touch icon as a PNG at 192 or 512 px. */
export async function GET(_req: Request, ctx: { params: Promise<{ size: string }> }) {
  const { size } = await ctx.params;
  const px = size === "192" ? 192 : 512;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a0505" }}>
        <div style={{ width: px * 0.62, height: px * 0.62, borderRadius: "50%", background: "radial-gradient(circle at 32% 28%, #f9c58a, #e4572e 40%, #5c0f0a)" }} />
      </div>
    ),
    { width: px, height: px, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
