/** Lightweight i18n: UI strings live here, content translations live in `*Hi` DB columns. */
export type Locale = "en" | "hi";
export const LOCALES: Locale[] = ["en", "hi"];
export const LOCALE_COOKIE = "lang";

const raw = {
  en: {
    nav: {
      hero: "Home", about: "About", skills: "Skills", projects: "Projects", certifications: "Certificates",
      experience: "Journey", services: "Services", testimonials: "Praise", blog: "Notes", github: "GitHub",
      now: "Now", contact: "Contact",
    },
    hireMe: "Hire me", viewProjects: "View projects", resume: "Download résumé",
    scroll: "Scroll", years: "Years experience", projectsStat: "Projects shipped", certsStat: "Certificates",
    specialties: "Specialties", skills: "Skills & tools", skillsSub: "The tools I reach for every day.",
    projects: "Selected work", projectsSub: "Things I designed, built and shipped.", all: "All",
    live: "Live demo", code: "Source code", caseStudy: "Case study", problem: "The problem", solution: "The solution",
    result: "The result", gallery: "Gallery", techStack: "Tech stack", next: "Next project", prev: "Previous project",
    back: "Back to projects", certs: "Certifications", certsSub: "Proof that I keep learning.", issuedBy: "Issued by",
    issued: "Issued", expires: "Expires", credentialId: "Credential ID", verify: "Verify credential", viewCert: "View certificate",
    experience: "Experience", education: "Education", journey: "My journey", present: "Present",
    services: "What I offer", servicesSub: "How I can help your product grow.",
    testimonials: "Kind words", testimonialsSub: "What people say about working with me.",
    blog: "Notes & writing", blogSub: "Thoughts on code, design and craft.", readMore: "Read note", min: "min read",
    allPosts: "All notes", noPosts: "No notes published yet.",
    github: "Open source", githubSub: "Live from GitHub.", repos: "Repositories", stars: "Stars", followers: "Followers",
    pinned: "Popular repositories", contributions: "Contributions in the last year", githubDown: "GitHub stats are unavailable right now.",
    now: "Right now", nowSub: "What has my attention this season.",
    contact: "Let's work together", contactSub: "Tell me about your idea — I usually reply within a day.",
    name: "Your name", email: "Email address", subject: "Subject", message: "Message", send: "Send message", sending: "Sending…",
    sent: "Thanks! Your message is on its way.", copyEmail: "Copy email", copied: "Copied!", elsewhere: "Find me elsewhere",
    empty: "Nothing here yet.", noProjects: "No projects yet.", noCerts: "No certificates yet.", noSkills: "No skills added yet.",
    noTimeline: "Timeline is empty.", noTestimonials: "No testimonials yet.", noNow: "Nothing listed right now.",
    footer: "Built on Mars, shipped to Earth.", rights: "All rights reserved.",
    palette: "Search sections, projects, actions…", paletteEmpty: "No results found.", toggleTheme: "Toggle theme", language: "Language",
    menu: "Menu", close: "Close", collapse: "Collapse menu", expand: "Expand menu", notFound: "Lost in space",
    notFoundText: "This page drifted off into the Martian dust.", goHome: "Back to base", errorTitle: "Something went wrong",
    retry: "Try again", prevSlide: "Previous", nextSlide: "Next", search: "Search", sections: "Sections", actions: "Actions",
    darkMode: "Dark mode", lightMode: "Light mode",
  },
  hi: {
    nav: {
      hero: "होम", about: "परिचय", skills: "कौशल", projects: "प्रोजेक्ट्स", certifications: "प्रमाणपत्र",
      experience: "सफ़र", services: "सेवाएँ", testimonials: "राय", blog: "लेख", github: "गिटहब",
      now: "अभी", contact: "संपर्क",
    },
    hireMe: "मुझे हायर करें", viewProjects: "प्रोजेक्ट देखें", resume: "रिज़्यूमे डाउनलोड करें",
    scroll: "स्क्रॉल", years: "वर्षों का अनुभव", projectsStat: "पूरे किए प्रोजेक्ट", certsStat: "प्रमाणपत्र",
    specialties: "विशेषज्ञता", skills: "कौशल और टूल्स", skillsSub: "वे टूल्स जिनका मैं रोज़ उपयोग करता हूँ।",
    projects: "चुनिंदा काम", projectsSub: "जो मैंने डिज़ाइन, बनाया और लॉन्च किया।", all: "सभी",
    live: "लाइव डेमो", code: "सोर्स कोड", caseStudy: "केस स्टडी", problem: "समस्या", solution: "समाधान",
    result: "नतीजा", gallery: "गैलरी", techStack: "टेक स्टैक", next: "अगला प्रोजेक्ट", prev: "पिछला प्रोजेक्ट",
    back: "प्रोजेक्ट्स पर वापस", certs: "प्रमाणपत्र", certsSub: "सीखते रहने का प्रमाण।", issuedBy: "जारीकर्ता",
    issued: "जारी", expires: "समाप्ति", credentialId: "क्रेडेंशियल आईडी", verify: "क्रेडेंशियल सत्यापित करें", viewCert: "प्रमाणपत्र देखें",
    experience: "अनुभव", education: "शिक्षा", journey: "मेरा सफ़र", present: "वर्तमान",
    services: "मैं क्या करता हूँ", servicesSub: "मैं आपके प्रोडक्ट को बढ़ाने में कैसे मदद कर सकता हूँ।",
    testimonials: "लोगों की राय", testimonialsSub: "मेरे साथ काम करने के बारे में लोग क्या कहते हैं।",
    blog: "नोट्स और लेख", blogSub: "कोड, डिज़ाइन और कारीगरी पर विचार।", readMore: "लेख पढ़ें", min: "मिनट पढ़ें",
    allPosts: "सभी लेख", noPosts: "अभी कोई लेख प्रकाशित नहीं हुआ।",
    github: "ओपन सोर्स", githubSub: "सीधे गिटहब से।", repos: "रिपॉज़िटरी", stars: "स्टार", followers: "फ़ॉलोअर",
    pinned: "लोकप्रिय रिपॉज़िटरी", contributions: "पिछले एक वर्ष का योगदान", githubDown: "गिटहब आँकड़े अभी उपलब्ध नहीं हैं।",
    now: "अभी", nowSub: "इस समय मेरा ध्यान किस पर है।",
    contact: "आइए साथ काम करें", contactSub: "अपना आइडिया बताइए — मैं आमतौर पर एक दिन में जवाब देता हूँ।",
    name: "आपका नाम", email: "ईमेल पता", subject: "विषय", message: "संदेश", send: "संदेश भेजें", sending: "भेज रहे हैं…",
    sent: "धन्यवाद! आपका संदेश भेज दिया गया है।", copyEmail: "ईमेल कॉपी करें", copied: "कॉपी हो गया!", elsewhere: "मुझे यहाँ भी खोजें",
    empty: "अभी यहाँ कुछ नहीं है।", noProjects: "अभी कोई प्रोजेक्ट नहीं।", noCerts: "अभी कोई प्रमाणपत्र नहीं।", noSkills: "अभी कोई कौशल नहीं जोड़ा गया।",
    noTimeline: "टाइमलाइन खाली है।", noTestimonials: "अभी कोई राय नहीं।", noNow: "अभी कुछ सूचीबद्ध नहीं है।",
    footer: "मंगल पर बना, पृथ्वी पर भेजा।", rights: "सर्वाधिकार सुरक्षित।",
    palette: "सेक्शन, प्रोजेक्ट, एक्शन खोजें…", paletteEmpty: "कोई परिणाम नहीं मिला।", toggleTheme: "थीम बदलें", language: "भाषा",
    menu: "मेन्यू", close: "बंद करें", collapse: "मेन्यू छोटा करें", expand: "मेन्यू बड़ा करें", notFound: "अंतरिक्ष में खो गए",
    notFoundText: "यह पेज मंगल की धूल में खो गया।", goHome: "होम पर लौटें", errorTitle: "कुछ गड़बड़ हो गई",
    retry: "फिर कोशिश करें", prevSlide: "पिछला", nextSlide: "अगला", search: "खोजें", sections: "सेक्शन", actions: "एक्शन",
    darkMode: "डार्क मोड", lightMode: "लाइट मोड",
  },
} as const;

type Widen<T> = T extends string ? string : { -readonly [K in keyof T]: Widen<T[K]> };
export type Dict = Widen<typeof raw.en>;
/** Type-checked: the Hindi dictionary must contain exactly the same keys as English. */
export const dictionaries: Record<Locale, Dict> = raw;

/**
 * Replaces every `xxx` field with `xxxHi` when the locale is Hindi and the
 * translation is non-empty. Works on any DB row that follows the `*Hi` convention.
 */
export function localize<T extends object>(row: T, locale: Locale): T {
  if (locale !== "hi") return row;
  const src = row as Record<string, unknown>;
  const out: Record<string, unknown> = { ...src };
  for (const key of Object.keys(src)) {
    if (!key.endsWith("Hi")) continue;
    const base = key.slice(0, -2);
    const v = src[key];
    const has = Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim() !== "";
    if (has && base in src) out[base] = v;
  }
  return out as T;
}
