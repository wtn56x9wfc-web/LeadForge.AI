import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { businessName, senderName, recipientName, industry, goals, extra, messageType } = req.body;

  const prompt = `
Create a ${messageType} outreach message.
Business: ${businessName}
Sender: ${senderName}
Recipient: ${recipientName}
Industry: ${industry}
Goals: ${goals}
Additional Info: ${extra || "None"}
`;

  try {
    const completion = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });

    res.status(200).json({
      message: completion.output_text
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
