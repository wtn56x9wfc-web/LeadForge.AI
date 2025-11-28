document.getElementById("generateBtn").addEventListener("click", async () => {
  const businessName = document.getElementById("businessName").value.trim();
  const senderName = document.getElementById("senderName").value.trim();
  const recipientName = document.getElementById("recipientName").value.trim();
  const industry = document.getElementById("industry").value.trim();
  const goals = document.getElementById("goals").value.trim();
  const extra = document.getElementById("extra").value.trim();
  const messageType = document.getElementById("messageType").value;

  const output = document.getElementById("output");
  output.classList.remove("hidden");
  output.textContent = "Generating outreach...";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName,
        senderName,
        recipientName,
        industry,
        goals,
        extra,
        messageType
      }),
    });

    const data = await res.json();

    if (data.error) {
      output.textContent = "Server error: " + data.error;
      return;
    }

    output.textContent = data.message || "Error generating outreach.";

  } catch (err) {
    output.textContent = "Network error.";
  }
});

