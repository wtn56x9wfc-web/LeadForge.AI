const fetch = require("node-fetch");

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: "Missing email or message" });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.SEND_FROM,
        to,
        subject: "Message from LeadForge.ai",
        html: `<pre>${message}</pre>`
      })
    });

    const json = await emailRes.json();

    return res.status(200).json(json);

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    return res.status(500).json({ error: "Email send error" });
  }
};
