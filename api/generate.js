const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  // CORS (optional but good practice)
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
      tone = "",
      messageType = "",
      extraContext = ""
    } = req.body;

    // Basic validation
    if (!businessName || !senderName || !recipientName || !messageType) {
      return res.status(400).json({
        error: "Missing required fields. Check businessName, senderName, recipientName, and messageType."
      });
    }

    // Build prompt — clean, professional
    const prompt = `
Generate a ${tone || "natural"} ${messageType} outreach message.

Business Name: ${businessName}
Sender Name: ${senderName}
Recipient Name: ${recipientName}
Industry: ${industry || "N/A"}
Goal: ${goal || "N/A"}
Additional Context: ${extraContext || "None"}

Write it clearly and professionally. No fluff, no cringe. Make it feel like a real outreach message that would get responses.
    `.trim();

    // OpenAI request
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini", // faster + better than 4o-mini for outreach
        messages: [
          {
            role: "system",
            content:
              "You are LeadForge — an expert outreach copywriter. Write sharp, concise, high-conversion outreach messages."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    const json = await apiRes.json();

    // If API error – show useful info
    if (!apiRes.ok) {
      return res.status(500).json({
        error: "OpenAI API Error",
        details: json
      });
    }

    const output = json.choices?.[0]?.message?.content?.trim() || "No response";

    return res.status(200).json({ output });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};
