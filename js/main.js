/* Mayo Authentic Thai Massage — interactions & motion */
(function () {
  "use strict";

  /* ---------- Preloader ---------- */
  var loader = document.querySelector(".loader");
  function dismissLoader() {
    document.body.classList.add("loaded");
    if (loader) {
      loader.classList.add("done");
      setTimeout(function () { loader.remove(); }, 1000);
    }
  }
  if (loader) {
    window.addEventListener("load", function () { setTimeout(dismissLoader, 350); });
    setTimeout(dismissLoader, 2600); // fail-safe
  } else {
    document.body.classList.add("loaded");
  }

  /* ---------- Navbar scroll state ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
      });
    });
  }

  /* ---------- Letter-by-letter heading reveal ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function appendChars(parent, text, counter, baseDelay, cls) {
    text.split(/(\s+)/).forEach(function (token) {
      if (token === "") return;
      if (/^\s+$/.test(token)) { parent.appendChild(document.createTextNode(" ")); return; }
      var word = document.createElement("span");
      word.className = "r-word" + (cls ? " " + cls : "");
      for (var i = 0; i < token.length; i++) {
        var ch = document.createElement("span");
        ch.className = "r-char";
        ch.textContent = token[i];
        ch.style.setProperty("--cd", (baseDelay + counter.i * 0.024).toFixed(3) + "s");
        counter.i++;
        word.appendChild(ch);
      }
      parent.appendChild(word);
    });
  }

  function splitHeading(el) {
    var baseDelay = parseFloat(el.getAttribute("data-split-delay") || "0");
    var nodes = Array.prototype.slice.call(el.childNodes);
    var counter = { i: 0 };
    el.innerHTML = "";
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        appendChars(el, node.textContent, counter, baseDelay, null);
      } else if (node.nodeName === "BR") {
        el.appendChild(document.createElement("br"));
      } else if (node.nodeType === 1) {
        appendChars(el, node.textContent, counter, baseDelay, node.className);
      }
    });
  }

  var splitEls = document.querySelectorAll("[data-split]");
  if (!reduceMotion) {
    splitEls.forEach(function (el) { splitHeading(el); });
  } else {
    splitEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Auto-stagger: tag grid children as reveal targets ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.setAttribute("data-reveal", "");
      child.style.setProperty("--d", (i * 0.09).toFixed(2) + "s");
    });
  });

  /* ---------- Marquee: duplicate track content for seamless loop ---------- */
  document.querySelectorAll(".marquee-track, .gallery-track").forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Unified in-view reveal ----------
     Scroll/load driven so it never depends on a single IntersectionObserver
     callback firing — content is guaranteed to appear. IO is layered on as a
     progressive enhancement for programmatic scrolls. */
  function vh() { return window.innerHeight || document.documentElement.clientHeight; }

  function revealCheck() {
    var nodes = document.querySelectorAll("[data-reveal]:not(.in), [data-split]:not(.in)");
    for (var i = 0; i < nodes.length; i++) {
      var r = nodes[i].getBoundingClientRect();
      if (r.top < vh() * 0.92 && r.bottom > -40) nodes[i].classList.add("in");
    }
    for (var j = 0; j < counters.length; j++) {
      var c = counters[j];
      if (!c._counted) {
        var cr = c.getBoundingClientRect();
        if (cr.top < vh() * 0.85 && cr.bottom > 0) { c._counted = true; animateCount(c); }
      }
    }
  }

  var ticking = false;
  function onScroll2() {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { revealCheck(); ticking = false; }); }
  }
  window.addEventListener("scroll", onScroll2, { passive: true });
  window.addEventListener("resize", onScroll2, { passive: true });
  window.addEventListener("load", revealCheck);
  revealCheck();
  setTimeout(revealCheck, 180);

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("[data-reveal], [data-split]").forEach(function (el) { io.observe(el); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    q.addEventListener("click", function () {
      var open = item.classList.contains("open");
      item.closest(".faq").querySelectorAll(".faq-item.open").forEach(function (o) {
        o.classList.remove("open");
      });
      if (!open) item.classList.add("open");
    });
  });

  /* ---------- Contact form (FormSubmit AJAX) ---------- */
  var form = document.getElementById("enquiry-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("form-status");
      var btn = form.querySelector("button[type=submit]");
      var original = btn.innerHTML;
      btn.innerHTML = "Sending…";
      btn.disabled = true;
      status.className = "form-status";

      fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (r) { return r.json(); })
        .then(function () {
          status.textContent = "Thank you! Your enquiry has been sent — we'll get back to you shortly.";
          status.classList.add("ok");
          form.reset();
        })
        .catch(function () {
          status.textContent = "Something went wrong. Please call us on +353 89 223 5714 or email directly.";
          status.classList.add("err");
        })
        .finally(function () {
          btn.innerHTML = original;
          btn.disabled = false;
        });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
