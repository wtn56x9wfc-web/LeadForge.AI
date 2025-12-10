// api/send-bulk.js
// Serverless endpoint for Vercel or any Node serverless runtime
// Sends emails through Resend's REST API (no SDK required).
// ENV required: RESEND_API_KEY, FROM_EMAIL

const ALLOWED_ORIGINS = ['*']; // lock this down to your domain if you want

async function sendOne({ to, subject, html, text }, apiKey, from) {
  // Prefer HTML; include text fallback if provided
  const payload = {
    from,
    to,
    subject: subject || 'Quick note',
    html: html || (text ? `<pre>${escapeHtml(text)}</pre>` : '<p>(empty)</p>'),
    text: text || undefined,
  };

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = (data && data.message) ? data.message : `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function cors(res) {
  const origin = ALLOWED_ORIGINS[0] || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const defaultFrom = process.env.FROM_EMAIL; // e.g., "Charlie <charlie@yourdomain.com>"

  if (!apiKey) {
    return res.status(500).json({ ok: false, error: 'Missing RESEND_API_KEY' });
  }
  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
  }

  const { from, emails } = body || {};
  const sender = from || defaultFrom;
  if (!sender) {
    return res.status(400).json({ ok: false, error: 'Missing "from". Set FROM_EMAIL env var or include { from } in body.' });
  }
  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ ok: false, error: 'Provide a non-empty "emails" array.' });
  }

  // Soft guardrail
  if (emails.length > 500) {
    return res.status(400).json({ ok: false, error: 'Max 500 emails per request. Batch it.' });
  }

  const results = [];
  // modest concurrency to avoid rate spikes
  const concurrency = 5;
  let index = 0;

  async function worker() {
    while (index < emails.length) {
      const i = index++;
      const item = emails[i];
      const to = item?.to || item?.email;
      if (!to) {
        results[i] = { ok: false, error: 'Missing recipient email', input: item };
        continue;
      }
      try {
        const data = await sendOne(
          {
            to,
            subject: item.subject,
            html: item.html,
            text: item.text || item.body, // allow "body" alias
          },
          apiKey,
          sender
        );
        results[i] = { ok: true, id: data?.id || null, to, subject: item.subject || null };
      } catch (err) {
        results[i] = { ok: false, error: String(err.message || err), to };
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const okCount = results.filter(r => r?.ok).length;
  const failCount = results.length - okCount;

  return res.status(200).json({
    ok: true,
    summary: { total: results.length, sent: okCount, failed: failCount },
    results,
  });
};
