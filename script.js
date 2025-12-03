document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("generateBtn");
  const output = document.getElementById("output");

  btn.addEventListener("click", async () => {
    const businessName = document.getElementById("businessName").value.trim();
    const senderName = document.getElementById("senderName").value.trim();
    const recipientName = document.getElementById("recipientName").value.trim();
    const industry = document.getElementById("industry").value.trim();
    const goals = document.getElementById("goals").value.trim();
    const extra = document.getElementById("extra").value.trim();
    const messageType = document.getElementById("messageType").value;

    if (!businessName || !senderName || !recipientName || !industry) {
      output.classList.remove("hidden");
      output.value = "Please fill out all required fields.";
      return;
    }

    output.classList.remove("hidden");
    output.value = "Generating...";

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
        })
      });

      const data = await res.json();

      if (data.error) {
        output.value = "Error: " + data.error;
        return;
      }

      output.value = data.message;
    } catch (err) {
      output.value = "Request failed: " + err.message;
    }
  });
});
