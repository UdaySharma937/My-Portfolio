import { Suspense } from "react";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { Projects } from "@/components/sections/projects";
import { Certifications } from "@/components/sections/certifications";
import { Experience } from "@/components/sections/experience";
import { Services } from "@/components/sections/services";
import { Testimonials } from "@/components/sections/testimonials";
import { Blog } from "@/components/sections/blog";
import { GithubStats } from "@/components/sections/github-stats";
import { Now } from "@/components/sections/now";
import { Contact } from "@/components/sections/contact";
import { getSiteData } from "@/lib/data";
import { getDict } from "@/lib/locale";
import { siteUrl } from "@/lib/utils";

export default async function HomePage() {
  const { locale, t } = await getDict();
  const data = await getSiteData(locale);
  const { settings, hero } = data;
  const visible = data.sections.filter((s) => s.isVisible).map((s) => s.key);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: hero.name || settings.siteName,
    jobTitle: hero.roles[0],
    description: settings.metaDescription,
    url: siteUrl(),
    email: settings.email || undefined,
    image: data.about.photoUrl ? `${siteUrl()}${data.about.photoUrl}` : undefined,
    sameAs: data.social.filter((s) => /^https?:/.test(s.url)).map((s) => s.url),
  };

  const render: Record<string, React.ReactNode> = {
    hero: <Hero data={data} t={t} />,
    about: <About data={data} t={t} />,
    skills: <Skills data={data} t={t} />,
    projects: <Projects projects={data.projects} />,
    certifications: <Certifications certs={data.certificates.map((c) => ({ ...c, issueDate: c.issueDate, expiryDate: c.expiryDate }))} />,
    experience: <Experience data={data} t={t} locale={locale} />,
    services: <Services data={data} t={t} />,
    testimonials: <Testimonials items={data.testimonials} />,
    blog: <Blog posts={data.posts} t={t} locale={locale} />,
    github: (
      <Suspense fallback={<section id="github" className="section"><div className="container-x"><div className="skeleton h-72" /></div></section>}>
        <GithubStats username={settings.githubUsername} t={t} />
      </Suspense>
    ),
    now: <Now data={data} t={t} />,
    contact: <Contact email={settings.email} location={settings.location} social={data.social} />,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {visible.map((key) => <div key={key}>{render[key]}</div>)}
    </>
  );
}
