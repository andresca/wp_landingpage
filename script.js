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

// Contact form: posts to the Pages Function at /api/contact, which emails via Resend.
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  const btn = form.querySelector("button[type=submit]");
  const MSG = {
    sending: { en: "Sending…", es: "Enviando…" },
    ok: { en: "Your message was sent. I'll be in touch soon!", es: "Tu mensaje fue enviado. ¡Te contactaré pronto!" },
    error: { en: "Something went wrong. Please try again or email me directly.", es: "Algo salió mal. Inténtalo de nuevo o escríbeme directamente." },
  };
  const show = (key, cls) => {
    status.textContent = MSG[key][document.documentElement.lang === "es" ? "es" : "en"];
    status.className = `form-status ${cls || ""}`;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    show("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      show("ok", "ok");
    } catch (_) {
      show("error", "error");
    } finally {
      btn.disabled = false;
    }
  });
})();
