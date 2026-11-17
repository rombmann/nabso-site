// NABSO: scroll-scrub du vol FPV + micro-interactions. Aucun framework, aucune dépendance.
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = window.matchMedia("(hover: none) and (pointer: coarse), (max-width: 860px)").matches;

  /* ---------- 1. Le vol : le scroll pilote le film ---------- */
  var root = document.getElementById("journey");
  var media = root.querySelector(".ss__media");
  var route = root.querySelector(".ss__route");
  var bar = root.querySelector(".ss__progress span");
  var chapters = Array.prototype.slice.call(root.querySelectorAll(".ss__chapter"));
  var layers = [];

  chapters.forEach(function (ch, i) {
    var n = ch.getAttribute("data-clip");
    var suffix = mobile ? "-mobile" : "";
    ch.style.minHeight = parseFloat(ch.getAttribute("data-scroll") || "1.4") * 100 + "dvh";

    var layer = document.createElement("figure");
    layer.className = "ss__layer" + (i === 0 ? " is-active" : "");
    layer.style.margin = "0";
    var poster = document.createElement("img");
    poster.alt = "";
    poster.src = "assets/world/scene-0" + n + suffix + "-poster.jpg";
    layer.appendChild(poster);
    media.appendChild(layer);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = ch.querySelector(".ss__title").textContent.replace(".", "");
    btn.addEventListener("click", function () {
      window.scrollTo({ top: ch.offsetTop + root.offsetTop, behavior: reduced ? "auto" : "smooth" });
    });
    route.appendChild(btn);

    layers.push({ el: layer, ch: ch, btn: btn, src: "assets/world/scene-0" + n + suffix + ".mp4", video: null, target: 0 });
  });

  // Vidéos chargées en mémoire (blob) pour un défilement avant/arrière fluide.
  function loadVideo(l) {
    if (l.video || reduced) return;
    var v = document.createElement("video");
    v.muted = true; v.playsInline = true; v.preload = "auto";
    v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
    l.video = v;
    fetch(l.src).then(function (r) { return r.blob(); }).then(function (b) {
      v.src = URL.createObjectURL(b);
      v.addEventListener("loadeddata", function () { l.el.appendChild(v); seek(l); }, { once: true });
    }).catch(function () { l.video = null; });
  }
  layers.forEach(function (l, i) { if (i < 2) loadVideo(l); });
  window.addEventListener("load", function () { layers.forEach(loadVideo); });

  function seek(l) {
    var v = l.video;
    if (!v || !v.duration || v.seeking) return;
    var t = l.target * (v.duration - 0.05);
    if (Math.abs(v.currentTime - t) > 0.01) v.currentTime = t;
  }
  layers.forEach(function (l) {
    l.el.addEventListener("seeked", function () { seek(l); }, true);
  });

  var active = -1;
  function onScroll() {
    var y = window.scrollY;
    var vh = window.innerHeight;
    var total = root.offsetHeight - vh;
    var top = root.getBoundingClientRect().top + window.scrollY;
    bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, (y - top) / total)) + ")";
    var idx = 0;
    layers.forEach(function (l, i) {
      var start = top + l.ch.offsetTop;
      var len = Math.max(1, l.ch.offsetHeight - (i === layers.length - 1 ? vh : 0));
      var p = Math.min(1, Math.max(0, (y - start) / len));
      l.target = p;
      if (y >= start - 1) idx = i;
    });
    if (idx !== active) {
      layers.forEach(function (l, i) {
        l.el.classList.toggle("is-active", i === idx);
        if (i === idx) l.btn.setAttribute("aria-current", "step"); else l.btn.removeAttribute("aria-current");
      });
      active = idx;
    }
    seek(layers[idx]);
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- 2. Apparitions au scroll (transform uniquement) ---------- */
  if (!reduced && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll(".nb-rise").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".nb-rise").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- 3. Bouton magnétique ---------- */
  if (!reduced) {
    document.querySelectorAll(".nb-magnetic").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.28 + "px," + (e.clientY - r.top - r.height / 2) * 0.38 + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- 4. Galerie : glisser + inclinaison 3D ---------- */
  var track = document.querySelector(".nb-track");
  var down = false, sx = 0, sl = 0;
  track.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse") return;
    down = true; sx = e.clientX; sl = track.scrollLeft; track.classList.add("is-drag");
  });
  window.addEventListener("pointermove", function (e) { if (down) track.scrollLeft = sl - (e.clientX - sx); });
  window.addEventListener("pointerup", function () { down = false; track.classList.remove("is-drag"); });
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    track.querySelectorAll(".nb-card").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "perspective(900px) rotateY(" + x * 10 + "deg) rotateX(" + -y * 10 + "deg) scale(1.02)";
        c.style.setProperty("--gx", (x + 0.5) * 100 + "%");
        c.style.setProperty("--gy", (y + 0.5) * 100 + "%");
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* ---------- 5. Ouvert / fermé, à l'heure de Lausanne ---------- */
  var HOURS = { 1: [], 2: [[540, 1140]], 3: [[540, 1140]], 4: [[540, 1140]], 5: [[540, 750], [840, 1140]], 6: [[540, 1080]], 0: [] };
  var DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  function fmt(m) { return Math.floor(m / 60) + "h" + (m % 60 ? String(m % 60).padStart(2, "0") : ""); }
  function status() {
    var el = document.querySelector(".nb-status");
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zurich", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    var wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    var mins = Number(get("hour")) * 60 + Number(get("minute"));
    var open = HOURS[wd].find(function (s) { return mins >= s[0] && mins < s[1]; });
    el.classList.toggle("is-open", !!open);
    if (open) { el.textContent = "Ouvert maintenant, jusqu'à " + fmt(open[1]); return; }
    for (var k = 0; k < 8; k++) {
      var d = (wd + k) % 7;
      var next = HOURS[d].find(function (s) { return k > 0 || s[0] > mins; });
      if (next) {
        el.textContent = "Fermé. Réouverture " + (k === 0 ? "aujourd'hui" : k === 1 ? "demain" : DAYS[d]) + " à " + fmt(next[0]);
        return;
      }
    }
  }
  status();
  setInterval(status, 60000);
})();
