/* Helper */
const $ = (id) => document.getElementById(id);

/* ===== Single Message Composer ===== */
const single = {
  init() {
    const gen = $("generateBtn");
    const clr = $("clearBtn");
    if (gen) gen.addEventListener("click", this.generate);
    if (clr) clr.addEventListener("click", this.clear);
  },

  async generate(e) {
    e?.preventDefault?.();

    const businessName = $("businessName")?.value?.trim() || "";
    const senderName = $("senderName")?.value?.trim() || "";
    const recipientName = $("recipientName")?.value?.trim() || "";
    const industry = $("industry")?.value?.trim() || "";
    const goals = $("goals")?.value?.trim() || "";
    const messageType = $("messageType")?.value || "email";
    const extra = $("extra")?.value?.trim() || "";

    if (!businessName || !senderName || !recipientName) return;

    const out = $("output");
    if (out) out.value = "Generating…";

    const payload = {
      businessName,
      senderName,
      recipientName,
      industry,
      goals,
      messageType,
      extra,
    };

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // If server returns non-JSON or error, handle cleanly
      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (out) out.value = data?.message || "No content returned.";
    } catch (err) {
      if (out) out.value = "Error generating content. Please try again.";
    }
  },

  clear() {
    ["businessName", "senderName", "recipientName", "industry", "goals", "extra"].forEach(
      (id) => {
        const el = $(id);
        if (el) el.value = "";
      }
    );
    const mt = $("messageType");
    if (mt) mt.value = "email";
    const out = $("output");
    if (out) out.value = "";
  },
};

