document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("composer");
  const output = document.getElementById("output");

  const generateBtn = document.getElementById("generateBtn");
  const clearBtn = document.getElementById("clearBtn");

  const csvFile = document.getElementById("csvFile");
  const downloadTemplateBtn = document.getElementById("downloadTemplateBtn");
  const generateBulkBtn = document.getElementById("generateBulkBtn");
  const bulkStatus = document.getElementById("bulkStatus");

  function generateDraft() {
    const business = businessName.value.trim();
    const sender = senderName.value.trim();
    const recipient = recipientName.value.trim();
    const industry = industry.value.trim();
    const goals = goals.value.trim();
    const extraText = extra.value.trim();
    const type = messageType.value;

    // Basic required fields check (so it doesn't "do nothing")
    if (!business || !sender || !recipient) {
      output.style.display = "block";
      output.textContent = "Fill Business name, Sender name, and Recipient name first.";
      return;
    }

    let opener = "";
    let body = "";
    let close = "";

    if (type === "email") {
      opener = `Hi ${recipient},`;
      body =
        extraText ||
        `I’m ${sender} from ${business}. ${
          industry ? `We work with teams in ${industry}.` : ""
        } ${goals || ""}`.trim();
      close = "Open to a quick conversation?";
    } else if (type === "linkedin") {
      opener = `${recipient} — quick note.`;
      body = extraText || `${sender} here from ${business}. ${goals || ""}`.trim();
      close = "Worth a short chat?";
    } else if (type === "followup") {
      opener = `Hi ${recipient}, just circling back.`;
      body =
        extraText ||
        `Wanted to follow up on my last note${goals ? ` about ${goals}` : ""}.`;
      close = "Let me know either way.";
    } else if (type === "inbound-reply") {
      opener = `Hey ${recipient},`;
      body = extraText || `Thanks for reaching out — happy to share more about ${business}.`;
      close = "What’s the best next step?";
    } else {
      // Fallback for any unexpected value
      opener = `Hi ${recipient},`;
      body = extraText || `${sender} from ${business}. ${goals || ""}`.trim();
      close = "Open to a quick chat?";
    }

    output.style.display = "block";
    output.textContent = `${opener}

${body}

${close}

– ${sender}`;
  }

  // ✅ Generate button actually does something now
  generateBtn.addEventListener("click", generateDraft);

  // Optional: allow Enter to generate too
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    generateDraft();
  });

  clearBtn.addEventListener("click", () => {
    form.reset();
    output.style.display = "none";
    output.textContent = "";
  });

  downloadTemplateBtn.addEventListener("click", () => {
    const csv = "name,company,title,email,notes,industry,goals,messageType\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gridforge_template.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // Enable bulk button when a CSV is chosen
  csvFile.addEventListener("change", () => {
    generateBulkBtn.disabled = !(csvFile.files && csvFile.files.length);
    bulkStatus.textContent = "";
  });

  generateBulkBtn.addEventListener("click", () => {
    bulkStatus.textContent = "Bulk wiring works. Backend/API next.";
  });
});
