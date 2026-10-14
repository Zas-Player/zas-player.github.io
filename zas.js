// La web de Zas: el idioma (como Zas, sigue el del sistema), la versión publicada y poco más.
// La página se ve entera sin esto: el texto en castellano va en el HTML.
(function () {
  "use strict";

  // medidas de pruebas reales (ver "Cómo lo medimos"); null = aún sin medir, no se enseña cifra
  var MEDIDAS = window.ZAS_MEDIDAS || null;

  var EN = {
    "saltar": "Skip to content",
    "nav-rendimiento": "Performance", "nav-funciones": "Features",
    "descargar-corto": "Download", "descargar": "Download Zas", "descargar-windows": "Download Zas for Windows",
    "versiones": "See releases",
    "antetitulo": "Video player for Windows",
    "titular": "Open. Trim. Share.",
    "entradilla": "Zas opens your videos instantly. It also trims them, records your screen and edits clips, without switching apps.",
    "gratis": "Free · Windows 10 and 11 · No ads",
    "alt-reproductor": "The Zas window playing a video, with the timeline and controls at the bottom",
    "rend-ante": "Measured performance", "rend-titulo": "Speed is measured.",
    "cifra1-nombre": "To open a video", "cifra1-detalle": "From double-click to the first frame, with Zas in memory. Median for a 1080p60 video.",
    "cifra2-nombre": "To have a clip copied", "cifra2-detalle": "From pressing Ctrl+E to a 12 s clip on the clipboard, ready to paste.",
    "cifra3-nombre": "From scratch", "cifra3-detalle": "From double-click to the first frame with Zas fully closed.",
    "metodo-titulo": "How we measured it",
    "pasos-ante": "A clip in seconds", "pasos-titulo": "From video to chat in three keys.",
    "paso1": "Mark the part", "paso1-texto": "Start and end, while you watch.",
    "paso2": "Export", "paso2-texto": "No re-encoding: the clip is ready right away, at the original quality.",
    "paso3": "Paste", "paso3-texto": "It’s already on the clipboard: paste it into any chat.",
    "alt-reproduce": "Zas playing a video full screen, with the controls at the bottom", "alt-recortar": "The Zas timeline with a part marked in amber", "alt-compartir": "Zas saying the clip is saved and copied",
    "func-ante": "One app, not three", "func-titulo": "Everything you do with your videos.",
    "b1-titulo": "Play", "b1-texto": "It stays in memory after closing, so the next video shows up as soon as you open it. The interface disappears when you’re not using it and it plays almost any format. It’s also a fast photo viewer: JPEG, PNG, WebP, HEIC, AVIF and more.",
    "b2-titulo": "Edit", "b2-texto": "Split and remove parts on the timeline. Add text, boxes, arrows, pixelated areas and animated zoom, each with its own start and end. Export and it’s copied.",
    "b2-atajo": "opens the editor", "alt-editor": "The Zas editor with a text, an arrow and a box over the video",
    "b3-titulo": "Record and share", "b3-texto": "Drag a region of the screen and record with system audio and the microphone of your choice. Encoded by the graphics card, up to 120 fps. Instant replay saves the last seconds when something happens.",
    "a-grabar": "Record the screen", "a-repeticion": "Save the replay", "a-panel": "Recording panel",
    "final-titulo": "Open a video. Do much more.", "final-nota": "Free. No ads. Updates itself when you say so.",
    "pie-versiones": "Releases", "creditos": "Built on", "y": "and", "bbb": "Video in the screenshots:"
  };

  var ES = {};
  document.querySelectorAll("[data-i]").forEach(function (el) { ES[el.getAttribute("data-i")] = el.textContent; });
  document.querySelectorAll("[data-i-alt]").forEach(function (el) { ES[el.getAttribute("data-i-alt")] = el.getAttribute("alt"); });
  var TITULO = { es: document.title, en: "Zas · Video player for Windows that opens instantly" };

  var guardado = null;
  try { guardado = localStorage.getItem("zas-idioma"); } catch (e) {}
  var idioma = guardado || ((navigator.language || "es").toLowerCase().indexOf("es") === 0 ? "es" : "en");
  var boton = document.getElementById("idioma");
  var version = null;

  function numero(n, dec) {
    return n.toLocaleString(idioma === "es" ? "es-ES" : "en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function poner(i) {
    idioma = i;
    var t = i === "en" ? EN : ES;
    document.documentElement.lang = i;
    document.querySelectorAll("[data-i]").forEach(function (el) {
      var k = el.getAttribute("data-i");
      if (t[k] != null) el.textContent = t[k];
    });
    document.querySelectorAll("[data-i-alt]").forEach(function (el) {
      var k = el.getAttribute("data-i-alt");
      if (t[k] != null) el.setAttribute("alt", t[k]);
    });
    document.title = TITULO[i];
    boton.textContent = i === "es" ? "EN" : "ES";
    boton.setAttribute("aria-label", i === "es" ? "Change language to English" : "Cambiar el idioma a español");
    ponerVersion();
    ponerMedidas();
  }

  function ponerVersion() {
    var el = document.getElementById("version");
    el.textContent = version ? " · " + (idioma === "es" ? "versión " : "version ") + version : "";
  }

  function ponerMedidas() {
    if (!MEDIDAS) return;
    var c = MEDIDAS.cifras;
    if (c.abrir != null) document.getElementById("c1").textContent = numero(c.abrir, 0);
    if (c.clip != null) document.getElementById("c2").textContent = numero(c.clip, 2);
    if (c.frio != null) document.getElementById("c3").textContent = numero(c.frio, 0);
    var m = document.getElementById("metodo");
    m.innerHTML = idioma === "es" ? MEDIDAS.metodo.es : MEDIDAS.metodo.en;
  }

  boton.addEventListener("click", function () {
    var otro = idioma === "es" ? "en" : "es";
    try { localStorage.setItem("zas-idioma", otro); } catch (e) {}
    poner(otro);
  });

  // la última versión publicada (si GitHub no contesta, la página sigue igual)
  if (window.fetch) {
    fetch("https://api.github.com/repos/Zas-Player/zas-releases/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && d.tag_name) { version = d.tag_name.replace(/^v/, ""); ponerVersion(); } })
      .catch(function () {});
  }

  // la cabecera marca su borde al bajar
  var cab = document.querySelector(".cabecera");
  var alBajar = function () { cab.classList.toggle("con-borde", window.scrollY > 8); };
  window.addEventListener("scroll", alBajar, { passive: true });
  alBajar();

  // aparecer al llegar, apenas, si no se pide menos movimiento
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("visto"); obs.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".cifras, .secuencia li, .bloque").forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("aparece"); obs.observe(el); }
    });
  }

  poner(idioma);
})();
