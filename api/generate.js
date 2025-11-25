import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    businessName,
    senderName,
    recipientName,
    industry,
    goal,
    tone,
    messageType,
    extraContext
  } = req.body;

  const prompt = `
Create an outreach message with these rules:
- friendly, clean, not salesy
- personalized
- professional
- short
Tone: ${tone}
Industry: ${industry}
Goal: ${goal}
Business: ${businessName}
Sender: ${senderName}
Recipient: ${recipientName || "Not provided"}
Extra: ${extraContext || "None"}

Return ONLY JSON:
{
  "output": "final message"
}
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "Return ONLY JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    return res.status(200).json(parsed);

  } catch (err) {
    console.error("GENERATION ERROR:", err);
    return res.status(500).json({ error: "Generation failed" });
  }
}
