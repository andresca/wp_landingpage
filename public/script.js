document.documentElement.classList.replace("no-js", "js");

// Icon sprite: pages reference icons with <svg class="ico"><use href="#i-name"/></svg>.
(function () {
  const p = (d) => `<path d="${d}"/>`;
  const icons = {
    "arrow-right": p("M5 12h14M13 6l6 6-6 6"),
    "arrow-up-right": p("M7 17 17 7M8 7h9v9"),
    mail: '<rect x="3" y="5" width="18" height="14" rx="1"/>' + p("m3 7 9 6 9-6"),
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="1"/>' + p("M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"),
    globe: '<circle cx="12" cy="12" r="9"/>' + p("M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"),
    clock: '<circle cx="12" cy="12" r="9"/>' + p("M12 7v5l3 2"),
    "user-check": '<circle cx="9" cy="8" r="4"/>' + p("M2 21a7 7 0 0 1 14 0M16 11l2 2 4-4"),
    code: p("m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"),
    layers: p("m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5"),
    rocket: p("M5 15c-1 1-2 4-2 6 2 0 5-1 6-2M9 15l-3-3c2-6 7-9 15-9 0 8-3 13-9 15l-3-3ZM15 9.01V9"),
    wrench: p("M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 1-5-5L14.7 6.3ZM10 18l-4 4-3-3 4-4"),
    shield: p("M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z") + p("m9 12 2 2 4-4"),
    message: p("M4 5h16v11H9l-5 4V5Z"),
    puzzle: p("M10 4a2 2 0 1 1 4 0v2h4v4h-2a2 2 0 1 0 0 4h2v4h-4v-2a2 2 0 1 0-4 0v2H6v-4h2a2 2 0 1 0 0-4H6V6h4V4Z"),
    dashboard: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
    store: p("M4 9h16l-1-5H5L4 9Zm0 0v11h16V9M9 20v-6h6v6"),
    notebook: '<rect x="5" y="3" width="14" height="18" rx="1"/>' + p("M3 8h4M3 12h4M3 16h4M10 8h6"),
    sparkles: p("M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"),
    send: p("M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z"),
  };
  const sprite = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  sprite.setAttribute("aria-hidden", "true");
  sprite.style.display = "none";
  sprite.innerHTML = Object.entries(icons)
    .map(([id, body]) => `<symbol id="i-${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</symbol>`)
    .join("");
  document.body.prepend(sprite);
})();

document.getElementById("year").textContent = new Date().getFullYear();

// Owner-only console button.
// Visit https://websportal.dev/?owner=<OWNER_KEY> once on your device to unlock it;
// ?owner=off hides it again. This only HIDES the button — the console itself
// must be protected server-side (e.g. Cloudflare Access on console.websportal.dev).
(function () {
  const OWNER_KEY = "change-me-to-a-long-random-string";
  const STORAGE = "wp_owner";
  const btn = document.getElementById("console-btn");
  if (!btn) return;
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
  const pills = document.querySelectorAll("[data-lang]");

  function setLang(lang) {
    els.forEach((el) => (el.innerHTML = el.dataset[lang]));
    phs.forEach((el) => (el.placeholder = lang === "es" ? el.dataset.esPlaceholder : el.dataset.enPlaceholder));
    document.documentElement.lang = lang;
    pills.forEach((p) => p.setAttribute("aria-pressed", String(p.dataset.lang === lang)));
    try { localStorage.setItem("wp_lang", lang); } catch (_) {}
    document.dispatchEvent(new Event("langchange"));
  }

  let initial = "en";
  try { initial = localStorage.getItem("wp_lang") || (navigator.language.startsWith("es") ? "es" : "en"); } catch (_) {}
  if (initial === "es") setLang("es");
  pills.forEach((p) => p.addEventListener("click", () => setLang(p.dataset.lang)));
})();

