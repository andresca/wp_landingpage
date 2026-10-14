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
  const phs = document.querySelectorAll("[data-es-placeholder]");
  phs.forEach((el) => (el.dataset.enPlaceholder = el.placeholder));
  // Either a single toggle (#lang-btn) or a pill of [data-lang] buttons.
  const btn = document.getElementById("lang-btn");
  const pills = document.querySelectorAll("[data-lang]");

  function setLang(lang) {
    els.forEach((el) => (el.innerHTML = el.dataset[lang]));
    phs.forEach((el) => (el.placeholder = lang === "es" ? el.dataset.esPlaceholder : el.dataset.enPlaceholder));
    document.documentElement.lang = lang;
    if (btn) btn.textContent = lang === "en" ? "ES" : "EN";
    pills.forEach((p) => p.setAttribute("aria-pressed", String(p.dataset.lang === lang)));
    try { localStorage.setItem("wp_lang", lang); } catch (_) {}
  }

  let initial = "en";
  try { initial = localStorage.getItem("wp_lang") || (navigator.language.startsWith("es") ? "es" : "en"); } catch (_) {}
  if (initial === "es") setLang("es");
  if (btn) btn.addEventListener("click", () => setLang(document.documentElement.lang === "en" ? "es" : "en"));
  pills.forEach((p) => p.addEventListener("click", () => setLang(p.dataset.lang)));
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

// Contact form: posts to the Pages Function at /api/contact, which emails via Gmail.
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  const btn = form.querySelector("button[type=submit]");
  const MSG = {
    sending: { en: "Sending…", es: "Enviando…" },
    ok: { en: "Your message was sent. We'll be in touch soon!", es: "Tu mensaje fue enviado. ¡Te contactaremos pronto!" },
    error: { en: "Something went wrong. Please try again or email us directly.", es: "Algo salió mal. Inténtalo de nuevo o escríbenos directamente." },
  };
  const show = (key, cls) => {
    status.textContent = MSG[key][document.documentElement.lang === "es" ? "es" : "en"];
    status.className = `form-status ${cls || ""}`;
  };

  // Object.fromEntries keeps only the last checkbox, so join multi-selects.
  const payload = () => {
    const fd = new FormData(form);
    return { ...Object.fromEntries(fd), services: fd.getAll("services").join(", ") };
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    show("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
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

// Visual effects for the main pages: network background, scroll reveal, card spotlight.
(() => {
  if (!document.querySelector(".glow-effect")) return; // skip legal pages
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const css = document.createElement("style");
  css.textContent = `
    #bg-net { position: fixed; inset: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; transition: opacity .6s; }
    .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s ease; transition-delay: var(--d, 0s); }
    .reveal.in { opacity: 1; transform: none; }
    .spot { position: relative; overflow: hidden; }
    .spot::before { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity .3s;
      background: radial-gradient(360px circle at var(--mx) var(--my), rgba(45,212,191,.12), transparent 60%); }
    .spot:hover::before { opacity: 1; }
    .spot > * { position: relative; }
  `;
  document.head.appendChild(css);

  // Network background
  const c = document.createElement("canvas");
  c.id = "bg-net";
  c.setAttribute("aria-hidden", "true");
  document.body.prepend(c);
  const ctx = c.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const D = 140 * dpr;
  let W, H, pts = [], mouse = { x: -1e4, y: -1e4 };
  const size = () => {
    W = c.width = innerWidth * dpr;
    H = c.height = innerHeight * dpr;
    const n = Math.min(80, Math.floor((innerWidth * innerHeight) / 16000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.4 * dpr, vy: (Math.random() - 0.5) * 0.4 * dpr }));
  };
  size();
  addEventListener("resize", size);
  addEventListener("pointermove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  // Dim the network once the hero is scrolled past so content stays readable
  const dim = () => { c.style.opacity = scrollY > innerHeight * 0.6 ? "0.45" : "1"; };
  addEventListener("scroll", dim, { passive: true });
  dim();
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      if (!reduceMotion) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dm < D * 1.4 && dm > 0) { p.x += (p.x - mouse.x) / dm; p.y += (p.y - mouse.y) / dm; }
      }
      ctx.fillStyle = "rgba(45,212,191,.7)";
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6 * dpr, 0, 7); ctx.fill();
    }
    ctx.lineWidth = dpr;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < D) {
        ctx.strokeStyle = `rgba(6,182,212,${(1 - d / D) * 0.3})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    if (!reduceMotion && !document.hidden) requestAnimationFrame(draw);
  };
  draw();
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !reduceMotion) draw(); });

  // Cursor spotlight on cards
  document.querySelectorAll("main .rounded-2xl.bg-dark-card").forEach((card) => {
    card.classList.add("spot");
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Fade sections and cards in as they scroll into view (skip the hero)
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  const sections = [...document.querySelectorAll("main > section")].slice(1);
  const targets = [];
  sections.forEach((s) => {
    s.querySelectorAll(".text-center.max-w-2xl, .max-w-3xl, h2").forEach((el) => targets.push(el));
    s.querySelectorAll(".grid > *").forEach((el, i) => { el.style.setProperty("--d", `${(i % 4) * 0.1}s`); targets.push(el); });
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  new Set(targets).forEach((el) => { el.classList.add("reveal"); io.observe(el); });
})();
