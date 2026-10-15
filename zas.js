// La web de Zas: la versión publicada (si GitHub no contesta, se queda la que trae la página),
// el borde de la cabecera al bajar y una aparición discreta. Todo el texto está en el HTML.
(function () {
  "use strict";
  var es = document.documentElement.lang === "es";

  if (window.fetch) {
    fetch("https://api.github.com/repos/Zas-Player/zas-releases/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.tag_name) document.getElementById("version").textContent = " · " + (es ? "versión " : "version ") + d.tag_name.replace(/^v/, "");
      })
      .catch(function () {});
  }

  // elegir idioma con el botón: se recuerda y manda sobre el del navegador
  var boton = document.querySelector(".idioma");
  if (boton) boton.addEventListener("click", function () {
    try { localStorage.setItem("zas-idioma", boton.getAttribute("hreflang")); } catch (e) {}
  });

  var cab = document.querySelector(".cabecera");
  var alBajar = function () { cab.classList.toggle("con-borde", window.scrollY > 8); };
  window.addEventListener("scroll", alBajar, { passive: true });
  alBajar();

  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var obs = new IntersectionObserver(function (es2) {
      es2.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("visto"); obs.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".cifras, .secuencia li, .bloque").forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("aparece"); obs.observe(el); }
    });
  }
})();
