const generateBtn = document.getElementById("generateBtn");
const loader = document.getElementById("loader");
const outputSection = document.getElementById("outputSection");
const outputText = document.getElementById("outputText");
const copyBtn = document.getElementById("copyBtn");

// Smooth Show
function show(el) {
  el.classList.remove("hidden");
  el.style.opacity = 0;
  setTimeout(() => (el.style.opacity = 1), 30);
}

// Smooth Hide
function hide(el) {
  el.style.opacity = 0;
  setTimeout(() => el.classList.add("hidden"), 150);
}

generateBtn.addEventListener("click", async () => {
  // Gather form data
  const body = {
    businessName: document.getElementById("businessName").value.trim(),
    senderName: document.getElementById("senderName").value.trim(),
    recipientName: document.getElementById("recipientName").value.trim(),
    industry: document.getElementById("industry").value.trim(),
    goal: document.getElementById("goal").value.trim(),
    tone: document.getElementById("tone").value,
    messageType: document.getElementById("messageType").value,
    extraContext: document.getElementById("extraContext").value.trim()
  };

  // Basic validation
  if (!body.businessName || !body.senderName) {
    outputText.textContent = "Please fill in Business Name and Your Name.";
    show(outputSection);
    return;
  }

  // Reset UI
  hide(outputSection);
  show(loader);

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    hide(loader);

    // Handle API error
    if (data.error) {
      outputText.textContent = "Error: " + (data.details || data.error);
      show(outputSection);
      return;
    }

    // Show generated output
    outputText.textContent = data.output?.trim() || "No message returned.";
    show(outputSection);

    // Scroll smoothly to output
    outputSection.scrollIntoView({ behavior: "smooth" });

  } catch (err) {
    hide(loader);
    outputText.textContent = "Server error. Try again.";
    show(outputSection);
    console.error(err);
  }
});

copyBtn.addEventListener("click", () => {
  const text = outputText.textContent;
  navigator.clipboard.writeText(text);

  // Animate button feedback
  const original = copyBtn.textContent;
  copyBtn.textContent = "Copied ✓";
  copyBtn.style.background = "#4caf50";

  setTimeout(() => {
    copyBtn.textContent = original;
    copyBtn.style.background = "";
  }, 1200);
});
