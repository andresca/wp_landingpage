document.getElementById("year").textContent = new Date().getFullYear();

// Owner-only console button.
// Visit https://websportal.dev/?owner=<OWNER_KEY> once on your device to unlock it;
// ?owner=off hides it again. This only HIDES the button — the console itself
// must be protected server-side (e.g. Cloudflare Access on console.websportal.dev).
(function () {
  const OWNER_KEY = "change-me-to-a-long-random-string";
  const STORAGE = "wp_owner";
  const btn = document.getElementById("console-btn");
  try {
    const params = new URLSearchParams(location.search);
    const key = params.get("owner");
    if (key === OWNER_KEY) localStorage.setItem(STORAGE, "1");
    if (key === "off") localStorage.removeItem(STORAGE);
    if (key !== null) history.replaceState(null, "", location.pathname + location.hash);
    if (localStorage.getItem(STORAGE) === "1") btn.hidden = false;
  } catch (_) { /* storage blocked: keep hidden */ }
})();

// EN/ES toggle: Spanish text lives in data-es attributes; English is read from the page.
(function () {
  const els = document.querySelectorAll("[data-es]");
  els.forEach((el) => (el.dataset.en = el.innerHTML));
  const btn = document.getElementById("lang-btn");

  function setLang(lang) {
    els.forEach((el) => (el.innerHTML = el.dataset[lang]));
    document.documentElement.lang = lang;
    btn.textContent = lang === "en" ? "ES" : "EN";
    try { localStorage.setItem("wp_lang", lang); } catch (_) {}
  }

  let initial = "en";
  try { initial = localStorage.getItem("wp_lang") || (navigator.language.startsWith("es") ? "es" : "en"); } catch (_) {}
  if (initial === "es") setLang("es");
  btn.addEventListener("click", () => setLang(document.documentElement.lang === "en" ? "es" : "en"));
})();

// Mobile menu toggle.
(function () {
  const btn = document.getElementById("menu-btn");
  const nav = document.getElementById("site-nav");
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
})();

// Contact form: no backend yet, so compose an email in the visitor's mail app.
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const subject = `Project inquiry — ${d.get("name")}${d.get("company") ? ` (${d.get("company")})` : ""}`;
    const body = `${d.get("message")}

— ${d.get("name")}
${d.get("email")}`;
    location.href = `mailto:ankbape@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