// Mobile menu toggle.
(function () {
  const btn = document.getElementById("menu-btn");
  const nav = document.getElementById("site-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
})();

// Background: drifting stars that connect when close; amber signals travel along the links.
(function () {
  if (document.body.dataset.bg !== "stars") return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const c = document.createElement("canvas");
  c.id = "bg-net";
  c.setAttribute("aria-hidden", "true");
  document.body.prepend(c);
  const ctx = c.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const ACC = "45,212,191", SPARK = "245,180,60";
  const D = 140;
  let W, H, T = 0, stars = [], sparks = [], mouse = { x: -1e4, y: -1e4 };

  const size = () => {
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(110, Math.round((W * H) / 12000));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: 0.8 + Math.random() * 1.6, ph: Math.random() * 6.28,
    }));
    sparks = [];
  };
  size();
  addEventListener("resize", size);
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener("pointerleave", () => { mouse.x = mouse.y = -1e4; });
  // Dim once the hero is scrolled past so content stays readable.
  const dim = () => { c.style.opacity = scrollY > innerHeight * 0.6 ? "0.4" : "1"; };
  addEventListener("scroll", dim, { passive: true });
  dim();

  const draw = () => {
    T += 1 / 60;
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      if (reduce) break;
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0 || s.x > W) s.vx *= -1;
      if (s.y < 0 || s.y > H) s.vy *= -1;
      const dm = Math.hypot(s.x - mouse.x, s.y - mouse.y);
      if (dm < 120 && dm > 0) { s.x += ((s.x - mouse.x) / dm) * 0.6; s.y += ((s.y - mouse.y) / dm) * 0.6; }
    }
    const links = [];
    ctx.lineWidth = 1;
    for (let i = 0; i < stars.length; i++) for (let k = i + 1; k < stars.length; k++) {
      const a = stars[i], b = stars[k], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < D) {
        links.push([a, b]);
        ctx.strokeStyle = `rgba(${ACC},${(1 - d / D) * 0.4})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    // The cursor acts as a star: nearby stars connect to it.
    for (const s of stars) {
      const d = Math.hypot(s.x - mouse.x, s.y - mouse.y);
      if (d < 200) {
        ctx.strokeStyle = `rgba(${ACC},${(1 - d / 200) * 0.55})`;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    for (const s of stars) {
      const tw = 0.55 + 0.45 * Math.sin(T * 2 + s.ph);
      ctx.fillStyle = `rgba(225,240,245,${0.45 + tw * 0.5})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
      if (s.r > 1.9) {
        ctx.fillStyle = `rgba(${ACC},${tw * 0.16})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3.5, 0, 7); ctx.fill();
      }
    }
    if (!reduce) {
      if (links.length && Math.random() < 0.06) { const l = links[(Math.random() * links.length) | 0]; sparks.push({ a: l[0], b: l[1], t: 0 }); }
      sparks = sparks.filter((s) => (s.t += 0.02) < 1);
      for (const s of sparks) {
        const x = s.a.x + (s.b.x - s.a.x) * s.t, y = s.a.y + (s.b.y - s.a.y) * s.t;
        ctx.fillStyle = `rgba(${SPARK},.95)`; ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill();
        ctx.fillStyle = `rgba(${SPARK},.16)`; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
      }
      if (!document.hidden) requestAnimationFrame(draw);
    }
  };
  draw();
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !reduce) draw(); });
})();

// Sections rise into place as they scroll into view (the first screen is left alone).
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  const targets = document.querySelectorAll("main .section .section-head, main .section .svc-row, main .section .plat, main .section .steps > div, main .section .cols > div, main .section .stack, main .section .faq, main .section .cta, main .section .case-head");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  targets.forEach((el) => {
    if (el.getBoundingClientRect().top < innerHeight) return;
    const sibs = [...el.parentElement.children];
    el.style.setProperty("--d", `${(sibs.indexOf(el) % 4) * 0.08}s`);
    el.classList.add("reveal");
    io.observe(el);
  });
})();

// Contact form: three steps with a live brief; posts to /api/contact, which emails via Gmail.
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const steps = [...form.querySelectorAll(".step")];
  const tabs = [...document.querySelectorAll(".stepper button")];
  const prev = form.querySelector("[data-prev]");
  const next = form.querySelector("[data-next]");
  const submit = form.querySelector("[type=submit]");
  const status = document.getElementById("form-status");
  const counter = document.getElementById("step-count");
  const es = () => document.documentElement.lang === "es";
  let current = 0, reached = 0;

  const MSG = {
    sending: { en: "Sending…", es: "Enviando…" },
    ok: { en: "Your message was sent. We'll be in touch soon!", es: "Tu mensaje fue enviado. ¡Te contactaremos pronto!" },
    error: { en: "Something went wrong. Please try again or email us directly.", es: "Algo salió mal. Inténtalo de nuevo o escríbenos directamente." },
    missing: { en: "Please complete the highlighted fields.", es: "Completa los campos marcados." },
    step: { en: "Step {n} of 3", es: "Paso {n} de 3" },
  };
  const t = (k) => MSG[k][es() ? "es" : "en"];
  const show = (key, cls) => { status.textContent = t(key); status.className = `form-status ${cls || ""}`; };

  function go(i) {
    current = i;
    reached = Math.max(reached, i);
    steps.forEach((s, k) => s.classList.toggle("active", k === i));
    tabs.forEach((b, k) => {
      b.toggleAttribute("aria-current", false);
      if (k === i) b.setAttribute("aria-current", "step");
      b.classList.toggle("done", k < reached && k !== i);
      b.disabled = k > reached;
    });
    prev.hidden = i === 0;
    next.hidden = i === steps.length - 1;
    submit.hidden = i !== steps.length - 1;
    counter.textContent = t("step").replace("{n}", i + 1);
  }

  // Checks required fields in one step and marks the ones that are missing.
  function valid(step) {
    let ok = true;
    step.querySelectorAll("input[required]:not([type=radio]), textarea[required]").forEach((el) => {
      const bad = !el.checkValidity();
      el.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    step.querySelectorAll(".group").forEach((g) => {
      const req = g.querySelector("input[type=radio][required]");
      if (!req) return;
      const bad = !g.querySelector(`input[name="${req.name}"]:checked`);
      g.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { show("missing", "error"); step.querySelector(".invalid input, input.invalid, textarea.invalid")?.focus(); }
    else status.textContent = "";
    return ok;
  }

  next.addEventListener("click", () => { if (valid(steps[current])) go(current + 1); });
  prev.addEventListener("click", () => go(current - 1));
  tabs.forEach((b, k) => b.addEventListener("click", () => { if (k <= reached) go(k); }));
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && current < steps.length - 1) { e.preventDefault(); next.click(); }
  });

  // Live project brief beside the form.
  const out = (id, v) => { const el = document.getElementById(id); el.textContent = v || "—"; el.classList.toggle("empty", !v); };
  const chipText = (el) => el.closest("label").querySelector("b").textContent;
  function brief() {
    const fd = new FormData(form);
    const name = fd.get("name").trim(), company = fd.get("company").trim();
    out("b-from", [name, company].filter(Boolean).join(" · "));
    const src = form.querySelector("input[name=source]:checked");
    out("b-source", src && chipText(src));
    const st = form.querySelector("input[name=stage]:checked");
    out("b-stage", st && chipText(st));
    out("b-needs", [...form.querySelectorAll("input[name=services]:checked")].map(chipText).join(", "));
    for (const n of ["timeline", "budget"]) {
      const sel = form.elements[n];
      out(`b-${n}`, sel.value ? sel.options[sel.selectedIndex].textContent : "");
    }
  }
  form.addEventListener("input", (e) => { e.target.classList.remove("invalid"); e.target.closest(".group")?.classList.remove("invalid"); brief(); });
  form.addEventListener("change", brief);
  document.addEventListener("langchange", () => { brief(); go(current); });

  // Object.fromEntries keeps only the last checkbox, so join multi-selects.
  const payload = () => {
    const fd = new FormData(form);
    return { ...Object.fromEntries(fd), services: fd.getAll("services").join(", ") };
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bad = steps.findIndex((s) => { s.classList.add("active"); const ok = valid(s); s.classList.remove("active"); return !ok; });
    if (bad !== -1) { go(bad); valid(steps[bad]); return; }
    steps[current].classList.add("active");
    submit.disabled = true;
    show("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      reached = 0;
      go(0);
      brief();
      show("ok", "ok");
    } catch (_) {
      show("error", "error");
    } finally {
      submit.disabled = false;
    }
  });

  go(0);
  brief();
})();
