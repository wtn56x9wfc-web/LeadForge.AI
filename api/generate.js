const fetch = require("node-fetch");

// ---- MESSAGE TYPE TEMPLATE LIBRARY ---- //
const templates = {
  cold_email_short: `
Write a short, punchy cold email. 
Keep it under 120 words. 
Hook fast. No fluff.
Use a clear CTA at the end.`,

  cold_email_long: `
Write a longer, structured cold email with:
- a strong opener,
- value proposition,
- credibility,
- social proof (general),
- a soft CTA.
150–220 words.`,

  linkedin_dm: `
Write a concise, professional LinkedIn DM.
Friendly, mildly formal.
Focus on starting a conversation, not selling hard.`,

  instagram_dm: `
Write a casual Instagram DM.
Short, human, friendly.
Very conversational, low pressure.`,

  facebook_dm: `
Write a Facebook Messenger outreach message.
Warm, approachable, relatable.
Use friendly conversational tone but stay clear.`,

  sms_pitch: `
Write a VERY short SMS pitch (1-2 sentences).
No fluff. Respectfully direct.
Max 25–35 words.`,

  follow_up: `
Write a follow-up message referencing a previous unanswered outreach.
Short, respectful, persistent but not needy.`,

  apology: `
Write an apology outreach message.
Clear ownership, short explanation, reassurance, and professional tone.`,

  testimonial: `
Write a warm message requesting a testimonial or review.
Keep it simple and positive. Include a link placeholder.`,

  sales_pitch: `
Write a strong, direct sales pitch.
Concise benefit statement.
Clear problem → solution flow.
Strong CTA at the end.`
};



module.exports = async function handler(req, res) {
  // Basic CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      businessName = "",
      senderName = "",
      recipientName = "",
      industry = "",
      goal = "",
      tone = "professional",
      messageType = "",
      extraContext = ""
    } = req.body;

    // Validation
    if (!businessName || !senderName || !messageType) {
      return res.status(400).json({
        error: "Missing required fields.",
        details: { businessName, senderName, messageType }
      });
    }

    // Pick template (fallback if missing)
    const template = templates[messageType] || "Write a clean outreach message.";

    // ---- FINAL PROMPT ---- //
    const prompt = `
${template}

BUSINESS INFORMATION:
Business Name: ${businessName}
Sender Name: ${senderName}
Recipient Name: ${recipientName || "N/A"}
Industry: ${industry || "N/A"}
Goal: ${goal || "N/A"}

Tone Style: ${tone}
Extra Context: ${extraContext || "None"}

RULES:
- No cringe fake enthusiasm.
- No emojis unless the platform tone naturally fits (IG optional).
- Keep messaging direct, human, and natural.
- Avoid sounding like ChatGPT.
- Do NOT include headings like "Subject:" unless appropriate for an email.
- For DMs/SMS, do NOT start with formal greetings.
`.trim();

    // ---- OPENAI CALL ---- //
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are LeadForge — the best outreach copywriter alive. You write concise, high-conversion, non-cringe outreach messages for real businesses."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const json = await apiRes.json();

    if (!apiRes.ok) {
      return res.status(500).json({
        error: "OpenAI API Error",
        details: json
      });
    }

    const output = json.choices?.[0]?.message?.content?.trim() || "No response.";

    return res.status(200).json({ output });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
};
