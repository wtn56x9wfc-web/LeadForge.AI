document.getElementById("generateBtn").addEventListener("click", async () => {
  const businessName = document.getElementById("businessName").value.trim();
  const senderName = document.getElementById("senderName").value.trim();
  const recipientName = document.getElementById("recipientName").value.trim();
  const industry = document.getElementById("industry").value.trim();
  const goal = document.getElementById("goal").value.trim();
  const tone = document.getElementById("tone").value;
  const messageType = document.getElementById("messageType").value;
  const extraContext = document.getElementById("extraContext").value.trim();

  const loader = document.getElementById("loader");
  const output = document.getElementById("outputSection");
  const outputText = document.getElementById("outputText");

  output.classList.add("hidden");
  loader.classList.remove("hidden");

  const body = {
    businessName,
    senderName,
    recipientName,
    industry,
    goal,
    tone,
    messageType,
    extraContext,
  };

  try {
    // THE FIX → correct URL path
    const res = await fetch("/api/generate.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    loader.classList.add("hidden");

    outputText.textContent = data.output || "No result";
    output.classList.remove("hidden");

  } catch (err) {
    loader.classList.add("hidden");
    outputText.textContent = "Error generating message.";
    output.classList.remove("hidden");
    console.error("Frontend error:", err);
  }
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const text = document.getElementById("outputText").textContent;
  navigator.clipboard.writeText(text);
  alert("Copied!");
});