/* ===== Tiny CSV Utils (handles quotes) ===== */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];

    if (c === '"') {
      if (inQuotes && n === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !inQuotes) {
      if (cell.length || row.length) {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      }
      if (c === "\r" && n === "\n") i++; // handle CRLF
    } else {
      cell += c;
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function toCSV(rows) {
  const esc = (v) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}

/* ===== Bulk Generation ===== */
const bulk = {
  rows: [],
  headers: [],
  results: [],

  init() {
    const file = $("csvFile");
    const gen = $("generateBulkBtn");
    const tpl = $("downloadTemplateBtn");
    const dl = $("downloadResultsBtn");
    const clr = $("clearBulkBtn");

    if (file) file.addEventListener("change", this.loadCSV.bind(this));
    if (gen) gen.addEventListener("click", this.generateAll.bind(this));
    if (tpl) tpl.addEventListener("click", this.downloadTemplate);
    if (dl) dl.addEventListener("click", this.downloadResults.bind(this));
    if (clr) clr.addEventListener("click", this.clear.bind(this));
  },

  requiredHeaders: ["name", "company", "title", "email", "notes", "industry", "goals", "messageType"],

  async loadCSV(e) {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const text = await file.text();
    const raw = parseCSV(text).filter((r) => r.length && r.some((c) => (c || "").trim().length));
    if (!raw.length) return;

    // Normalize headers
    this.headers = raw[0].map((h) => String(h || "").trim());
    const headerLower = this.headers.map((h) => h.toLowerCase());

    const missing = this.requiredHeaders.filter((h) => !headerLower.includes(h.toLowerCase()));
    const status = $("bulkStatus");
    const genBtn = $("generateBulkBtn");
    const clrBtn = $("clearBulkBtn");

    if (missing.length) {
      if (status) status.textContent = `Missing headers: ${missing.join(", ")}`;
      if (genBtn) genBtn.disabled = true;
      if (clrBtn) clrBtn.disabled = false; // allow clearing even if headers are wrong
      this.rows = [];
      this.results = [];
      this.renderPreview(); // will effectively show nothing
      return;
    }

    // Build row objects (use the original header labels as keys)
    this.rows = raw
      .slice(1)
      .map((cols) => {
        const obj = {};
        this.headers.forEach((h, i) => {
          obj[h] = (cols[i] ?? "").toString().trim();
        });
        return obj;
      })
      .filter((r) => Object.values(r).some((v) => (v || "").trim().length));

    if (status) status.textContent = `Loaded ${this.rows.length} rows.`;
    if (genBtn) genBtn.disabled = this.rows.length === 0;
    if (clrBtn) clrBtn.disabled = this.rows.length === 0;

    this.renderPreview();
  },

  renderPreview() {
    const wrap = $("csvPreviewWrap");
    const table = $("csvPreview");
    if (!wrap || !table) return;

    const head = table.querySelector("thead");
    const body = table.querySelector("tbody");
    if (!head || !body) return;

    head.innerHTML =
      "<tr>" + this.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("") + "</tr>";

    const previewRows = this.rows.slice(0, 20);
    body.innerHTML = previewRows
      .map((r) => {
        return (
          "<tr>" +
          this.headers.map((h) => `<td>${escapeHtml(r[h] || "")}</td>`).join("") +
          "</tr>"
        );
      })
      .join("");

    wrap.style.display = "block";
  },

  async generateAll() {
    if (!this.rows.length) return;

    const genBtn = $("generateBulkBtn");
    const dlBtn = $("downloadResultsBtn");
    const status = $("bulkStatus");
    const clrBtn = $("clearBulkBtn");

    if (genBtn) genBtn.disabled = true;
    if (dlBtn) dlBtn.disabled = true;
    if (status) status.textContent = `Generating ${this.rows.length} messages…`;

    try {
      const res = await fetch("/api/generate-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: this.rows }),
      });

      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Non-JSON response from /api/generate-bulk");
      }

      if (!data || !Array.isArray(data.results)) throw new Error("Bad response shape");
      this.results = data.results;

      this.renderResults();

      if (status) status.textContent = `Done. Generated ${this.results.length} messages.`;
      if (dlBtn) dlBtn.disabled = this.results.length === 0;
      if (clrBtn) clrBtn.disabled = false;
    } catch (err) {
      if (status) status.textContent = "Error during bulk generation. Try again.";
    } finally {
      if (genBtn) genBtn.disabled = false;
    }
  },

  renderResults() {
    const wrap = $("bulkTableWrap");
    const table = $("bulkTable");
    const count = $("bulkCount");
    if (!wrap || !table || !count) return;

    const body = table.querySelector("tbody");
    if (!body) return;

    count.textContent = `${this.results.length} results`;

    body.innerHTML = this.results
      .map((r, i) => {
        const msg = (r.message || "").replace(/\n/g, "<br>");
        return `
          <tr>
            <td>${i + 1}</td>
            <td>${escapeHtml(r.name || "")}</td>
            <td>${escapeHtml(r.company || "")}</td>
            <td>${escapeHtml(r.email || "")}</td>
            <td>${escapeHtmlAllowBr(msg)}</td>
          </tr>
        `;
      })
      .join("");

    wrap.style.display = this.results.length ? "block" : "none";
  },

  downloadTemplate() {
    const headers = ["name", "company", "title", "email", "notes", "industry", "goals", "messageType"];
    const sample = [
      headers,
      [
        "Jordan Patel",
        "Northwind Robotics",
        "COO",
        "jordan.patel@example.com",
        "Evaluating automation in packaging",
        "Manufacturing",
        "Intro call about deploying robotics in packaging",
        "email",
      ],
    ];

    const blob = new Blob([toCSV(sample)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gridforge_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  },

  downloadResults() {
    if (!this.results.length) return;

    const headers = ["name", "company", "title", "email", "message"];
    const rows = [headers, ...this.results.map((r) => headers.map((h) => r[h] ?? ""))];

    const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gridforge_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  },

  clear() {
    this.rows = [];
    this.headers = [];
    this.results = [];

    const file = $("csvFile");
    if (file) file.value = "";

    const prev = $("csvPreviewWrap");
    if (prev) prev.style.display = "none";

    const wrap = $("bulkTableWrap");
    if (wrap) wrap.style.display = "none";

    const count = $("bulkCount");
    if (count) count.textContent = "No results yet.";

    const status = $("bulkStatus");
    if (status) status.textContent = "";

    const genBtn = $("generateBulkBtn");
    const dlBtn = $("downloadResultsBtn");
    const clrBtn = $("clearBulkBtn");

    if (genBtn) genBtn.disabled = true;
    if (dlBtn) dlBtn.disabled = true;
    if (clrBtn) clrBtn.disabled = true;
  },
};

/* ===== Simple HTML escaping helpers (prevents broken tables / accidental markup) ===== */
function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Allows <br> only (used for message cell)
function escapeHtmlAllowBr(s) {
  const tmp = String(s ?? "");
  // First escape everything, then re-allow literal <br> that we inserted
  return escapeHtml(tmp).replace(/&lt;br&gt;/g, "<br>");
}

/* Init */
single.init();
bulk.init();
