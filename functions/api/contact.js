// Cloudflare Pages Function: POST /api/contact
// Sends the contact form to the owner through the Gmail API (scope: gmail.send).
// Env vars (Pages → Settings → Variables and Secrets):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN  (secrets)
//   CONTACT_TO    (optional) — defaults to the +websportal alias, for Gmail filters
//   CONTACT_FROM  (optional) — must be the authorized Gmail account

const DEFAULT_TO = "ankbape+websportal@gmail.com";
const DEFAULT_FROM = "websportal contact <ankbape@gmail.com>";
const LIMITS = { name: 100, email: 200, company: 120, message: 5000 };

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  // Honeypot: real visitors never fill this hidden field. Pretend success for bots.
  if (data.website) return json({ ok: true });

  const f = {};
  for (const key of Object.keys(LIMITS)) f[key] = String(data[key] ?? "").trim();
  if (!f.name || !f.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    return json({ ok: false, error: "invalid" }, 400);
  }
  if (Object.keys(LIMITS).some((k) => f[k].length > LIMITS[k])) {
    return json({ ok: false, error: "too_long" }, 400);
  }

  const subject = `New inquiry — ${f.name}${f.company ? ` (${f.company})` : ""}`;
  const raw = buildMime({
    from: env.CONTACT_FROM || DEFAULT_FROM,
    to: env.CONTACT_TO || DEFAULT_TO,
    // Strip anything that could inject extra headers.
    replyTo: `"${f.name.replace(/["\\\r\n]/g, "")}" <${f.email.replace(/[\r\n<>]/g, "")}>`,
    subject,
    text: `${f.message}\n\n— ${f.name}${f.company ? `, ${f.company}` : ""}\n${f.email}`,
    html: renderHtml(f),
  });

  try {
    const token = await getAccessToken(env);
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
    });
    if (!res.ok) throw new Error(`Gmail ${res.status}: ${await res.text()}`);
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "send_failed" }, 502);
  }
  return json({ ok: true });
}

async function getAccessToken(env) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`OAuth ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}

// UTF-8 → base64 (btoa alone only handles Latin-1).
function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

// RFC 2822 multipart/alternative message, base64url-encoded as Gmail expects.
function buildMime({ from, to, replyTo, subject, text, html }) {
  const boundary = `wp_${crypto.randomUUID()}`;
  const wrap = (s) => s.replace(/.{1,76}/g, "$&\r\n");
  const mime = [
    `From: ${from}`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap(b64(text)),
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap(b64(html)),
    `--${boundary}--`,
  ].join("\r\n");
  return b64(mime).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// Email-client-safe HTML: tables + inline styles, site palette.
function renderHtml(f) {
  const row = (label, value) => `
    <tr>
      <td style="padding:6px 0;width:90px;color:#3c6e71;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;color:#353535;font-size:15px;">${value}</td>
    </tr>`;
  const date = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f2f4f5;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f5;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #d9d9d9;">
        <tr><td style="background:linear-gradient(135deg,#284b63,#3c6e71);background-color:#284b63;padding:24px 28px;">
          <div style="color:#ffffff;font-size:20px;font-weight:700;">websportal<span style="color:#d9d9d9;font-family:Consolas,monospace;font-size:15px;">.dev</span></div>
          <div style="color:#d9d9d9;font-size:13px;margin-top:4px;">New contact form submission</div>
        </td></tr>
        <tr><td style="padding:24px 28px 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            ${row("Name", esc(f.name))}
            ${row("Email", `<a href="mailto:${esc(f.email)}" style="color:#284b63;">${esc(f.email)}</a>`)}
            ${f.company ? row("Company", esc(f.company)) : ""}
          </table>
        </td></tr>
        <tr><td style="padding:8px 28px 24px;">
          <div style="color:#3c6e71;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">Project</div>
          <div style="background:#f7f8f9;border-left:3px solid #3c6e71;border-radius:6px;padding:14px 16px;color:#353535;font-size:15px;line-height:1.6;white-space:pre-wrap;">${esc(f.message)}</div>
        </td></tr>
        <tr><td style="padding:0 28px 28px;">
          <a href="mailto:${esc(f.email)}?subject=${encodeURIComponent("Re: your project inquiry")}" style="display:inline-block;background:#284b63;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 20px;border-radius:8px;">Reply to ${esc(f.name)}</a>
        </td></tr>
        <tr><td style="background:#353535;color:#d9d9d9;font-size:12px;padding:14px 28px;">Sent from websportal.dev/contact · ${date} UTC</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
