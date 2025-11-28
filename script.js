document.getElementById("generateBtn").addEventListener("click", async () => {
  const businessName = document.getElementById("businessName").value.trim();
  const senderName = document.getElementById("senderName").value.trim();
  const recipientName = document.getElementById("recipientName").value.trim();
  const industry = document.getElementById("industry").value.trim();
  const goals = document.getElementById("goals").value.trim();

  const output = document.getElementById("output");
  output.innerHTML = "Generating...";

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      businessName,
      senderName,
      recipientName,
      industry,
      goals
    })
  });

  const data = await response.json();
  output.innerHTML = data.message || "Error generating message.";
});
