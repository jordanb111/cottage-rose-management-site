// Cottage Rose Management — shared site behavior
// Nav toggle, scroll-reveal, and Formspree contact form handling.

(function () {
  "use strict";

  /* ---------- mobile nav toggle ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        navToggle.focus();
      }
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (revealEls.length && "IntersectionObserver" in window && !prefersReducedMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- hero slideshow: 10s cross-fade, pausable ---------- */
  var slides = document.querySelectorAll(".hero-slide");
  if (slides.length > 1) {
    var dots = document.querySelectorAll(".hero-dot");
    var current = 0;
    var timer = null;
    var INTERVAL = 10000;

    var show = function (i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("is-active", n === current); });
      dots.forEach(function (d, n) { d.setAttribute("aria-current", n === current ? "true" : "false"); });
    };
    var stop = function () { clearInterval(timer); timer = null; };
    var play = function () { stop(); timer = setInterval(function () { show(current + 1); }, INTERVAL); };

    dots.forEach(function (d, n) {
      d.addEventListener("click", function () { show(n); play(); });
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { stop(); } else { play(); }
    });
    play();
  }

  /* ---------- contact form (Formspree AJAX) ---------- */
  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");
  var successPanel = document.getElementById("form-success");
  var submitBtn = form.querySelector('button[type="submit"]');

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "form-status is-visible " + type;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Honeypot check
    var honeypot = form.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value) {
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    var formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    })
      .then(function (response) {
        if (response.ok) {
          form.reset();
          form.hidden = true;
          if (successPanel) { successPanel.hidden = false; successPanel.focus(); }
          if (statusEl) statusEl.className = "form-status";
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
          }
        } else {
          return response.json().then(function (data) {
            var message =
              data && data.errors
                ? data.errors.map(function (err) { return err.message; }).join(", ")
                : "Something went wrong sending your message.";
            throw new Error(message);
          });
        }
      })
      .catch(function () {
        setStatus(
          "We couldn't send that automatically. Please try again in a moment.",
          "error"
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Message";
        }
      });
  });
})();
