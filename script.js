document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const form = $("composer");
  const output = $("output");

  const generateBtn = $("generateBtn");
  const clearBtn = $("clearBtn");

  const csvFile = $("csvFile");
  const downloadTemplateBtn = $("downloadTemplateBtn");
  const generateBulkBtn = $("generateBulkBtn");
  const bulkStatus = $("bulkStatus");

  const businessEl = $("businessName");
  const senderEl = $("senderName");
  const recipientEl = $("recipientName");
  const industryEl = $("industry");
  const goalsEl = $("goals");
  const typeEl = $("messageType");
  const extraEl = $("extra");

  function stablePick(options, seedStr) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
    return options[hash % options.length];
  }
  const t = (v) => (v || "").toString().trim();

  function showOutput(text) {
    output.style.display = "block";
    output.value = text; // textarea uses value
  }

  function buildEmail({ business, sender, recipient, industry, goals, extra, seed }) {
    const subjects = [
      `Quick question, ${recipient}`,
      `${business} x ${recipient}`,
      `Idea for ${industry || "your team"}`,
      `2-minute question`,
      `Not sure if this is relevant`
    ];
    const openers = [`Hi ${recipient},`, `Hey ${recipient},`, `${recipient} — quick note.`];
    const firstLines = [
      `I’m ${sender} with ${business}.`,
      `${sender} here from ${business}.`,
      `My name’s ${sender} — reaching out from ${business}.`
    ];

    const middle =
      goals ? `Reason I’m reaching out: ${goals}.`
      : industry ? `We work with teams in ${industry}.`
      : `I think there may be a fit based on what you do.`;

    const valueLines = [
      `If it makes sense, I can send a 3-bullet summary and you can tell me if it’s worth a call.`,
      `Happy to send context first so you’re not wasting time on a call.`,
      `If you want, I’ll send a quick breakdown and you can decide if it’s relevant.`
    ];
    const closes = [
      `Open to a quick 10 minutes this week?`,
      `Worth a short call, or should I send the summary instead?`,
      `Want me to send the quick rundown?`
    ];

    const subject = stablePick(subjects, seed + "s");
    const opener = stablePick(openers, seed + "o");
    const first = stablePick(firstLines, seed + "f");
    const value = stablePick(valueLines, seed + "v");
    const close = stablePick(closes, seed + "c");

    if (extra) {
      return `Subject: ${subject}\n\n${opener}\n\n${extra}\n\n${close}\n\n– ${sender}`;
    }
    return `Subject: ${subject}\n\n${opener}\n\n${first} ${middle}\n\n${value}\n\n${close}\n\n– ${sender}`;
  }

  function buildLinkedIn({ business, sender, recipient, industry, goals, extra, seed }) {
    const openers = [
      `Hey ${recipient} — quick note.`,
      `${recipient} — quick question.`,
      `Hey ${recipient}, hope your day’s going well.`
    ];
    const bodies = [
      `I’m ${sender} with ${business}. ${goals ? `We help with ${goals}.` : "Wanted to see if this is on your radar."}`,
      `${sender} here from ${business}. ${industry ? `We work with teams in ${industry}.` : ""} ${goals ? `The goal is ${goals}.` : ""}`.trim(),
      `I run outreach at ${business}. ${goals ? `We’re focused on ${goals}.` : "Trying to connect with the right person."}`
    ];
    const closes = [
      `Are you the right person to ask about this?`,
      `If you’re not the right contact, who should I talk to?`,
      `Want me to send a quick 2–3 line summary?`
    ];
    const opener = stablePick(openers, seed + "o");
    const body = extra || stablePick(bodies, seed + "b");
    const close = stablePick(closes, seed + "c");
    return `${opener}\n\n${body}\n\n${close}\n\n– ${sender}`;
  }

  function buildFollowUp({ sender, recipient, goals, extra, seed }) {
    const openers = [
      `Hi ${recipient} — quick follow-up.`,
      `Hey ${recipient}, circling back.`,
      `${recipient}, bumping this in case it got buried.`
    ];
    const bodies = [
      goals ? `Still interested in ${goals}, if this is a priority right now.` : `Just wanted to see if this is worth a look.`,
      `Totally fine if timing’s off — just trying to get you the right info.`,
      `If it’s a “not now,” I can circle back later.`
    ];
    const closes = [
      `Should I close the loop, or is this worth a quick chat?`,
      `Want me to send the short summary instead of doing a call?`,
      `What’s the right next step on your end?`
    ];
    const opener = stablePick(openers, seed + "o");
    const body = extra || stablePick(bodies, seed + "b");
    const close = stablePick(closes, seed + "c");
    return `${opener}\n\n${body}\n\n${close}\n\n– ${sender}`;
  }

  function buildInboundReply({ business, sender, recipient, extra, seed }) {
    const openers = [
      `Hey ${recipient} — thanks for reaching out.`,
      `Hi ${recipient}, appreciate the note.`,
      `Hey ${recipient}, good to connect.`
    ];
    const bodies = [
      `Happy to share more about ${business}. What outcome are you aiming for right now?`,
      `Quick question so I don’t waste your time: what are you trying to solve?`,
      `Before I send details, what’s the main priority on your side?`
    ];
    const closes = [
      `If you answer that, I’ll send the most relevant next step.`,
      `Once I know that, I can share a clean plan.`,
      `From there I can suggest the best path.`
    ];
    const opener = stablePick(openers, seed + "o");
    const body = extra || stablePick(bodies, seed + "b");
    const close = stablePick(closes, seed + "c");
    return `${opener}\n\n${body}\n\n${close}\n\n– ${sender}`;
  }

  function generateDraft() {
    const business = t(businessEl.value);
    const sender = t(senderEl.value);
    const recipient = t(recipientEl.value);
    const industry = t(industryEl.value);
    const goals = t(goalsEl.value);
    const extra = t(extraEl.value);
    const type = t(typeEl.value);

    if (!business || !sender || !recipient) {
      showOutput("Fill Business name, Your name, and Recipient name first.");
      return;
    }

    const seed = `${business}|${sender}|${recipient}|${industry}|${goals}|${type}`;

    let text = "";
    if (type === "email") text = buildEmail({ business, sender, recipient, industry, goals, extra, seed });
    else if (type === "linkedin") text = buildLinkedIn({ business, sender, recipient, industry, goals, extra, seed });
    else if (type === "followup") text = buildFollowUp({ sender, recipient, goals, extra, seed });
    else if (type === "inbound-reply") text = buildInboundReply({ business, sender, recipient, extra, seed });
    else text = buildEmail({ business, sender, recipient, industry, goals, extra, seed });

    showOutput(text);
  }

  // Generate
  generateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    generateDraft();
  });

  // Enter key won’t submit / reload
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    generateDraft();
  });

  // Clear
  clearBtn.addEventListener("click", () => {
    form.reset();
    output.style.display = "none";
    output.value = "";
    bulkStatus.textContent = "";
    generateBulkBtn.disabled = !(csvFile.files && csvFile.files.length);
  });

  // Template download
  downloadTemplateBtn.addEventListener("click", () => {
    const csv =
      "name,company,title,email,notes,industry,goals,messageType\n" +
      "John Doe,Acme Inc,VP Sales,john@acme.com,Met at event,Manufacturing,book more demos,email\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gridforge_template.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // Bulk button enable
  csvFile.addEventListener("change", () => {
    generateBulkBtn.disabled = !(csvFile.files && csvFile.files.length);
    bulkStatus.textContent = "";
  });

  // Bulk placeholder
  generateBulkBtn.addEventListener("click", () => {
    bulkStatus.textContent = "Bulk generation UI is wired. To generate per-row from CSV, hook this to an /api endpoint next.";
  });
});
