export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { prompt } = req.body;
  const businessMatch = /Business: (.*)/.exec(prompt);
  const goalMatch = /Goal: (.*)/.exec(prompt);
  const business = businessMatch ? businessMatch[1].trim() : '';
  const goal = goalMatch ? goalMatch[1].trim() : '';
  const text = `Email 1: Hello! I hope you're doing well. I'm reaching out from ${business} because we specialize in helping people ${goal}. We'd love to connect and see how we can support you.
Email 2: Hi there! I noticed your interest in ${goal}. At ${business}, we've guided many clients to success. Let me know if you'd like a quick chat.
Generic social media DM: Hi! Saw you're interested in ${goal}. ${business} can help you make it happen—would you like to hear more?
Facebook DM: Hello! I'm with ${business}. We assist people like you to ${goal}. Are you open to a brief conversation?
SMS: Hi! This is ${business}. We help people ${goal}. Interested? Reply and we can talk!
Video Script: Hi, I'm from ${business}. We help people ${goal}. If you're looking for friendly, professional support, let's connect.`;
  return res.status(200).json({ text });
}
