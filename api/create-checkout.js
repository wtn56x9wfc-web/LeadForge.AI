const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: "https://leadforge.studio/?paid=true",
      cancel_url: "https://leadforge.studio/?paid=false"
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("STRIPE SESSION ERROR:", err);
    return res.status(500).json({ error: "Stripe error", details: err.message });
  }
};
