import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const { businessName, senderName, recipientName, industry, goals, extra, messageType } = req.body || {};

  const prompt = `
Generate a sharp, conversion-focused ${messageType} outreach.

Business: ${businessName}
Sender: ${senderName}
Recipient: ${recipientName}
Industry: ${industry}
Goals: ${goals}
Extra context: ${extra}
`.trim();

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.status(200).json({
      message: completion.choices[0].message.content
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
