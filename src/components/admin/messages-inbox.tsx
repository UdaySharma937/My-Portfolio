"use client";

import { useMemo, useState } from "react";
import { CheckCheck, Download, Mail, MailOpen, Reply, Search, Trash2 } from "lucide-react";
import { useConfirm, useToast } from "@/components/admin/ui";
import { deleteMessage, markAllRead, setMessageRead } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

interface Msg { id: number; name: string; email: string; subject: string; message: string; isRead: boolean; createdAt: string }

export function MessagesInbox({ initial }: { initial: Msg[] }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((m) => (!unreadOnly || !m.isRead) && (!s || `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase().includes(s)));
  }, [rows, q, unreadOnly]);

  const read = async (m: Msg, isRead: boolean) => {
    setRows((r) => r.map((x) => (x.id === m.id ? { ...x, isRead } : x)));
    await setMessageRead(m.id, isRead);
  };
  const toggleOpen = (m: Msg) => {
    setOpen(open === m.id ? null : m.id);
    if (!m.isRead) void read(m, true);
  };
  const remove = async (m: Msg) => {
    if (!(await confirm({ title: "Delete this message?", text: `From ${m.name} <${m.email}>`, confirmLabel: "Delete", danger: true }))) return;
    setRows((r) => r.filter((x) => x.id !== m.id));
    await deleteMessage(m.id);
    toast("success", "Message deleted");
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or text…" aria-label="Search messages" className="field !pl-10" />
        </div>
        <button type="button" onClick={() => setUnreadOnly((v) => !v)} aria-pressed={unreadOnly} className={cn("chip px-4 py-2.5 text-sm", unreadOnly && "chip-active")}>Unread only</button>
        <button type="button" className="btn btn-ghost !px-4 !py-2.5 !text-sm" onClick={async () => { await markAllRead(); setRows((r) => r.map((x) => ({ ...x, isRead: true }))); toast("success", "All marked as read"); }}><CheckCheck className="h-4 w-4" /> Mark all read</button>
        <a href="/api/admin/messages/export" className="btn btn-ghost !px-4 !py-2.5 !text-sm"><Download className="h-4 w-4" /> Export CSV</a>
      </div>

      {shown.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center text-muted">{rows.length === 0 ? "No messages yet — they'll appear here when someone uses your contact form." : "No messages match."}</div>
      ) : (
        <ul className="space-y-3">
          {shown.map((m) => (
            <li key={m.id} className={cn("glass overflow-hidden rounded-2xl", !m.isRead && "border-l-4 !border-l-secondary")}>
              <button type="button" onClick={() => toggleOpen(m)} aria-expanded={open === m.id} className="flex w-full items-center gap-3 p-4 text-left">
                {m.isRead ? <MailOpen className="h-5 w-5 shrink-0 text-muted" /> : <Mail className="h-5 w-5 shrink-0 text-secondary" />}
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate", !m.isRead && "font-bold")}>{m.name} <span className="font-normal text-muted">· {m.subject || "(no subject)"}</span></span>
                  <span className="block truncate text-sm text-muted">{m.message}</span>
                </span>
                <time className="hidden shrink-0 text-xs text-muted sm:block" dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleString()}</time>
              </button>
              {open === m.id && (
                <div className="border-t border-line p-4">
                  <p className="text-sm text-muted">From <a className="text-accent underline" href={`mailto:${m.email}`}>{m.email}</a> · {new Date(m.createdAt).toLocaleString()}</p>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed">{m.message}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a className="btn btn-primary !px-4 !py-2 !text-sm" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "your message"}`)}`}><Reply className="h-4 w-4" /> Reply by email</a>
                    <button type="button" className="btn btn-ghost !px-4 !py-2 !text-sm" onClick={() => read(m, !m.isRead)}>{m.isRead ? "Mark unread" : "Mark read"}</button>
                    <button type="button" className="btn btn-ghost !px-4 !py-2 !text-sm hover:!text-red-500" onClick={() => remove(m)}><Trash2 className="h-4 w-4" /> Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
