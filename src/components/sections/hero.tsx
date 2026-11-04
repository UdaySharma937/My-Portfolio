import { ArrowDown, Download } from "lucide-react";
import { Typewriter } from "@/components/sections/typewriter";
import { MarsLoader } from "@/components/sections/mars-loader";
import { Magnetic } from "@/components/ui/motion";
import { safeHref } from "@/lib/utils";
import type { Dict } from "@/lib/i18n";
import type { SiteData } from "@/lib/data";

export function Hero({ data, t }: { data: SiteData; t: Dict }) {
  const { hero, settings } = data;
  return (
    <section id="hero" className="section flex min-h-dvh items-center">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="order-2 lg:order-1">
          <p className="eyebrow mb-4">{hero.greeting}</p>
          <h1 className="text-5xl font-extrabold leading-[1.02] sm:text-6xl xl:text-7xl">
            <span className="text-gradient">{hero.name}</span>
          </h1>
          <p className="mt-5 min-h-[2.2rem] font-display text-xl font-semibold sm:text-2xl md:text-3xl">
            <Typewriter words={hero.roles} />
          </p>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{hero.pitch}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic><a href="#contact" className="btn btn-primary">{t.hireMe}</a></Magnetic>
            <Magnetic><a href="#projects" className="btn btn-ghost">{t.viewProjects}</a></Magnetic>
            {settings.resumeUrl && (
              <a href={safeHref(settings.resumeUrl)} target="_blank" rel="noopener noreferrer" download className="btn btn-ghost">
                <Download className="h-4 w-4" aria-hidden /> {t.resume}
              </a>
            )}
          </div>
        </div>
        <div className="order-1 lg:order-2"><MarsLoader /></div>
      </div>
      <a href="#about" aria-label={t.scroll} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-bounce text-muted hover:text-accent md:block">
        <ArrowDown className="h-6 w-6" />
      </a>
    </section>
  );
}
