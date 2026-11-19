/* =========================================================
   BOOKING LINK: change this one line to switch providers.
   - Google Calendar appointment schedule (current). Short link:
     https://calendar.app.google/oo1CNAdE3sxf5aAE6
     Use the full calendar.google.com/.../schedules/... address
     so the embed works (open the short link and copy the URL).
   - Calendly also works: https://calendly.com/tommywoodpt/1to1session
   ========================================================= */
/* Free 15-min consultation: paste its Google booking link here.
   Until it's set, the "Book free call" button opens WhatsApp. */
const CONSULT_URL = "";

const BOOKING_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0qwG0DC8gNyS6GFDqcdaDojAPX5_0mNBzbCZ4EDk_F_NOzIuwDDTANJZYPaHDwl_KXKxoLnkmd";

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $("#year").textContent = new Date().getFullYear();

  /* Nav: scrolled state + mobile menu */
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const links = $("#navLinks");
  const floatCta = $("#floatCta");
  const book = $("#book");
  const hero = $(".hero");

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 30);
    const pastHero = y > hero.offsetHeight * 0.7;
    const bookTop = book.getBoundingClientRect().top;
    const tm = document.getElementById("timer");
    const tr = tm ? tm.getBoundingClientRect() : null;
    const timerOnScreen = tr && tr.top < window.innerHeight && tr.bottom > 0;
    floatCta.classList.toggle("is-visible", pastHero && !timerOnScreen && bookTop > window.innerHeight * 0.6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    links.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", links).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* Hero watermark parallax */
  const mark = $(".hero__watermark");
  if (mark && !reduceMotion) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight);
        mark.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* Tabs */
  const tabs = $$(".tab");
  const bar = $(".tabs__bar");
  const moveBar = (tab) => {
    bar.style.width = `${tab.offsetWidth - parseFloat(getComputedStyle(tab).paddingRight)}px`;
    bar.style.transform = `translateX(${tab.offsetLeft}px)`;
  };
  const activate = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
    moveBar(tab);
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => activate(t));
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") activate(tabs[(i + 1) % tabs.length], true);
      if (e.key === "ArrowLeft") activate(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });
  const initBar = () => moveBar($(".tab.is-active"));
  window.addEventListener("resize", initBar);
  document.fonts?.ready.then(initBar);
  initBar();

  /* Programme finder */
  const answers = {};
  const plans = {
    person: { tab: 0, title: "In-person 1-1 coaching", label: "Recommended" },
    online: { tab: 1, title: "Online programming", label: "Recommended" },
    team: { tab: 2, title: "Fight camp & team S&C", label: "Recommended" },
    camp: { tab: 2, title: "Fight camp S&C", label: "Recommended" },
  };
  const blurbs = {
    fight: "We'll plan back from your date: build strength first, then sharpen power and conditioning, then taper so you peak on the day.",
    build: "We'll build a solid strength base first, with proper technique on the key lifts and steady progression, so it carries over to your sport.",
    return: "We'll start with a careful assessment and rebuild strength and confidence step by step, coordinating with your physio where needed.",
    team: "We'll set up structured S&C for your athletes, with testing days, group sessions and plans that fit around your sessions.",
  };
  const render = () => {
    const out = $("#finderResult");
    if (!answers.situation || !answers.mode) return;
    let key = answers.mode === "online" ? "online" : "person";
    if (answers.situation === "team") key = "team";
    else if (answers.situation === "fight" && answers.mode !== "online") key = "camp";
    const plan = plans[key];
    const extra = answers.mode === "either" && key !== "team"
      ? " In person is best to start, then many athletes move to online coaching once the basics are solid."
      : "";
    out.innerHTML = `
      <div class="result__card">
        <p class="panel__label">${plan.label}</p>
        <h3>${plan.title}</h3>
        <p>${blurbs[answers.situation]}${extra}</p>
        <div class="hero__cta">
          <a href="#book" class="btn">Book your first session</a>
          <a href="#coaching" class="btn btn--ghost" data-tab="${plan.tab}">See what's included</a>
        </div>
      </div>`;
    $("[data-tab]", out).addEventListener("click", () => activate(tabs[plan.tab]));
  };
  $$(".finder .chips").forEach((group) => {
    const chips = $$(".chip", group);
    chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
    group.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      answers[group.dataset.q] = chip.dataset.v;
      render();
    });
  });

  /* FAQ: keep one open at a time */
  const faqs = $$(".faq details");
  faqs.forEach((d) => d.addEventListener("toggle", () => {
    if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
  }));

  /* Booking: session cards open Google's booking page in a dark modal */
  const toEmbed = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("calendar.google.com") && !u.searchParams.has("gv")) u.searchParams.set("gv", "true");
      return u.toString();
    } catch { return url; }
  };
  const bookings = {
    consult: {
      label: "Free · 15 minutes",
      title: "Free consultation call",
      url: CONSULT_URL,
      fallback: `https://wa.me/447914832059?text=${encodeURIComponent("Hi Tommy, I'd like to book a free 15-minute consultation.")}`,
    },
    session: { label: "In person", title: "1-1 S&C session", url: BOOKING_URL },
  };
  const modal = $("#bookModal");
  const body = $("#modalBody");
  let lastFocus = null;
  const openBooking = (key) => {
    const b = bookings[key];
    if (!b.url) { window.open(b.fallback, "_blank", "noopener"); return; }
    lastFocus = document.activeElement;
    $("#modalLabel").textContent = b.label;
    $("#modalTitle").textContent = b.title;
    $("#modalExt").href = b.url;
    body.classList.remove("is-loaded");
    body.innerHTML = '<div class="modal__loading"><span class="spinner"></span>Loading available times…</div>';
    const iframe = document.createElement("iframe");
    iframe.src = toEmbed(b.url);
    iframe.title = b.title;
    iframe.addEventListener("load", () => body.classList.add("is-loaded"));
    body.appendChild(iframe);
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("is-open"));
    document.body.style.overflow = "hidden";
    $(".modal__close", modal).focus();
  };
  const closeBooking = () => {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => { modal.hidden = true; body.innerHTML = ""; }, reduceMotion ? 0 : 300);
    if (lastFocus) lastFocus.focus();
  };
  $$("[data-book]").forEach((btn) => btn.addEventListener("click", () => openBooking(btn.dataset.book)));
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeBooking));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeBooking(); });

  /* Scroll progress bar + method line */
  const bar2 = $("#progressBar");
  const steps = $(".steps");
  const stepEls = $$(".step");
  let rafP = false;
  const updateProgress = () => {
    rafP = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar2.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    const r = steps.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    steps.style.setProperty("--p", p.toFixed(3));
    stepEls.forEach((s, i) => s.classList.toggle("is-lit", p >= (i + 0.5) / stepEls.length));
  };
  window.addEventListener("scroll", () => { if (!rafP) { rafP = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* Round timer */
  const T = {
    el: $("#roundTimer"), ring: $("#timerRing"), phaseEl: $("#timerPhase"), timeEl: $("#timerTime"),
    roundEl: $("#timerRound"), startBtn: $("#timerStart"), resetBtn: $("#timerReset"), soundBtn: $("#timerSound"),
  };
  const PREP = 5;
  const C = 2 * Math.PI * 148;
  T.ring.style.strokeDasharray = C;
  const cfg = { n: 12, w: 180, r: 60 };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem("wapTimer")) || {}); } catch {}
  const st = { phase: "idle", round: 1, endAt: 0, remaining: 0, total: 0, running: false, warned: false, sound: true };
  const fmt = (s) => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

  /* Sounds (Web Audio, no files needed) */
  let ac = null;
  const audio = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); } catch {} return ac; };
  const bell = (times = 1) => {
    if (!st.sound || !audio()) return;
    for (let k = 0; k < times; k++) {
      const t0 = ac.currentTime + k * 0.32;
      [[523, 0.5], [1047, 0.32], [1569, 0.18], [2093, 0.1], [2637, 0.06]].forEach(([f, g]) => {
        const o = ac.createOscillator(), v = ac.createGain();
        o.type = "sine"; o.frequency.value = f * 1.003;
        v.gain.setValueAtTime(0.0001, t0);
        v.gain.exponentialRampToValueAtTime(g * 0.6, t0 + 0.008);
        v.gain.exponentialRampToValueAtTime(0.0001, t0 + (times > 1 ? 0.9 : 2.2));
        o.connect(v).connect(ac.destination); o.start(t0); o.stop(t0 + 2.3);
      });
    }
  };
  const clap = () => {
    if (!st.sound || !audio()) return;
    [0, 0.16].forEach((d) => {
      const t0 = ac.currentTime + d;
      const len = Math.floor(ac.sampleRate * 0.06);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      const src = ac.createBufferSource(), f = ac.createBiquadFilter(), v = ac.createGain();
      src.buffer = buf; f.type = "bandpass"; f.frequency.value = 1800; f.Q.value = 1.2; v.gain.value = 0.9;
      src.connect(f).connect(v).connect(ac.destination); src.start(t0);
    });
  };
  const beep = () => {
    if (!st.sound || !audio()) return;
    const o = ac.createOscillator(), v = ac.createGain(), t0 = ac.currentTime;
    o.frequency.value = 880; v.gain.setValueAtTime(0.25, t0); v.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.15);
    o.connect(v).connect(ac.destination); o.start(t0); o.stop(t0 + 0.16);
  };

  /* Keep the screen awake while running */
  let lock = null;
  const wake = async (on) => {
    try {
      if (on && "wakeLock" in navigator && !lock) { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => { lock = null; }); }
      if (!on && lock) { await lock.release(); lock = null; }
    } catch {}
  };
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && st.running) wake(true); });

  const labels = { idle: "Ready", prep: "Get ready", work: "Work", rest: "Rest", done: "Done" };
  const renderTimer = () => {
    const rem = st.running ? (st.endAt - performance.now()) / 1000 : st.remaining;
    const showTime = st.phase === "idle" ? cfg.w : st.phase === "done" ? 0 : rem;
    T.timeEl.textContent = fmt(showTime);
    T.phaseEl.textContent = labels[st.phase];
    T.roundEl.textContent = st.phase === "done" ? `${cfg.n} rounds complete` : `Round ${st.round} / ${cfg.n}`;
    T.el.dataset.phase = st.phase;
    const frac = st.phase === "idle" ? 1 : st.phase === "done" ? 0 : Math.max(0, rem / (st.total || 1));
    T.ring.style.strokeDashoffset = (C * (1 - frac)).toFixed(1);
    T.el.classList.toggle("is-warn", st.running && st.phase === "work" && rem <= 10 && cfg.w > 20);
    T.el.classList.toggle("is-running", st.running || st.phase !== "idle");
    $("#setN").textContent = cfg.n; $("#setW").textContent = fmt(cfg.w); $("#setR").textContent = fmt(cfg.r);
    document.title = st.running && st.phase !== "done" ? `${fmt(rem)} · ${labels[st.phase]}` : baseTitle;
  };
  const baseTitle = document.title;
  const enter = (phase, secs) => {
    st.phase = phase; st.total = secs; st.remaining = secs; st.warned = false;
    st.endAt = performance.now() + secs * 1000;
  };
  const advance = () => {
    if (st.phase === "prep") { enter("work", cfg.w); bell(1); }
    else if (st.phase === "work") {
      if (st.round >= cfg.n) { st.phase = "done"; st.running = false; bell(3); wake(false); T.startBtn.textContent = "Start"; }
      else { bell(1); enter("rest", cfg.r); }
    } else if (st.phase === "rest") { st.round++; enter("work", cfg.w); bell(1); }
  };
  let lastBeep = -1;
  const tick = () => {
    if (!st.running) return;
    const rem = (st.endAt - performance.now()) / 1000;
    if (st.phase === "work" && !st.warned && rem <= 10 && cfg.w > 20) { st.warned = true; clap(); }
    if ((st.phase === "prep" || st.phase === "rest") && rem <= 3 && rem > 0) {
      const s = Math.ceil(rem); if (s !== lastBeep) { lastBeep = s; beep(); }
    }
    if (rem <= 0) advance();
    renderTimer();
  };
  setInterval(tick, 100);

  const start = () => {
    audio();
    if (st.phase === "idle" || st.phase === "done") { st.round = 1; enter("prep", PREP); lastBeep = -1; }
    else st.endAt = performance.now() + st.remaining * 1000;
    st.running = true; T.startBtn.textContent = "Pause"; wake(true); renderTimer();
  };
  const pause = () => {
    st.remaining = Math.max(0, (st.endAt - performance.now()) / 1000);
    st.running = false; T.startBtn.textContent = "Resume"; wake(false); renderTimer();
  };
  const reset = () => { st.running = false; st.phase = "idle"; st.round = 1; T.startBtn.textContent = "Start"; wake(false); renderTimer(); };
  T.startBtn.addEventListener("click", () => (st.running ? pause() : start()));
  T.resetBtn.addEventListener("click", reset);
  T.soundBtn.addEventListener("click", () => {
    st.sound = !st.sound;
    T.soundBtn.setAttribute("aria-pressed", String(st.sound));
    T.soundBtn.setAttribute("aria-label", st.sound ? "Sound on" : "Sound off");
  });

  const save = () => { try { localStorage.setItem("wapTimer", JSON.stringify(cfg)); } catch {} };
  const presetBtns = $$("#presets .chip");
  const markPreset = () => presetBtns.forEach((b) => b.setAttribute("aria-pressed",
    String(+b.dataset.w === cfg.w && +b.dataset.r === cfg.r && +b.dataset.n === cfg.n)));
  presetBtns.forEach((b) => b.addEventListener("click", () => {
    cfg.w = +b.dataset.w; cfg.r = +b.dataset.r; cfg.n = +b.dataset.n;
    reset(); save(); markPreset();
  }));
  $$(".stepper").forEach((s) => s.addEventListener("click", (e) => {
    const btn = e.target.closest("button"); if (!btn) return;
    const k = s.dataset.key, d = +btn.dataset.d;
    const lim = { n: [1, 30], w: [15, 600], r: [0, 300] }[k];
    cfg[k] = Math.min(lim[1], Math.max(lim[0], cfg[k] + d));
    save(); markPreset(); renderTimer();
  }));
  markPreset();
  renderTimer();

  /* Testimonials carousel */
  const tSec = $("#athletes");
  const tData = Array.isArray(window.TESTIMONIALS) ? window.TESTIMONIALS.filter((t) => t && t.quote) : [];
  if (tSec && tData.length) {
    const esc = (v) => String(v || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const track = $("#tstTrack");
    track.innerHTML = tData.map((t) => `
      <figure class="tcard${t.photo ? " tcard--photo" : ""}">
        ${t.photo ? `<div class="tcard__photo"><img src="${esc(t.photo)}" alt="${esc(t.name)}" loading="lazy"></div>` : ""}
        <figcaption class="tcard__body">
          <span class="tcard__mark" aria-hidden="true">\u201C</span>
          <blockquote>${esc(t.quote)}</blockquote>
          <p class="tcard__name">${esc(t.name)}</p>
          ${t.detail ? `<p class="tcard__detail">${esc(t.detail)}</p>` : ""}
        </figcaption>
      </figure>`).join("");
    tSec.hidden = false;
    const cards = $$(".tcard", track);
    const dots = $("#tstDots");
    dots.innerHTML = cards.map(() => "<span></span>").join("");
    const prev = $("#tstPrev"), next = $("#tstNext");
    const step = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max - 4;
      const idx = Math.round(track.scrollLeft / step());
      $$("span", dots).forEach((d, i) => d.classList.toggle("is-on", i === Math.min(idx, cards.length - 1)));
      dots.style.display = max > 4 ? "" : "none";
      $(".tst__nav").style.visibility = max > 4 ? "" : "hidden";
    };
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
    window.addEventListener("resize", sync);
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); next.click(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev.click(); }
    });
    /* drag to scroll with a mouse */
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add("is-drag"); }
      track.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", () => {
      if (!down) return; down = false;
      if (moved) { track.classList.remove("is-drag"); const i = Math.round(track.scrollLeft / step()); track.scrollTo({ left: i * step(), behavior: "smooth" }); }
    });
    sync();
  }
})();
