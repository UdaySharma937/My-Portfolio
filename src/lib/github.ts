import "server-only";

export interface GithubRepo { name: string; description: string; url: string; stars: number; forks: number; language: string }
export interface GithubDay { date: string; count: number; level: number }
export interface GithubData {
  login: string; name: string; avatar: string; url: string;
  followers: number; publicRepos: number; stars: number;
  repos: GithubRepo[]; days: GithubDay[] | null; totalContributions: number | null;
}

const API = "https://api.github.com";
const REVALIDATE = 3600; // ISR-style cache: refresh at most once per hour

function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "mars-portfolio" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { headers: headers(), next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null; // 403 = rate limited, 404 = unknown user → degrade gracefully
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const LEVELS: Record<string, number> = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

/** Pinned repos + contribution calendar via GraphQL (needs GITHUB_TOKEN). */
async function graphql(login: string) {
  if (!process.env.GITHUB_TOKEN) return null;
  try {
    const res = await fetch(`${API}/graphql`, {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query($login:String!){user(login:$login){
          pinnedItems(first:6,types:REPOSITORY){nodes{... on Repository{name description url stargazerCount forkCount primaryLanguage{name}}}}
          contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel}}}}
        }}`,
        variables: { login },
      }),
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const u = json?.data?.user;
    if (!u) return null;
    const repos: GithubRepo[] = (u.pinnedItems?.nodes ?? []).map((n: Record<string, any>) => ({
      name: n.name, description: n.description ?? "", url: n.url, stars: n.stargazerCount, forks: n.forkCount, language: n.primaryLanguage?.name ?? "",
    }));
    const cal = u.contributionsCollection?.contributionCalendar;
    const days: GithubDay[] = (cal?.weeks ?? []).flatMap((w: any) =>
      w.contributionDays.map((d: any) => ({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 })),
    );
    return { repos, days, total: (cal?.totalContributions as number) ?? null };
  } catch {
    return null;
  }
}

/** Token-less fallback for the contribution graph (public community API). */
async function publicCalendar(login: string) {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(login)}?y=last`, {
      next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { total?: Record<string, number>; contributions?: GithubDay[] };
    const days = (json.contributions ?? []).map((d) => ({ date: d.date, count: d.count, level: d.level }));
    const total = Object.values(json.total ?? {}).reduce((a, b) => a + b, 0);
    return days.length ? { days, total } : null;
  } catch {
    return null;
  }
}

export async function getGithubData(login: string): Promise<GithubData | null> {
  const user = login.trim();
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(user)) return null;
  const profile = await gh<Record<string, any>>(`/users/${user}`);
  if (!profile) return null;
  const [repoList, gql] = await Promise.all([
    gh<Array<Record<string, any>>>(`/users/${user}/repos?per_page=100&sort=updated&type=owner`),
    graphql(user),
  ]);
  const all = (repoList ?? []).filter((r) => !r.fork);
  const mapped: GithubRepo[] = all
    .map((r) => ({ name: r.name, description: r.description ?? "", url: r.html_url, stars: r.stargazers_count ?? 0, forks: r.forks_count ?? 0, language: r.language ?? "" }))
    .sort((a, b) => b.stars - a.stars);
  const cal = gql ? { days: gql.days, total: gql.total } : await publicCalendar(user);
  return {
    login: profile.login, name: profile.name ?? profile.login, avatar: profile.avatar_url, url: profile.html_url,
    followers: profile.followers ?? 0, publicRepos: profile.public_repos ?? 0,
    stars: mapped.reduce((n, r) => n + r.stars, 0),
    repos: (gql?.repos.length ? gql.repos : mapped).slice(0, 6),
    days: cal?.days?.length ? cal.days : null,
    totalContributions: cal?.total ?? null,
  };
}
