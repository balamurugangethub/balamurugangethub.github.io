(() => {
  const D = window.PORTFOLIO;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- content ---------- */
  document.title = `${D.name} — ${D.role}`;
  const initials = D.name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  $("#brand").innerHTML = `${esc(initials)}<span>.</span>`;
  $("#foot-name").textContent = `© ${new Date().getFullYear()} ${D.name}`;
  $("#tagline").textContent = D.tagline;
  D.resume ? $("#resume").href = D.resume : $("#resume").remove();
  $("#mail").href = `mailto:${D.email}`;
  $("#mail").textContent = D.email;
  if (!D.available) { $("#badge").classList.add("off"); $("#badge span").textContent = "Currently unavailable"; }

  // hero title: animated word reveal. First name in accent colour.
  const words = D.name.split(/\s+/);
  $("#hero-title").innerHTML =
    `<span class="w"><span style="animation-delay:.05s"><em>${esc(words[0])}</em></span></span> ` +
    words.slice(1).map((w, i) => `<span class="w"><span style="animation-delay:${0.12 + i * 0.08}s">${esc(w)}</span></span>`).join(" ") +
    `<br><span class="w"><span style="animation-delay:.3s;font-size:.42em;letter-spacing:-.03em;color:var(--dim);font-weight:300">${esc(D.role)}</span></span>`;
  $("#hero-title").classList.add("in");

  $("#about-text").innerHTML = D.about.map(p => `<p>${esc(p)}</p>`).join("");
  $("#stats").innerHTML = D.stats.map(s => `<div class="stat"><b>${esc(s.value)}</b><span class="mono dim">${esc(s.label)}</span></div>`).join("");
  $("#skills").innerHTML = Object.entries(D.skills).map(([k, v]) =>
    `<div><h3 class="mono dim">${esc(k)}</h3><div class="chips">${v.map(x => `<span class="chip">${esc(x)}</span>`).join("")}</div></div>`).join("");

  const tags = ["All", ...new Set(D.projects.flatMap(p => p.tags))];
  $("#filters").innerHTML = tags.map((t, i) => `<button class="filter" role="tab" aria-selected="${i === 0}" data-tag="${esc(t)}">${esc(t)}</button>`).join("");
  $("#projects").innerHTML = D.projects.map((p, i) => `
    <article class="card reveal" data-tags="${esc(p.tags.join("|"))}" style="transition-delay:${(i % 2) * 90}ms">
      <div class="card-top mono"><span>${esc(p.tags.join(" · "))}</span><span>${esc(p.year || "")}</span></div>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.summary)}</p>
      <div class="stack mono">${p.stack.map(s => `<span>${esc(s)}</span>`).join("")}</div>
      <div class="card-links">
        ${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noopener">Live ↗</a>` : ""}
        ${p.code ? `<a href="${esc(p.code)}" target="_blank" rel="noopener">Code ↗</a>` : ""}
      </div>
    </article>`).join("");

  $("#timeline").innerHTML = D.experience.map(j => `
    <div class="job reveal">
      <div class="mono dim">${esc(j.when)}</div>
      <div><h3>${esc(j.title)}</h3><div class="org mono">${esc(j.org)}</div>
      <ul>${j.points.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    </div>`).join("");
  $("#links").innerHTML = D.links.map(l => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} <b>↗</b></a>`).join("");

  /* ---------- project filters ---------- */
  $("#filters").addEventListener("click", e => {
    const b = e.target.closest(".filter"); if (!b) return;
    document.querySelectorAll(".filter").forEach(x => x.setAttribute("aria-selected", x === b));
    document.querySelectorAll(".card").forEach(c =>
      c.classList.toggle("hide", b.dataset.tag !== "All" && !c.dataset.tags.split("|").includes(b.dataset.tag)));
  });

  /* ---------- card spotlight ---------- */
  document.querySelectorAll(".card").forEach(c => c.addEventListener("pointermove", e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--x", e.clientX - r.left + "px");
    c.style.setProperty("--y", e.clientY - r.top + "px");
  }));

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* ---------- scroll progress + active nav ---------- */
  const bar = $(".progress");
  const navLinks = [...document.querySelectorAll(".nav nav a")];
  const secs = navLinks.map(a => $(a.getAttribute("href")));
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
    const y = scrollY + innerHeight * .35;
    navLinks.forEach((a, i) => a.classList.toggle("on", secs[i].offsetTop <= y && secs[i].offsetTop + secs[i].offsetHeight > y));
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- live clock ---------- */
  const tick = () => {
    let t;
    try { t = new Date().toLocaleTimeString("en-GB", { timeZone: D.timezone, hour: "2-digit", minute: "2-digit" }); }
    catch { t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); }
    $("#clock").textContent = `${D.location} · ${t}`;
  };
  tick(); setInterval(tick, 30000);

  /* ---------- cursor glow ---------- */
  const glow = $(".glow");
  const mouse = { x: -999, y: -999 };
  addEventListener("pointermove", e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    glow.style.setProperty("--mx", e.clientX + "px");
    glow.style.setProperty("--my", e.clientY + "px");
  }, { passive: true });

  /* ---------- interactive dot field ---------- */
  const cv = $("#field"), ctx = cv.getContext("2d");
  let W, H, dpr, dots = [];
  const GAP = 34;
  const build = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    dots = [];
    for (let y = GAP / 2; y < innerHeight + GAP; y += GAP)
      for (let x = GAP / 2; x < innerWidth + GAP; x += GAP) dots.push({ x, y });
  };
  build(); addEventListener("resize", build);
  let t0 = 0;
  const draw = t => {
    ctx.clearRect(0, 0, W, H);
    const R = 170, time = t / 1000;
    for (const d of dots) {
      const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy);
      const near = Math.max(0, 1 - dist / R);
      const wave = reduce ? 0 : (Math.sin(d.x * .008 + time * .8) + Math.sin(d.y * .01 - time * .6)) * .5;
      const a = .08 + wave * .03 + near * .55;
      const push = near * near * 10;
      const px = d.x + (dist ? dx / dist : 0) * push, py = d.y + (dist ? dy / dist : 0) * push;
      ctx.fillStyle = near > .02 ? `rgba(150,176,235,${a})` : `rgba(160,185,195,${a})`;
      ctx.beginPath(); ctx.arc(px * dpr, py * dpr, (1 + near * 1.6) * dpr, 0, 6.283); ctx.fill();
    }
    if (!reduce && !document.hidden) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
  if (reduce) addEventListener("pointermove", () => requestAnimationFrame(draw), { passive: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !reduce) requestAnimationFrame(draw); });

  /* ---------- magnetic buttons ---------- */
  if (false) document.querySelectorAll(".btn").forEach(b => {
    b.addEventListener("pointermove", e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .28}px)`;
    });
    b.addEventListener("pointerleave", () => b.style.transform = "");
  });

  /* ---------- command palette ---------- */
  const pal = $("#palette"), inp = $("#palette-input"), list = $("#palette-list");
  const go = id => () => $(id).scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  const cmds = [
    { t: "About", k: "section", run: go("#about") },
    { t: "Projects", k: "section", run: go("#work") },
    { t: "Experience", k: "section", run: go("#experience") },
    { t: "Contact", k: "section", run: go("#contact") },
    ...(D.resume ? [{ t: "Download résumé", k: "file", run: () => open(D.resume) }] : []),
    { t: "Copy email address", k: "action", run: () => navigator.clipboard?.writeText(D.email) },
    ...D.links.map(l => ({ t: l.label, k: "link", run: () => open(l.url, "_blank", "noopener") })),
    ...D.projects.map(p => ({ t: p.title, k: "project", run: go("#work") }))
  ];
  let shown = cmds, sel = 0;
  const render = () => {
    list.innerHTML = shown.map((c, i) => `<li role="option" aria-selected="${i === sel}" data-i="${i}">${esc(c.t)}<small>${c.k}</small></li>`).join("") || `<li>No results</li>`;
    list.children[sel]?.scrollIntoView({ block: "nearest" });
  };
  const openP = () => { pal.hidden = false; inp.value = ""; shown = cmds; sel = 0; render(); inp.focus(); };
  const closeP = () => { pal.hidden = true; };
  const run = i => { const c = shown[i]; if (c) { closeP(); c.run(); } };
  $("#open-palette").addEventListener("click", openP);
  addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? openP() : closeP(); }
    if (pal.hidden) return;
    if (e.key === "Escape") closeP();
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); render(); }
    if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
    if (e.key === "Enter") run(sel);
  });
  inp.addEventListener("input", () => { const q = inp.value.toLowerCase(); shown = cmds.filter(c => c.t.toLowerCase().includes(q)); sel = 0; render(); });
  list.addEventListener("click", e => { const li = e.target.closest("li[data-i]"); if (li) run(+li.dataset.i); });
  pal.addEventListener("click", e => { if (e.target === pal) closeP(); });
})();
