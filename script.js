(() => {
  "use strict";

  const ACCESS_CODE = "forgealpha";
  const ACCESS_STORAGE_KEY = "gridforge_access_ok_v1";

  // HARD BLOCK: hide the whole document immediately to prevent any flash
  const html = document.documentElement;
  const prevVisibility = html.style.visibility;
  html.style.visibility = "hidden";

  function isAccessGranted() {
    return localStorage.getItem(ACCESS_STORAGE_KEY) === "true";
  }

  function setAccessGranted() {
    localStorage.setItem(ACCESS_STORAGE_KEY, "true");
  }

  function showSite() {
    html.style.visibility = prevVisibility || "visible";
  }

  function buildGateOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "gf-access-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "2147483647";
    overlay.style.background = "rgba(0,0,0,0.86)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "16px";

    const card = document.createElement("div");
    card.style.width = "100%";
    card.style.maxWidth = "420px";
    card.style.background = "#0b1220";
    card.style.border = "1px solid rgba(255,255,255,0.10)";
    card.style.borderRadius = "14px";
    card.style.boxShadow = "0 20px 60px rgba(0,0,0,0.55)";
    card.style.padding = "18px";

    const title = document.createElement("div");
    title.textContent = "GridForge Access";
    title.style.fontSize = "18px";
    title.style.fontWeight = "800";
    title.style.color = "rgba(255,255,255,0.95)";
    title.style.marginBottom = "6px";

    const sub = document.createElement("div");
    sub.textContent = "Enter access code to continue.";
    sub.style.fontSize = "13px";
    sub.style.color = "rgba(255,255,255,0.72)";
    sub.style.marginBottom = "12px";

    const input = document.createElement("input");
    input.type = "password";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.placeholder = "Access code";
    input.style.width = "100%";
    input.style.padding = "12px";
    input.style.borderRadius = "10px";
    input.style.border = "1px solid rgba(255,255,255,0.12)";
    input.style.background = "rgba(255,255,255,0.06)";
    input.style.color = "rgba(255,255,255,0.95)";
    input.style.outline = "none";

    const err = document.createElement("div");
    err.textContent = "";
    err.style.marginTop = "10px";
    err.style.fontSize = "12px";
    err.style.color = "rgba(255,90,90,0.95)";
    err.style.minHeight = "16px";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Unlock";
    btn.style.marginTop = "12px";
    btn.style.width = "100%";
    btn.style.padding = "12px";
    btn.style.borderRadius = "10px";
    btn.style.border = "1px solid rgba(255,255,255,0.12)";
    btn.style.background = "rgba(255,255,255,0.10)";
    btn.style.color = "rgba(255,255,255,0.95)";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "800";

    function attempt() {
      const val = (input.value || "").trim();
      if (val === ACCESS_CODE) {
        setAccessGranted();
        overlay.remove();
        showSite();
      } else {
        err.textContent = "Wrong code.";
        input.value = "";
        input.focus();
      }
    }

    btn.addEventListener("click", attempt);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") attempt();
    });

    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(input);
    card.appendChild(err);
    card.appendChild(btn);
    overlay.appendChild(card);

    return { overlay, input };
  }

  function mountGate() {
    const { overlay, input } = buildGateOverlay();

    // Mount ASAP even if body isn't ready yet
    (document.body || document.documentElement).appendChild(overlay);

    // Keep document hidden UNTIL the overlay is mounted (prevents any flash)
    // After overlay is mounted, we can show the document (but it’s still blocked by overlay)
    showSite();

    setTimeout(() => input.focus(), 50);
  }

  // Run immediately
  if (isAccessGranted()) {
    showSite();
  } else {
    mountGate();
  }
})();
