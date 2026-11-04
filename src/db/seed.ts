import { sql } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";
import { DEFAULT_SECTIONS } from "@/lib/sections";

let seeding: Promise<void> | null = null;
let checked = false;

/**
 * Seeds sample content once, only when the database has never been seeded
 * (detected by an empty section_visibility table). Cheap after the first call.
 */
export function seedIfEmpty(): Promise<void> {
  if (checked) return Promise.resolve();
  if (!seeding) {
    seeding = (async () => {
      const rows = await db.select({ id: s.sectionVisibility.id }).from(s.sectionVisibility).limit(1);
      if (rows.length === 0) await seedAll();
      checked = true;
    })().finally(() => {
      seeding = null;
    });
  }
  return seeding;
}

/** Inserts the sample data. Safe to call on an empty DB (use `npm run seed`). */
export async function seedAll(): Promise<void> {
  // Singleton tables may already hold an empty auto-created row – replace it.
  await db.delete(s.siteSettings);
  await db.delete(s.hero);
  await db.delete(s.about);
  await db.delete(s.themeSettings);
  await db.insert(s.siteSettings).values({
    siteName: "Aarav Mehta",
    metaTitle: "Aarav Mehta — Full-stack Developer",
    metaDescription: "Full-stack developer crafting fast, accessible and beautiful web products with Next.js, TypeScript and PostgreSQL.",
    email: "hello@example.com",
    location: "Jaipur, India",
    locationHi: "जयपुर, भारत",
    resumeUrl: "",
    githubUsername: "octocat",
  });

  await db.insert(s.hero).values({
    name: "Aarav Mehta",
    nameHi: "आरव मेहता",
    greeting: "Hi, I'm",
    greetingHi: "नमस्ते, मैं हूँ",
    roles: ["Full-stack Developer", "UI Engineer", "Open-source Tinkerer", "Problem Solver"],
    rolesHi: ["फुल-स्टैक डेवलपर", "यूआई इंजीनियर", "ओपन-सोर्स प्रेमी", "समस्या-समाधानकर्ता"],
    pitch: "I turn complex ideas into fast, accessible and beautiful web products — from pixel to database.",
    pitchHi: "मैं जटिल आइडिया को तेज़, सुलभ और सुंदर वेब प्रोडक्ट में बदलता हूँ — पिक्सल से डेटाबेस तक।",
  });

  await db.insert(s.about).values({
    heading: "About me",
    headingHi: "मेरे बारे में",
    story:
      "I'm a full-stack developer with a designer's eye. For the past five years I've helped start-ups and small teams ship products people actually enjoy using.\n\nI care about performance budgets, accessible interfaces and code that the next developer can read at 2 a.m. When I'm not coding, you'll find me stargazing, sketching UI ideas or brewing questionable chai.",
    storyHi:
      "मैं एक फुल-स्टैक डेवलपर हूँ जिसके पास डिज़ाइनर की नज़र है। पिछले पाँच वर्षों से मैं स्टार्ट-अप्स और छोटी टीमों को ऐसे प्रोडक्ट लॉन्च करने में मदद कर रहा हूँ जिन्हें लोग सच में पसंद करते हैं।\n\nमुझे परफ़ॉर्मेंस, सुलभ इंटरफ़ेस और ऐसा कोड पसंद है जिसे अगला डेवलपर आसानी से पढ़ सके। कोडिंग के बाद मैं तारे देखता हूँ, UI के स्केच बनाता हूँ या चाय बनाता हूँ।",
    photoUrl: "/placeholders/avatar.svg",
    specialties: ["Next.js & React", "API design", "PostgreSQL", "Design systems", "Performance tuning"],
    specialtiesHi: ["Next.js और React", "API डिज़ाइन", "PostgreSQL", "डिज़ाइन सिस्टम", "परफ़ॉर्मेंस ट्यूनिंग"],
    yearsExperience: 5,
  });

  await db.insert(s.themeSettings).values({});

  await db.insert(s.sectionVisibility).values(
    DEFAULT_SECTIONS.map((x, i) => ({ key: x.key, label: x.label, isVisible: true, sortOrder: i })),
  );

  await db.insert(s.socialLinks).values([
    { label: "GitHub", platform: "github", url: "https://github.com/octocat", sortOrder: 0 },
    { label: "LinkedIn", platform: "linkedin", url: "https://www.linkedin.com/", sortOrder: 1 },
    { label: "X / Twitter", platform: "x", url: "https://x.com/", sortOrder: 2 },
    { label: "Email", platform: "email", url: "mailto:hello@example.com", sortOrder: 3 },
  ]);

  const cats = await db
    .insert(s.skillCategories)
    .values([
      { name: "Frontend", nameHi: "फ्रंटएंड", sortOrder: 0 },
      { name: "Backend", nameHi: "बैकएंड", sortOrder: 1 },
      { name: "Database", nameHi: "डेटाबेस", sortOrder: 2 },
      { name: "Tools & DevOps", nameHi: "टूल्स और DevOps", sortOrder: 3 },
    ])
    .returning();
  const c = (n: string) => cats.find((x) => x.name === n)!.id;
  await db.insert(s.skills).values([
    { categoryId: c("Frontend"), name: "React", icon: "layers", sortOrder: 0 },
    { categoryId: c("Frontend"), name: "Next.js", icon: "rocket", sortOrder: 1 },
    { categoryId: c("Frontend"), name: "TypeScript", icon: "code", sortOrder: 2 },
    { categoryId: c("Frontend"), name: "Tailwind CSS", icon: "palette", sortOrder: 3 },
    { categoryId: c("Frontend"), name: "Framer Motion", icon: "sparkles", sortOrder: 4 },
    { categoryId: c("Backend"), name: "Node.js", icon: "server", sortOrder: 0 },
    { categoryId: c("Backend"), name: "REST & tRPC", icon: "globe", sortOrder: 1 },
    { categoryId: c("Backend"), name: "Auth & Security", icon: "shield", sortOrder: 2 },
    { categoryId: c("Database"), name: "PostgreSQL", icon: "database", sortOrder: 0 },
    { categoryId: c("Database"), name: "Drizzle ORM", icon: "layers", sortOrder: 1 },
    { categoryId: c("Database"), name: "Redis", icon: "zap", sortOrder: 2 },
    { categoryId: c("Tools & DevOps"), name: "Git & GitHub", icon: "git", sortOrder: 0 },
    { categoryId: c("Tools & DevOps"), name: "Docker", icon: "cloud", sortOrder: 1 },
    { categoryId: c("Tools & DevOps"), name: "Vercel", icon: "cloud", sortOrder: 2 },
    { categoryId: c("Tools & DevOps"), name: "Linux & CLI", icon: "terminal", sortOrder: 3 },
  ]);

  await db.insert(s.projects).values([
    {
      slug: "aurora-commerce",
      title: "Aurora Commerce",
      titleHi: "ऑरोरा कॉमर्स",
      summary: "A lightning-fast headless storefront with a one-page checkout and real-time inventory.",
      summaryHi: "वन-पेज चेकआउट और रियल-टाइम इन्वेंटरी वाला तेज़ हेडलेस स्टोरफ्रंट।",
      category: "Web App",
      techStack: ["Next.js", "TypeScript", "PostgreSQL", "Stripe", "Tailwind"],
      coverImage: "/placeholders/project-1.svg",
      gallery: ["/placeholders/project-1.svg", "/placeholders/project-1-b.svg"],
      problem: "The client's old storefront took 7 seconds to load on mobile and lost almost two thirds of shoppers before checkout.",
      problemHi: "क्लाइंट का पुराना स्टोर मोबाइल पर 7 सेकंड में खुलता था और लगभग दो-तिहाई ग्राहक चेकआउट से पहले ही चले जाते थे।",
      solution: "I rebuilt the storefront as a streaming Next.js app with edge caching, optimistic cart updates and a single-page, accessible checkout.",
      solutionHi: "मैंने स्टोर को Next.js में दोबारा बनाया — एज कैशिंग, तुरंत अपडेट होने वाली कार्ट और एक-पेज सुलभ चेकआउट के साथ।",
      result: "Largest Contentful Paint dropped from 6.8s to 1.1s, conversion rose by 38% and the client now ships weekly instead of quarterly.",
      resultHi: "LCP 6.8 सेकंड से घटकर 1.1 सेकंड हुआ, कन्वर्ज़न 38% बढ़ा और अब क्लाइंट हर हफ़्ते रिलीज़ करता है।",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/octocat",
      isFeatured: true,
      sortOrder: 0,
    },
    {
      slug: "red-planet-analytics",
      title: "Red Planet Analytics",
      titleHi: "रेड प्लैनेट एनालिटिक्स",
      summary: "Privacy-first analytics dashboard with live visitors, funnels and shareable reports.",
      summaryHi: "लाइव विज़िटर, फ़नल और शेयर करने योग्य रिपोर्ट वाला प्राइवेसी-फ़र्स्ट एनालिटिक्स डैशबोर्ड।",
      category: "Dashboard",
      techStack: ["React", "Node.js", "PostgreSQL", "WebSockets", "D3"],
      coverImage: "/placeholders/project-2.svg",
      gallery: ["/placeholders/project-2.svg", "/placeholders/project-2-b.svg"],
      problem: "Small teams wanted simple analytics without cookie banners, heavy scripts or sending visitor data to third parties.",
      problemHi: "छोटी टीमें बिना कुकी बैनर और भारी स्क्रिप्ट के सरल एनालिटिक्स चाहती थीं।",
      solution: "A 1.2 KB tracking snippet feeds an event pipeline; visitors are hashed daily so no personal data is stored. Dashboards stream updates over WebSockets.",
      solutionHi: "1.2 KB की ट्रैकिंग स्क्रिप्ट इवेंट पाइपलाइन में डेटा भेजती है; विज़िटर रोज़ हैश होते हैं, इसलिए निजी डेटा सेव नहीं होता।",
      result: "Adopted by 400+ sites in the first quarter with a 99.98% uptime and no consent banners needed.",
      resultHi: "पहली तिमाही में 400+ साइटों ने अपनाया, 99.98% अपटाइम और किसी कंसेंट बैनर की ज़रूरत नहीं।",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/octocat",
      isFeatured: true,
      sortOrder: 1,
    },
    {
      slug: "orbit-notes",
      title: "Orbit Notes",
      titleHi: "ऑर्बिट नोट्स",
      summary: "A markdown-first notes app with offline sync, backlinks and a distraction-free editor.",
      summaryHi: "ऑफ़लाइन सिंक, बैकलिंक और डिस्ट्रैक्शन-फ़्री एडिटर वाला मार्कडाउन नोट्स ऐप।",
      category: "Productivity",
      techStack: ["React", "TypeScript", "IndexedDB", "PWA"],
      coverImage: "/placeholders/project-3.svg",
      gallery: ["/placeholders/project-3.svg", "/placeholders/project-3-b.svg"],
      problem: "Most note apps are either too heavy or lock your writing into a proprietary format.",
      problemHi: "ज़्यादातर नोट ऐप या तो बहुत भारी हैं या आपके लेखन को अपने फ़ॉर्मेट में बंद कर देते हैं।",
      solution: "Plain markdown files, stored locally first and synced when online, with fuzzy search and instant backlinks.",
      solutionHi: "सादे मार्कडाउन फ़ाइल, पहले लोकल स्टोर और ऑनलाइन होने पर सिंक, फज़ी सर्च और तुरंत बैकलिंक के साथ।",
      result: "2,000+ GitHub stars, installable as a PWA and works fully offline.",
      resultHi: "2,000+ GitHub स्टार, PWA के रूप में इंस्टॉल योग्य और पूरी तरह ऑफ़लाइन चलता है।",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/octocat",
      isFeatured: false,
      sortOrder: 2,
    },
  ]);

  await db.insert(s.certificates).values([
    { title: "Meta Front-End Developer Professional", titleHi: "मेटा फ्रंट-एंड डेवलपर प्रोफ़ेशनल", issuer: "Coursera", category: "Frontend", issueDate: "2023-03-14", credentialId: "MFE-48201", credentialUrl: "https://www.coursera.org/", fileUrl: "/placeholders/cert-1.svg", isFeatured: true, sortOrder: 0 },
    { title: "AWS Certified Cloud Practitioner", titleHi: "AWS सर्टिफ़ाइड क्लाउड प्रैक्टिशनर", issuer: "Amazon Web Services", category: "Cloud", issueDate: "2023-09-02", expiryDate: "2026-09-02", credentialId: "AWS-CCP-77310", credentialUrl: "https://aws.amazon.com/certification/", fileUrl: "/placeholders/cert-2.svg", isFeatured: true, sortOrder: 1 },
    { title: "PostgreSQL for Everybody", titleHi: "सबके लिए PostgreSQL", issuer: "University of Michigan", category: "Database", issueDate: "2022-11-20", credentialId: "PG-99214", credentialUrl: "https://www.coursera.org/", fileUrl: "/placeholders/cert-3.svg", sortOrder: 2 },
    { title: "Google UX Design Certificate", titleHi: "गूगल UX डिज़ाइन सर्टिफ़िकेट", issuer: "Google", category: "Design", issueDate: "2022-06-08", credentialId: "GUX-30567", credentialUrl: "https://grow.google/certificates/", fileUrl: "/placeholders/cert-4.svg", sortOrder: 3 },
  ]);

  await db.insert(s.experience).values([
    { role: "Senior Full-stack Developer", roleHi: "सीनियर फुल-स्टैक डेवलपर", company: "Nebula Labs", location: "Remote", startDate: "2023-01-01", description: "Lead a team of four building a multi-tenant SaaS platform. Cut infrastructure costs by 32% and introduced a design system adopted across three products.", descriptionHi: "चार लोगों की टीम का नेतृत्व करके मल्टी-टेनेंट SaaS प्लेटफ़ॉर्म बनाया। इंफ्रास्ट्रक्चर खर्च 32% घटाया और डिज़ाइन सिस्टम लागू किया।", sortOrder: 0 },
    { role: "Full-stack Developer", roleHi: "फुल-स्टैक डेवलपर", company: "Sandstorm Studio", location: "Bengaluru", startDate: "2021-02-01", endDate: "2022-12-31", description: "Delivered 12 client projects ranging from e-commerce to internal dashboards, mentoring two junior developers along the way.", descriptionHi: "ई-कॉमर्स से लेकर इंटरनल डैशबोर्ड तक 12 क्लाइंट प्रोजेक्ट पूरे किए और दो जूनियर डेवलपर्स को मेंटर किया।", sortOrder: 1 },
    { role: "Frontend Intern", roleHi: "फ्रंटएंड इंटर्न", company: "Pixel Forge", location: "Jaipur", startDate: "2020-06-01", endDate: "2021-01-31", description: "Built accessible UI components and fixed 150+ bugs in a production React codebase.", descriptionHi: "सुलभ UI कंपोनेंट बनाए और प्रोडक्शन React कोडबेस में 150+ बग ठीक किए।", sortOrder: 2 },
  ]);

  await db.insert(s.education).values([
    { degree: "B.Tech in Computer Science", degreeHi: "कंप्यूटर साइंस में बी.टेक", institution: "Rajasthan Technical University", startDate: "2016-08-01", endDate: "2020-05-31", description: "Graduated with distinction. Capstone: a real-time collaborative whiteboard.", descriptionHi: "डिस्टिंक्शन के साथ स्नातक। कैपस्टोन: रियल-टाइम कोलैबोरेटिव व्हाइटबोर्ड।", sortOrder: 0 },
  ]);

  await db.insert(s.services).values([
    { title: "Web app development", titleHi: "वेब ऐप डेवलपमेंट", description: "End-to-end products with Next.js, TypeScript and PostgreSQL — from MVP to scale.", descriptionHi: "Next.js, TypeScript और PostgreSQL के साथ MVP से स्केल तक पूरा प्रोडक्ट।", icon: "code", sortOrder: 0 },
    { title: "UI / UX engineering", titleHi: "UI / UX इंजीनियरिंग", description: "Design systems, motion and accessible interfaces that feel premium on every screen.", descriptionHi: "डिज़ाइन सिस्टम, मोशन और सुलभ इंटरफ़ेस जो हर स्क्रीन पर बेहतरीन लगें।", icon: "palette", sortOrder: 1 },
    { title: "Performance audits", titleHi: "परफ़ॉर्मेंस ऑडिट", description: "Find and fix what slows your site down — Core Web Vitals, bundle size and database queries.", descriptionHi: "साइट को धीमा करने वाली चीज़ें खोजना और ठीक करना — Core Web Vitals, बंडल साइज़ और क्वेरी।", icon: "zap", sortOrder: 2 },
    { title: "API & backend", titleHi: "API और बैकएंड", description: "Secure, well-documented APIs, auth flows and integrations with the tools you already use.", descriptionHi: "सुरक्षित, अच्छी तरह दस्तावेज़ित API, ऑथ और इंटीग्रेशन।", icon: "server", sortOrder: 3 },
  ]);

  await db.insert(s.testimonials).values([
    { name: "Priya Nair", role: "CEO, Lumen Retail", roleHi: "सीईओ, ल्यूमेन रिटेल", photoUrl: "/placeholders/t-1.svg", text: "Aarav rebuilt our store in six weeks and our conversion jumped by a third. Communication was clear, delivery was early.", textHi: "आरव ने छह हफ़्तों में हमारा स्टोर दोबारा बना दिया और कन्वर्ज़न एक-तिहाई बढ़ गया। संवाद साफ़ था और डिलीवरी समय से पहले।", sortOrder: 0 },
    { name: "Daniel Ortega", role: "CTO, Nebula Labs", roleHi: "सीटीओ, नेबुला लैब्स", photoUrl: "/placeholders/t-2.svg", text: "Rare mix of engineering depth and design taste. He raised the quality bar for our entire team.", textHi: "इंजीनियरिंग की गहराई और डिज़ाइन की समझ का दुर्लभ मेल। उन्होंने हमारी पूरी टीम का स्तर ऊँचा किया।", sortOrder: 1 },
    { name: "Sana Qureshi", role: "Founder, Orbit Studio", roleHi: "संस्थापक, ऑर्बिट स्टूडियो", photoUrl: "/placeholders/t-3.svg", text: "Reliable, curious and calm under pressure. I'd hire him again in a heartbeat.", textHi: "भरोसेमंद, जिज्ञासु और दबाव में भी शांत। मैं उन्हें फिर से तुरंत हायर करूँगी।", sortOrder: 2 },
  ]);

  await db.insert(s.nowItems).values([
    { label: "Building", labelHi: "बना रहा हूँ", text: "A tiny open-source CMS for portfolio sites, with first-class Hindi support.", textHi: "पोर्टफ़ोलियो साइट्स के लिए एक छोटा ओपन-सोर्स CMS, हिंदी सपोर्ट के साथ।", sortOrder: 0 },
    { label: "Learning", labelHi: "सीख रहा हूँ", text: "Rust and WebAssembly — porting a hot path of Orbit Notes to see what's possible.", textHi: "Rust और WebAssembly — Orbit Notes का एक हिस्सा पोर्ट करके देख रहा हूँ।", sortOrder: 1 },
    { label: "Reading", labelHi: "पढ़ रहा हूँ", text: "“The Pragmatic Programmer” — again. It gets better every time.", textHi: "“The Pragmatic Programmer” — फिर से। हर बार और बेहतर लगती है।", sortOrder: 2 },
  ]);

  await db.insert(s.blogPosts).values({
    slug: "building-a-fast-portfolio-with-nextjs",
    title: "Building a fast portfolio with Next.js",
    titleHi: "Next.js से तेज़ पोर्टफ़ोलियो बनाना",
    excerpt: "Practical lessons from shipping a portfolio that scores 95+ on Lighthouse without sacrificing personality.",
    excerptHi: "Lighthouse पर 95+ स्कोर वाला पोर्टफ़ोलियो बनाने से मिले व्यावहारिक सबक।",
    content: `## Why bother with performance?

A portfolio is your first impression. If it takes five seconds to load, nobody sees the work you're proud of.

### The three rules I follow

1. **Ship less JavaScript.** Server components by default, client components only where interaction is needed.
2. **Lazy-load the heavy stuff.** The 3D hero is loaded *after* the page is interactive.
3. **Measure, don't guess.** Lighthouse and the Network tab never lie.

### A small example

\`\`\`ts
// Load a heavy component only on the client, after first paint
import dynamic from "next/dynamic";

const Planet = dynamic(() => import("./Planet"), { ssr: false });
\`\`\`

> Fast sites feel *kind*. They respect the visitor's time.

### Checklist

- [x] Optimise images with \`next/image\`
- [x] Use \`next/font\` to avoid layout shift
- [x] Respect \`prefers-reduced-motion\`
- [ ] Ship it 🚀

| Metric | Before | After |
| ------ | ------ | ----- |
| LCP    | 3.4s   | 1.2s  |
| JS     | 420 KB | 140 KB |
`,
    contentHi: "",
    tags: ["Next.js", "Performance", "Web"],
    seoDescription: "How to build a Lighthouse 95+ portfolio with Next.js, lazy-loaded 3D and accessible design.",
    publishedAt: new Date(),
    isPublished: true,
  });
}

/** Utility used by the backup importer to reset serial sequences after raw inserts. */
export async function resetSequences(tables: string[]): Promise<void> {
  for (const t of tables) {
    await db.execute(sql.raw(`select setval(pg_get_serial_sequence('"${t}"', 'id'), coalesce((select max(id) from "${t}"), 0) + 1, false)`));
  }
}
