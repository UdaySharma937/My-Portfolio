import Link from "next/link";
import { count, desc, eq, sql } from "drizzle-orm";
import { Award, Eye, FolderKanban, Mail, PenLine, Plus, Users } from "lucide-react";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import * as s from "@/db/schema";
import { requireAdminPage } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function n(table: PgTable) {
  const [r] = await db.select({ n: count() }).from(table);
  return r.n;
}

export default async function Dashboard() {
  await requireAdminPage();
  const [projects, certs, posts, unread, views, series, top, recentMsgs, rp, rc, rb] = await Promise.all([
    n(s.projects), n(s.certificates), n(s.blogPosts),
    db.select({ n: count() }).from(s.messages).where(eq(s.messages.isRead, false)).then((r) => r[0].n),
    db.execute(sql`select
        count(*) filter (where created_at > now() - interval '1 day')::int as today,
        count(*) filter (where created_at > now() - interval '7 days')::int as week,
        count(*) filter (where created_at > now() - interval '30 days')::int as month,
        count(*)::int as total,
        count(distinct visitor) filter (where created_at > now() - interval '7 days')::int as uniques
      from page_views`),
    db.execute(sql`select to_char(d, 'MM-DD') as day, coalesce(c.n, 0)::int as n
      from generate_series(current_date - 13, current_date, interval '1 day') d
      left join (select created_at::date as day, count(*) as n from page_views group by 1) c on c.day = d::date order by d`),
    db.execute(sql`select path, count(*)::int as n from page_views where created_at > now() - interval '7 days' group by path order by n desc limit 5`),
    db.select().from(s.messages).orderBy(desc(s.messages.createdAt)).limit(4),
    db.select({ t: s.projects.title, u: s.projects.updatedAt }).from(s.projects).orderBy(desc(s.projects.updatedAt)).limit(3),
    db.select({ t: s.certificates.title, u: s.certificates.updatedAt }).from(s.certificates).orderBy(desc(s.certificates.updatedAt)).limit(3),
    db.select({ t: s.blogPosts.title, u: s.blogPosts.updatedAt }).from(s.blogPosts).orderBy(desc(s.blogPosts.updatedAt)).limit(3),
  ]);

  const v = views.rows[0] as { today: number; week: number; month: number; total: number; uniques: number };
  const days = series.rows as { day: string; n: number }[];
  const max = Math.max(1, ...days.map((d) => d.n));
  const activity = [
    ...rp.map((x) => ({ ...x, kind: "Project" })), ...rc.map((x) => ({ ...x, kind: "Certificate" })), ...rb.map((x) => ({ ...x, kind: "Post" })),
  ].sort((a, b) => +b.u - +a.u).slice(0, 6);

  const cards = [
    { label: "Total visits", value: v.total, sub: `${v.today} today · ${v.month} in 30d`, icon: Eye },
    { label: "Unique visitors (7d)", value: v.uniques, sub: `${v.week} page views`, icon: Users },
    { label: "Unread messages", value: unread, sub: "in your inbox", icon: Mail, href: "/admin/messages" },
    { label: "Projects", value: projects, sub: "case studies", icon: FolderKanban, href: "/admin/projects" },
    { label: "Certificates", value: certs, sub: "credentials", icon: Award, href: "/admin/certificates" },
    { label: "Blog posts", value: posts, sub: "notes", icon: PenLine, href: "/admin/blog" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Overview</p>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Dashboard</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {cards.map((c) => {
          const body = (
            <div className="glass h-full rounded-3xl p-4 transition hover:-translate-y-0.5 sm:p-5">
              <c.icon className="h-5 w-5 text-accent" aria-hidden />
              <p className="text-gradient mt-3 font-display text-3xl font-extrabold sm:text-4xl">{c.value}</p>
              <p className="text-sm font-semibold">{c.label}</p>
              <p className="text-xs text-muted">{c.sub}</p>
            </div>
          );
          return c.href ? <Link key={c.label} href={c.href}>{body}</Link> : <div key={c.label}>{body}</div>;
        })}
      </div>

      <section className="glass rounded-3xl p-5 sm:p-6" aria-labelledby="views-h">
        <h2 id="views-h" className="mb-4 font-bold">Page views · last 14 days</h2>
        <div className="flex h-36 items-end gap-1.5" role="img" aria-label="Bar chart of daily page views">
          {days.map((d) => (
            <div key={d.day} className="group flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${d.n}`}>
              <div className="w-full rounded-t-md bg-gradient-to-t from-primary to-secondary transition group-hover:opacity-80" style={{ height: `${Math.max(4, (d.n / max) * 100)}%` }} />
              <span className="hidden text-[10px] text-muted sm:block">{d.day.slice(3)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-3xl p-5 sm:p-6">
          <h2 className="mb-4 font-bold">Recent messages</h2>
          {recentMsgs.length === 0 ? <p className="text-sm text-muted">No messages yet.</p> : (
            <ul className="divide-y divide-line">
              {recentMsgs.map((m) => (
                <li key={m.id} className="py-3"><Link href="/admin/messages" className="block">
                  <p className="flex items-center gap-2 text-sm font-semibold">{!m.isRead && <span className="h-2 w-2 rounded-full bg-secondary" aria-label="unread" />}{m.name}<span className="font-normal text-muted">· {formatDate(m.createdAt, "en", true)}</span></p>
                  <p className="line-clamp-1 text-sm text-muted">{m.subject || m.message}</p>
                </Link></li>
              ))}
            </ul>
          )}
        </section>
        <section className="glass rounded-3xl p-5 sm:p-6">
          <h2 className="mb-4 font-bold">Top pages · 7 days</h2>
          {top.rows.length === 0 ? <p className="text-sm text-muted">No visits recorded yet.</p> : (
            <ul className="space-y-2 text-sm">{(top.rows as { path: string; n: number }[]).map((p) => <li key={p.path} className="flex justify-between gap-3"><span className="truncate font-mono">{p.path}</span><span className="font-bold">{p.n}</span></li>)}</ul>
          )}
        </section>
        <section className="glass rounded-3xl p-5 sm:p-6">
          <h2 className="mb-4 font-bold">Recent activity</h2>
          {activity.length === 0 ? <p className="text-sm text-muted">Nothing edited yet.</p> : (
            <ul className="space-y-2 text-sm">{activity.map((a, i) => <li key={i} className="flex justify-between gap-3"><span className="truncate"><span className="chip mr-2">{a.kind}</span>{a.t}</span><span className="shrink-0 text-muted">{formatDate(a.u, "en", true)}</span></li>)}</ul>
          )}
        </section>
        <section className="glass rounded-3xl p-5 sm:p-6">
          <h2 className="mb-4 font-bold">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            {[["/admin/projects", "Add project"], ["/admin/certificates", "Add certificate"], ["/admin/blog", "Write post"], ["/admin/now", "Update “Now”"], ["/admin/theme", "Tweak theme"]].map(([href, label]) => (
              <Link key={href} href={href} className="btn btn-ghost !px-4 !py-2 !text-sm"><Plus className="h-4 w-4" />{label}</Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
