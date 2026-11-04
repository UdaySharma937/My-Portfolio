import type { MetadataRoute } from "next";

/** PWA manifest (served at /manifest.webmanifest). Icons are rendered by /pwa-icon/[size]. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mars Portfolio",
    short_name: "Portfolio",
    description: "Developer portfolio",
    start_url: "/",
    display: "standalone",
    background_color: "#1a0505",
    theme_color: "#b3261e",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
