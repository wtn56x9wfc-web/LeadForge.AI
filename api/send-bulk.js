// api/send-bulk.js
// Sends bulk emails using Resend + supports user "reply-to" so replies go to THEM.

const ALLOWED_ORIGINS = ["*"]; // keep simple for now

async function sendOneEmail({ to, subject, html, text, from, replyTo }, apiKey) {
  const payload = {
    from,
    to,
    subject: subject || "Quick note",
    html: html || "<p>(empty)</p>",
    text: text || "",
    reply_to: replyTo || undefined, // ← user reply-to support
  };

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    throw new Error(data?.message || `HTTP ${resp.status}`);
  }

  return data;
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const defaultFrom = process.env.FROM_EMAIL;

    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "Missing RESEND_API_KEY" });
    }

    let body = req.body;
    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const { from, replyTo, emails } = body || {};

    const sender = from || defaultFrom;
    if (!sender) {
      return res.status(400).json({
        ok: false,
        error: 'Missing "from". Add FROM_EMAIL env var.',
      });
    }

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ ok: false, error: "No emails provided" });
    }

    const results = [];
    const concurrency = 5;
    let index = 0;

    async function worker() {
      while (index < emails.length) {
        const i = index++;
        const e = emails[i];
        const to = e.to || e.email;

        if (!to) {
          results[i] = {
            ok: false,
            to: "",
            error: "Missing recipient email",
          };
          conti
