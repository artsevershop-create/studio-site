/* Движок макетов (на основе motion-kit навыка premium-site). Подключать defer после base.css.
   data-reveal · data-split · data-img · data-line — появления; data-count — счётчик; data-magnetic — магнит;
   data-header / data-burger / data-menu — шапка; form[data-demo-form] — демо-форма (ничего не отправляет); .mbar — нижняя панель.
   window.KIT = {REDUCED, FINE, onView(el, cb), raf(canvasOrEl, draw(t,dt)), lenis} */
(function () {
  "use strict";
  var d = document, root = d.documentElement, mq = function (q) { return matchMedia(q).matches; };
  var REDUCED = mq("(prefers-reduced-motion: reduce)"), FINE = mq("(hover:hover) and (pointer:fine)");
  var $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var KIT = window.KIT = { REDUCED: REDUCED, FINE: FINE, still: false };

  /* cb(true/false) при входе/выходе */
  KIT.onView = function (el, cb, opt) { new IntersectionObserver(function (e) { cb(e[e.length - 1].isIntersecting); }, opt || { threshold: 0 }).observe(el); };
  /* цикл ~30 fps только пока элемент виден, вкладка активна и анимация не остановлена; при reduced — один кадр */
  KIT.raf = function (el, draw, fps) {
    var on = false, id = 0, last = 0, t = 0, step = 1000 / (fps || 30);
    function loop(now) { id = requestAnimationFrame(loop); var dt = now - last; if (dt < step - 2) return; last = now; dt = Math.min(dt, 80); t += dt; draw(t, dt); }
    function upd() { cancelAnimationFrame(id); if (on && !d.hidden && !REDUCED && !KIT.still) { last = performance.now(); id = requestAnimationFrame(loop); } }
    draw(0, 0); KIT.onView(el, function (v) { on = v; upd(); }); d.addEventListener("visibilitychange", upd); d.addEventListener("kit:still", upd);
  };

  function splitWords(el) {
    if (el.dataset.done) return; el.dataset.done = 1; var i = 0;
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 1) { if (n.tagName !== "BR") walk(n); return; }
        if (n.nodeType !== 3 || !n.nodeValue.trim()) return;
        var f = d.createDocumentFragment();
        n.nodeValue.split(/([ \n\t]+)/).forEach(function (w) {
          if (!w) return; if (/^[ \n\t]+$/.test(w)) { f.appendChild(d.createTextNode(" ")); return; }
          var a = d.createElement("span"), b = d.createElement("span"); a.className = "w"; a.setAttribute("aria-hidden", "true"); b.style.setProperty("--i", i++); b.textContent = w; a.appendChild(b); f.appendChild(a);
        });
        node.replaceChild(f, n);
      });
    })(el);
  }
  function reveal() {
    var seen = new Map();
    $$("[data-reveal]").forEach(function (el) { var n = seen.get(el.parentElement) || 0; seen.set(el.parentElement, n + 1); if (!el.style.transitionDelay) el.style.transitionDelay = (n % 8) * 70 + "ms"; });
    if (!REDUCED) $$("[data-split]").forEach(splitWords);
    var els = $$("[data-reveal],[data-img],[data-split],[data-line]");
    if (REDUCED) return els.forEach(function (e) { e.classList.add("in"); });
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }
  function counters() {
    if (REDUCED) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (!e.isIntersecting) return; io.unobserve(e.target); var tn = e.target.firstChild; if (!tn || tn.nodeType !== 3) return;
      var raw = tn.nodeValue, to = parseFloat(raw.replace(/[^\d.,]/g, "").replace(",", ".")) || 0, t0 = performance.now();
      (function s(t) { var p = Math.min(1, Math.max(0, (t - t0) / 1400)); tn.nodeValue = p < 1 ? Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString("ru-RU") : raw; if (p < 1) requestAnimationFrame(s); })(t0);
    }); }, { threshold: .6 });
    $$("[data-count]").forEach(function (e) { io.observe(e); });
  }
  function magnetic() {
    if (!FINE || REDUCED) return;
    $$("[data-magnetic]").forEach(function (el) {
      var id = 0, tx = 0, ty = 0, x = 0, y = 0;
      function loop() { x += (tx - x) * .18; y += (ty - y) * .18; el.style.transform = "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px)"; id = Math.abs(tx - x) + Math.abs(ty - y) > .1 ? requestAnimationFrame(loop) : 0; }
      el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); tx = (e.clientX - r.left - r.width / 2) * .22; ty = (e.clientY - r.top - r.height / 2) * .22; if (!id) loop(); });
      el.addEventListener("pointerleave", function () { tx = ty = 0; if (!id) loop(); });
    });
  }
  function header() {
    var h = d.querySelector("[data-header]"), bar = d.querySelector(".mbar"); if (!h && !bar) return;
    var last = 0, tick = false, darks = $$('[data-theme="night"]');
    function upd() {
      tick = false; var y = scrollY;
      if (h) { h.classList.toggle("is-solid", y > 40); h.classList.toggle("is-hidden", y > last + 2 && y > 260 && !h.classList.contains("is-open")); h.classList.toggle("on-dark", darks.some(function (s) { var r = s.getBoundingClientRect(); return r.top <= 38 && r.bottom >= 38; })); }
      if (bar) bar.classList.toggle("on", y > innerHeight * .7 && y + innerHeight < root.scrollHeight - 200);
      last = y;
    }
    addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
    var b = d.querySelector("[data-burger]"), m = d.querySelector("[data-menu]"); if (!b || !m) return;
    function set(v) { b.setAttribute("aria-expanded", v); m.classList.toggle("is-open", v); h && h.classList.toggle("is-open", v); root.style.overflow = v ? "hidden" : ""; if (KIT.lenis) KIT.lenis[v ? "stop" : "start"](); }
    b.addEventListener("click", function () { set(b.getAttribute("aria-expanded") !== "true"); });
    m.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    addEventListener("keydown", function (e) { if (e.key === "Escape" && b.getAttribute("aria-expanded") === "true") { set(false); b.focus(); } });
  }
  /* демо-форма: показывает, какое письмо получил бы отдел; наружу ничего не уходит */
  function forms() {
    $$("form[data-demo-form]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault(); var out = f.querySelector(".done"), rows = [];
        new FormData(f).forEach(function (v, k) { if (String(v).trim() && k !== "agree") rows.push([k, v]); });
        var box = out.querySelector("dl"); if (box) { box.textContent = ""; rows.forEach(function (r) { var a = d.createElement("dt"), b = d.createElement("dd"); a.textContent = r[0]; b.textContent = r[1]; box.append(a, b); }); }
        f.classList.add("sent"); out.setAttribute("tabindex", "-1"); out.focus({ preventScroll: true });
      });
    });
  }
  function bar() {
    var tag = d.createElement("div"); tag.className = "kit-tag"; tag.textContent = "Концепция редизайна · не официальный сайт"; d.body.appendChild(tag); setTimeout(function () { tag.classList.add("off"); }, 6000);
    var b = d.createElement("div"); b.className = "kit-bar";
    b.innerHTML = "<span>Дизайн-концепция, не официальный сайт компании. Тексты и фото взяты с действующего сайта, формы не отправляются.</span>";
    var s = d.createElement("button"); s.type = "button"; s.textContent = "Остановить анимацию";
    s.onclick = function () { KIT.still = !KIT.still; root.classList.toggle("still", KIT.still); s.textContent = KIT.still ? "Включить анимацию" : "Остановить анимацию"; if (window.gsap) gsap.globalTimeline.paused(KIT.still); d.dispatchEvent(new Event("kit:still")); };
    b.appendChild(s); d.body.appendChild(b);
  }
  function lenis() {
    if (!window.Lenis || !FINE || REDUCED) return;
    var l = KIT.lenis = new Lenis({ lerp: .11, wheelMultiplier: .95 }); root.classList.add("lenis");
    if (window.gsap && window.ScrollTrigger) { l.on("scroll", ScrollTrigger.update); gsap.ticker.add(function (t) { l.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
    else (function r(t) { l.raf(t); requestAnimationFrame(r); })(0);
    d.addEventListener("click", function (e) { var a = e.target.closest('a[href^="#"]'); if (!a) return; var t = a.hash.length > 1 && d.querySelector(a.hash); if (t) { e.preventDefault(); l.scrollTo(t, { offset: -70 }); } });
  }
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  lenis(); if (!root.hasAttribute("data-nobar")) bar(); reveal(); counters(); magnetic(); header(); forms();
  d.dispatchEvent(new Event("kit:ready"));
})();
