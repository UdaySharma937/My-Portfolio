import Image from "next/image";

/**
 * next/image wrapper (parent must be `relative` with a size). SVG/GIF and remote URLs
 * skip the optimiser, everything else gets responsive, lazy-loaded, modern formats.
 */
export function SmartImage({
  src, alt, className, sizes = "(min-width: 1024px) 50vw, 100vw", priority = false,
}: { src: string; alt: string; className?: string; sizes?: string; priority?: boolean }) {
  const unoptimized = /\.(svg|gif)$/i.test(src) || /^https?:/i.test(src);
  return <Image src={src} alt={alt} fill sizes={sizes} unoptimized={unoptimized} priority={priority} className={className ?? "object-cover"} />;
}
