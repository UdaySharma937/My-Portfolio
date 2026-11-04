"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Archive, ExternalLink, Image as ImageIcon, LayoutDashboard, LogOut, Mail, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { logout } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

interface Props { resources: { key: string; title: string; group: string }[]; unread: number; email: string }

export function AdminShell({ resources, unread, email, children }: Props & { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const item = (href: string, label: string, icon?: React.ReactNode, badge?: number) => {
    const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
    return (
      <Link key={href} href={href} aria-current={active ? "page" : undefined}
        className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition", active ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/30" : "text-muted hover:bg-primary/10 hover:text-fg")}>
        {icon}<span className="flex-1 truncate">{label}</span>
        {!!badge && <span className="rounded-full bg-secondary px-2 text-xs text-white">{badge}</span>}
      </Link>
    );
  };

  const nav = (
    <nav className="flex flex-col gap-5" aria-label="Admin">
      <div className="space-y-1">
        {item("/admin", "Dashboard", <LayoutDashboard className="h-4 w-4" />)}
        {item("/admin/messages", "Messages", <Mail className="h-4 w-4" />, unread)}
      </div>
      {(["Site", "Content"] as const).map((g) => (
        <div key={g} className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted">{g}</p>
          {resources.filter((r) => r.group === g).map((r) => item(`/admin/${r.key}`, r.title))}
        </div>
      ))}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted">System</p>
        {item("/admin/media", "Media library", <ImageIcon className="h-4 w-4" />)}
        {item("/admin/backup", "Backup", <Archive className="h-4 w-4" />)}
      </div>
    </nav>
  );

  const footer = (
    <div className="mt-6 space-y-3 border-t border-line pt-4">
      <p className="truncate px-1 text-xs text-muted" title={email}>{email}</p>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link href="/" target="_blank" className="btn btn-ghost flex-1 !px-3 !py-2.5 !text-sm"><ExternalLink className="h-4 w-4" /> View site</Link>
        <form action={logout}><button type="submit" className="btn btn-ghost !px-3 !py-2.5" aria-label="Log out" title="Log out"><LogOut className="h-4 w-4" /></button></form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:pl-72">
      <aside className="glass fixed bottom-4 left-4 top-4 z-30 hidden w-64 flex-col overflow-y-auto rounded-3xl p-4 lg:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-3 px-2"><span className="planet-static h-9 w-9" aria-hidden /><span className="font-display text-lg font-extrabold">Mission Control</span></Link>
        {nav}{footer}
      </aside>

      <header className="glass sticky top-3 z-30 mx-3 mt-3 flex h-14 items-center justify-between rounded-2xl px-3 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center"><Menu className="h-6 w-6" /></button>
        <span className="font-display font-extrabold">Mission Control</span>
        <ThemeToggle className="h-10 w-10" />
      </header>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="glass-solid fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] overflow-y-auto rounded-r-3xl p-5 lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }}>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="mb-4 grid h-10 w-10 place-items-center"><X className="h-6 w-6" /></button>
              {nav}{footer}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="px-4 py-8 sm:px-8 lg:px-10"><div className="mx-auto max-w-5xl">{children}</div></main>
    </div>
  );
}
