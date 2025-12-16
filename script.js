document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("composer");
  const output = document.getElementById("output");
  const clearBtn = document.getElementById("clearBtn");
  const downloadTemplateBtn = document.getElementById("downloadTemplateBtn");
  const generateBulkBtn = document.getElementById("generateBulkBtn");
  const bulkStatus = document.getElementById("bulkStatus");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const business = businessName.value.trim();
    const sender = senderName.value.trim();
    const recipient = recipientName.value.trim();
    const industry = industry.value.trim();
    const goals = goals.value.trim();
    const extra = extra.value.trim();
    const type = messageType.value;

    let opener = "";
    let body = "";
    let close = "";

    if (type === "email") {
      opener = `Hi ${recipient},`;
      body = extra || `I’m ${sender} from ${business}. ${industry ? `We work with teams in ${industry}.` : ""} ${goals}`;
      close = "Open to a quick conversation?";
    }

    if (type === "linkedin") {
      opener = `${recipient} — quick note.`;
      body = extra || `${sender} here from ${business}. ${goals}`;
      close = "Worth a short chat?";
    }

    if (type === "followup") {
      opener = `Hi ${recipient}, just circling back.`;
      body = extra || `Wanted to follow up on my last note about ${goals}.`;
      close = "Let me know either way.";
    }

    if (type === "inbound") {
      opener = `Hey ${recipient},`;
      body = extra || `Thanks for reaching out — happy to share more about ${business}.`;
      close = "What’s the best next step?";
    }

    output.style.display = "block";
    output.textContent = `${opener}

${body}

${close}

– ${sender}`;
  });

  clearBtn.onclick = () => {
    form.reset();
    output.style.display = "none";
  };

  downloadTemplateBtn.onclick = () => {
    const csv =
      "name,company,title,email,notes,industry,goals,messageType\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gridforge_template.csv";
    a.click();
  };

  generateBulkBtn.onclick = () => {
    bulkStatus.textContent = "Bulk wiring works. Backend/API next.";
  };
});
