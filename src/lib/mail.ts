import "server-only";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Sends the "new message" notification via Resend's REST API. No-ops if not configured. */
export async function sendContactEmail(m: { name: string; email: string; subject: string; message: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_RECEIVER_EMAIL;
  if (!key || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: m.email,
        subject: `New message: ${m.subject || "Portfolio contact"}`.slice(0, 200),
        html: `<h2>New portfolio message</h2><p><b>From:</b> ${esc(m.name)} &lt;${esc(m.email)}&gt;</p><p><b>Subject:</b> ${esc(m.subject || "—")}</p><hr/><p style="white-space:pre-wrap">${esc(m.message)}</p>`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
