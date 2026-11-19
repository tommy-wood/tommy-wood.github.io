/* =========================================================
   BOOKING LINK: change this one line to switch providers.
   - Calendly (current):  https://calendly.com/tommywoodpt/1to1session
   - Google Calendar appointment schedule: paste the booking
     page link from Google Calendar (calendar.app.google/...
     or calendar.google.com/calendar/appointments/schedules/...)
   ========================================================= */
const BOOKING_URL = "https://calendly.com/tommywoodpt/1to1session";

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
    floatCta.classList.toggle("is-visible", pastHero && bookTop > window.innerHeight * 0.6);
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
  $$(".chips").forEach((group) => {
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

  /* Booking embed: loads when the section comes near the viewport */
  const frame = $("#bookFrame");
  $("#bookFallback").href = BOOKING_URL;
  const embedUrl = (() => {
    try {
      const u = new URL(BOOKING_URL);
      if (u.hostname.includes("calendly.com")) {
        u.searchParams.set("embed_domain", location.hostname || "localhost");
        u.searchParams.set("embed_type", "Inline");
        u.searchParams.set("hide_gdpr_banner", "1");
        u.searchParams.set("background_color", "ffffff");
        u.searchParams.set("primary_color", "c8a35a");
      }
      if (u.hostname.includes("calendar.google.com") && !u.searchParams.has("gv")) {
        u.searchParams.set("gv", "true");
      }
      return u.toString();
    } catch { return BOOKING_URL; }
  })();
  const loadBooking = () => {
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.title = "Book a session";
    iframe.loading = "lazy";
    iframe.addEventListener("load", () => $(".book__placeholder", frame)?.remove());
    frame.appendChild(iframe);
  };
  const bio = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { loadBooking(); bio.disconnect(); }
  }, { rootMargin: "600px 0px" });
  bio.observe(frame);
})();
