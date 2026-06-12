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

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Auto-stagger reveals inside grids ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.setAttribute("data-reveal", "");
      child.style.setProperty("--d", (i * 0.09).toFixed(2) + "s");
      if (window.IntersectionObserver) {
        var io2 = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
        io2.observe(child);
      } else {
        child.classList.add("in");
      }
    });
  });

  /* ---------- Marquee: duplicate track content for seamless loop ---------- */
  document.querySelectorAll(".marquee-track").forEach(function (track) {
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
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
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
