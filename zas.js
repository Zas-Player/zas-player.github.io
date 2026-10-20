// La web de Zas: la versión publicada (si GitHub no contesta, se queda la que trae la página),
// el borde de la cabecera al bajar y una aparición discreta. Todo el texto está en el HTML.
(function () {
  "use strict";
  var palabra = document.documentElement.getAttribute("data-version") || "version";

  if (window.fetch) {
    fetch("https://api.github.com/repos/Zas-Player/zas-releases/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var el = document.getElementById("version");
        if (d && d.tag_name && el) el.textContent = " · " + palabra + " " + d.tag_name.replace(/^v/, "");
      })
      .catch(function () {});
  }

  // la página de versiones: trae la lista de GitHub (puede haber salido alguna después de
  // construir la web) y la escribe igual que construir.py; las fechas, en el idioma de la página
  var lista = document.getElementById("lista-versiones");
  var lang = document.documentElement.lang || "en";
  var fechas = function () {
    if (!lista || !window.Intl) return;
    var f = new Intl.DateTimeFormat(lang, { year: "numeric", month: "long", day: "numeric" });
    lista.querySelectorAll("time[datetime]").forEach(function (t) {
      var d = new Date(t.getAttribute("datetime") + "T12:00:00Z");
      if (!isNaN(d)) t.textContent = f.format(d);
    });
  };
  var esc = function (t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };
  var notas = function (texto) {
    var linea = function (t) {
      return esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
    };
    var out = [], enLista = false;
    String(texto || "").replace(/\r/g, "").split("\n").forEach(function (l) {
      l = l.trim();
      var m = /^[-*] +(.*)/.exec(l);
      if (m && !enLista) { out.push("<ul>"); enLista = true; }
      if (!m && enLista) { out.push("</ul>"); enLista = false; }
      if (m) out.push("<li>" + linea(m[1]) + "</li>");
      else if (l) out.push("<p>" + linea(l.replace(/^#+ */, "")) + "</p>");
    });
    if (enLista) out.push("</ul>");
    return out.join("");
  };
  var pintar = function (vs) {
    var d = lista.dataset;
    lista.innerHTML = vs.map(function (v, i) {
      var num = v.tag_name.replace(/^v/, ""), fecha = (v.published_at || "").slice(0, 10), bajadas = "";
      (v.assets || []).forEach(function (a) {
        var nombre = /\.exe$/.test(a.name) ? d.instalador : /\.zip$/.test(a.name) ? d.portable : null;
        if (nombre) bajadas += '<a class="bajada" href="' + esc(a.browser_download_url) + '">' + esc(nombre) + " <span>" + Math.round(a.size / 1e6) + " MB</span></a>";
      });
      return '<article class="version" id="v' + esc(num) + '"><header><h2>' + esc(num) +
        (i === 0 ? ' <span class="ultima">' + esc(d.ultima) + "</span>" : "") + '</h2><time datetime="' + esc(fecha) + '">' + esc(fecha) +
        '</time></header><div class="notas">' + notas(v.body) + '</div><div class="bajadas">' + bajadas + "</div></article>";
    }).join("");
  };
  if (lista) {
    fechas();
    var traer = function (pag, acc) {
      return fetch("https://api.github.com/repos/Zas-Player/zas-releases/releases?per_page=100&page=" + pag, { headers: { Accept: "application/vnd.github+json" } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (lote) {
          acc = acc.concat(lote.filter(function (v) { return !v.draft; }));
          return lote.length < 100 ? acc : traer(pag + 1, acc);
        });
    };
    if (window.fetch) traer(1, []).then(function (vs) {
      if (!vs.length) return;
      var primera = lista.querySelector(".version h2");
      var ya = lista.querySelectorAll(".version").length;
      if (vs.length !== ya || !primera || primera.firstChild.nodeValue.trim() !== vs[0].tag_name.replace(/^v/, "")) { pintar(vs); fechas(); }
    }).catch(function () {
      if (!lista.querySelector(".version")) document.getElementById("versiones-error").hidden = false;
    });
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
