// La web de Zas: la versión publicada (si GitHub no contesta, se queda la que trae la página),
// el borde de la cabecera al bajar y una aparición discreta. Todo el texto está en el HTML.
(function () {
  "use strict";
  var palabra = document.documentElement.getAttribute("data-version") || "version";

  if (window.fetch) {
    fetch("https://api.github.com/repos/Zas-Player/zas-releases/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.tag_name) document.getElementById("version").textContent = " · " + palabra + " " + d.tag_name.replace(/^v/, "");
      })
      .catch(function () {});
  }

  // elegir idioma en el selector: se recuerda y manda sobre el del navegador
  document.querySelectorAll(".idiomas a").forEach(function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem("zas-idioma", a.getAttribute("data-codigo")); } catch (e) {}
    });
  });
  var sel = document.querySelector(".idiomas");
  if (sel) document.addEventListener("click", function (ev) { if (sel.open && !sel.contains(ev.target)) sel.open = false; });

  // preguntas: abrir y cerrar con una animación de altura (sin ella si se pide menos movimiento)
  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".pregunta").forEach(function (d) {
    var s = d.querySelector("summary"), r = d.querySelector(".respuesta");
    if (!s || !r || quieto || !r.animate) return;
    var anim = null;
    s.addEventListener("click", function (ev) {
      ev.preventDefault();
      if (anim) anim.cancel();
      var abriendo = !d.open;
      if (abriendo) d.open = true;
      var alto = r.scrollHeight + "px";
      anim = r.animate({ height: abriendo ? ["0px", alto] : [alto, "0px"], opacity: abriendo ? [0, 1] : [1, 0] },
                       { duration: 220, easing: "cubic-bezier(.2,.7,.2,1)" });
      anim.onfinish = function () { anim = null; if (!abriendo) d.open = false; };
    });
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
