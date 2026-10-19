(function () {
  var titles = {
    es: "Arturo Mandujano — desarrollador web",
    en: "Arturo Mandujano — web developer",
  };
  var descriptions = {
    es: "Desarrollador web de producto en PromoSelect, Guadalajara. Tienda pública y plataforma comercial.",
    en: "Web developer doing product work at PromoSelect, Guadalajara. Public store and commercial platform.",
  };

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
    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", lang === "en" ? "en_US" : "es_MX");
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
    button.addEventListener("click", function () {
      apply(button.getAttribute("data-set-lang"));
    });
  });

  apply(document.documentElement.dataset.lang === "en" ? "en" : "es");
})();
