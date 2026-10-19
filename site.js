(function () {
  var titles = {
    es: "Arturo Mandujano — desarrollador web",
    en: "Arturo Mandujano — web developer",
  };
  var descriptions = {
    es: "Arturo Mandujano, desarrollador web de producto en PromoSelect y autor de InBike Studio. Guadalajara.",
    en: "Arturo Mandujano, web developer doing product work at PromoSelect and author of the InBike Studio site. Guadalajara.",
  };
  var alts = {
    es: "Retrato de Arturo Mandujano",
    en: "Portrait of Arturo Mandujano",
  };
  var shotAlts = {
    suitup: {
      es: "Captura del sitio de Suitup",
      en: "Screenshot of the Suitup site",
    },
    promoselect: {
      es: "Captura de la tienda PromoSelect",
      en: "Screenshot of the PromoSelect store",
    },
    inbike: {
      es: "Captura del sitio de InBike Studio",
      en: "Screenshot of the InBike Studio site",
    },
    admin: {
      es: "Captura de la pantalla de inicio de sesión del admin de PromoSelect",
      en: "Screenshot of the PromoSelect admin sign-in screen",
    },
  };
  var regions = {
    es: "Trabajo",
    en: "Work",
  };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function apply(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    document.title = titles[lang];
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", descriptions[lang]);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", titles[lang]);
    var ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", descriptions[lang]);
    var twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", titles[lang]);
    var twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute("content", descriptions[lang]);
    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", lang === "en" ? "en_US" : "es_MX");
    var ogImageAlt = document.querySelector('meta[property="og:image:alt"]');
    if (ogImageAlt) ogImageAlt.setAttribute("content", alts[lang]);
    var twitterImageAlt = document.querySelector('meta[name="twitter:image:alt"]');
    if (twitterImageAlt) twitterImageAlt.setAttribute("content", alts[lang]);
    var portrait = document.getElementById("portrait");
    if (portrait) portrait.alt = alts[lang];
    document.querySelectorAll("[data-shot]").forEach(function (img) {
      var key = img.getAttribute("data-shot");
      if (shotAlts[key]) img.alt = shotAlts[key][lang];
    });
    var track = document.querySelector(".film-track");
    if (track) track.setAttribute("aria-label", regions[lang]);
    document.querySelectorAll("[data-set-lang]").forEach(function (button) {
      var active = button.getAttribute("data-set-lang") === lang;
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    var group = document.querySelector(".lang");
    if (group) group.setAttribute("aria-label", lang === "en" ? "Language" : "Idioma");
    var nav = document.querySelector("nav");
    if (nav) nav.setAttribute("aria-label", lang === "en" ? "Sections" : "Secciones");
    try {
      localStorage.setItem("lang", lang);
    } catch (error) {}
    var url = new URL(location.href);
    if (url.searchParams.get("lang") !== lang) {
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    }
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (button) {
    button.addEventListener("pointerdown", function () {
      button.dataset.pressed = "1";
    });
    button.addEventListener("click", function () {
      apply(button.getAttribute("data-set-lang"));
    });
  });

  apply(document.documentElement.dataset.lang === "en" ? "en" : "es");

  function rubberband(overshoot, dimension) {
    var constant = 0.55;
    return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
  }

  function project(velocity) {
    var deceleration = 0.998;
    return (velocity / 1000) * deceleration / (1 - deceleration);
  }

  function springTo(from, to, velocity, onUpdate) {
    var zeta = 1;
    var omega = (2 * Math.PI) / 0.45;
    var x = from;
    var v = velocity || 0;
    var last = performance.now();
    var raf = 0;
    function frame(now) {
      var dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      var force = omega * omega * (to - x) - 2 * zeta * omega * v;
      v += force * dt;
      x += v * dt;
      onUpdate(x);
      if (Math.abs(to - x) < 0.4 && Math.abs(v) < 12) {
        onUpdate(to);
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return function () {
      cancelAnimationFrame(raf);
    };
  }

  var track = document.querySelector(".film-track");
  if (track && !reduceMotion.matches) {
    var drag = null;
    var stopSpring = null;
    var suppressClick = false;

    track.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      if (stopSpring) stopSpring();
      track.setPointerCapture(event.pointerId);
      drag = {
        x: event.clientX,
        scroll: track.scrollLeft,
        last: performance.now(),
        v: 0,
        moved: false,
      };
      track.classList.add("is-dragging");
    });

    track.addEventListener("pointermove", function (event) {
      if (!drag) return;
      var dx = event.clientX - drag.x;
      if (Math.abs(dx) > 8) drag.moved = true;
      var max = track.scrollWidth - track.clientWidth;
      var next = drag.scroll - dx;
      if (next < 0) next = rubberband(next, track.clientWidth);
      else if (next > max) next = max + rubberband(next - max, track.clientWidth);
      var now = performance.now();
      var dt = (now - drag.last) / 1000;
      if (dt > 0) drag.v = (next - track.scrollLeft) / dt;
      drag.last = now;
      track.scrollLeft = next;
    });

    function endDrag() {
      if (!drag) return;
      var velocity = drag.v;
      suppressClick = drag.moved;
      drag = null;
      track.classList.remove("is-dragging");
      var max = Math.max(0, track.scrollWidth - track.clientWidth);
      var projected = track.scrollLeft + project(velocity);
      var cards = Array.prototype.slice.call(track.children);
      var target = cards.reduce(function (best, card) {
        var left =
          card.getBoundingClientRect().left -
          track.getBoundingClientRect().left +
          track.scrollLeft;
        return Math.abs(left - projected) < Math.abs(best - projected) ? left : best;
      }, 0);
      target = Math.max(0, Math.min(max, target));
      stopSpring = springTo(track.scrollLeft, target, velocity, function (value) {
        track.scrollLeft = value;
      });
    }

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener(
      "click",
      function (event) {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      },
      true
    );

    track.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      var cards = Array.prototype.slice.call(track.children);
      var current = cards.reduce(function (best, card) {
        var left =
          card.getBoundingClientRect().left -
          track.getBoundingClientRect().left +
          track.scrollLeft;
        return Math.abs(left - track.scrollLeft) < Math.abs(best - track.scrollLeft) ? left : best;
      }, 0);
      var index = cards.findIndex(function (card) {
        var left =
          card.getBoundingClientRect().left -
          track.getBoundingClientRect().left +
          track.scrollLeft;
        return Math.abs(left - current) < 2;
      });
      var next = event.key === "ArrowRight" ? index + 1 : index - 1;
      if (next < 0 || next >= cards.length) return;
      event.preventDefault();
      var card = cards[next];
      var left =
        card.getBoundingClientRect().left -
        track.getBoundingClientRect().left +
        track.scrollLeft;
      if (stopSpring) stopSpring();
      stopSpring = springTo(track.scrollLeft, left, 0, function (value) {
        track.scrollLeft = value;
      });
    });
  }

  function revealElement(el, options) {
    var delay = options.delay || 0;
    var distanceY = options.distanceY == null ? 12 : options.distanceY;
    var distanceX = options.distanceX || 0;
    var duration = options.duration || 420;
    var startAt = performance.now() + delay;
    function tick(now) {
      if (now < startAt) {
        requestAnimationFrame(tick);
        return;
      }
      var t = Math.min(1, (now - startAt) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.style.opacity = String(eased);
      el.style.transform =
        "translate(" + distanceX * (1 - eased) + "px," + distanceY * (1 - eased) + "px)";
      if (t < 1) requestAnimationFrame(tick);
      else {
        el.style.opacity = "";
        el.style.transform = "";
      }
    }
    requestAnimationFrame(tick);
  }

  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    document.querySelectorAll(".chapter, .specs").forEach(function (el) {
      el.classList.add("reveal");
    });
    var seen = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          seen.unobserve(el);
          revealElement(el, { distanceY: 12 });
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      seen.observe(el);
    });

    document.querySelectorAll(".project-card").forEach(function (card, index) {
      var copy = card.querySelector(".project-copy");
      var shot = card.querySelector(".project-shot");
      var slideX = index % 2 === 0 ? 28 : -28;
      var cardSeen = new IntersectionObserver(
        function (entries) {
          if (!entries[0].isIntersecting) return;
          cardSeen.disconnect();
          if (copy) revealElement(copy, { distanceY: 14, duration: 460 });
          if (shot) {
            revealElement(shot, {
              delay: 90,
              distanceY: 18,
              distanceX: slideX,
              duration: 520,
            });
          }
        },
        { threshold: 0.18 }
      );
      cardSeen.observe(card);
    });

    var grid = document.querySelector(".logo-grid");
    if (grid) {
      var chips = Array.prototype.slice.call(grid.querySelectorAll(".logo-chip"));
      chips.forEach(function (chip) {
        chip.classList.add("reveal");
      });
      var gridSeen = new IntersectionObserver(
        function (entries) {
          if (!entries[0].isIntersecting) return;
          gridSeen.disconnect();
          chips.forEach(function (el, index) {
            var start = performance.now() + index * 42;
            function tick(now) {
              if (now < start) {
                requestAnimationFrame(tick);
                return;
              }
              var t = Math.min(1, (now - start) / 380);
              var eased = 1 - Math.pow(1 - t, 3);
              el.style.opacity = String(eased);
              el.style.transform = "translateY(" + (10 * (1 - eased)) + "px)";
              if (t < 1) requestAnimationFrame(tick);
              else {
                el.style.opacity = "";
                el.style.transform = "";
                el.classList.remove("reveal");
              }
            }
            requestAnimationFrame(tick);
          });
        },
        { threshold: 0.2 }
      );
      gridSeen.observe(grid);
    }
  }
})();
