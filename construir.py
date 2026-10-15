#!/usr/bin/env python3
"""Genera la web de Zas: index.html (español) y en/index.html (inglés) a partir de
plantilla.html, más sitemap.xml y robots.txt. Las dos páginas llevan todo su texto escrito
(sin depender de JavaScript), para que Google indexe cada idioma por separado.

    python3 construir.py            # la versión publicada la pregunta a GitHub

Para cambiar textos: el castellano está en plantilla.html; el inglés, en EN.
Las cifras de rendimiento, en MEDIDAS (salen de ~/zas-web-medios/medir.ps1).
"""
import html
import json
import re
import urllib.request
from datetime import date
from pathlib import Path

SITIO = "https://zas-player.github.io"
DESCARGA = "https://github.com/Zas-Player/zas-releases/releases/latest/download/Zas-Setup.exe"
AQUI = Path(__file__).parent

# Zas 1.15.1, 14-oct-2026: Ryzen 5 3600, RTX 2060, 32 GB, Windows 11, 2560x1440
MEDIDAS = {"abrir_ms": 378, "clip_s": 0.14, "frio_ms": 710}

PAGINA = {
    "es": {
        "url": SITIO + "/",
        "titulo": "Zas Player: reproductor de vídeo y grabador de pantalla gratis para Windows",
        "descripcion": "Descarga Zas Player, el reproductor de vídeo gratis para Windows 10 y 11 que abre al instante. "
                       "Graba la pantalla con sonido, recorta vídeos sin perder calidad y edita clips. Sin anuncios.",
        "og_titulo": "Zas Player · Abre. Recorta. Comparte.",
        "locale": "es_ES",
        "otra": ("en", SITIO + "/en/", "/en/", "EN", "Read this page in English"),
    },
    "en": {
        "url": SITIO + "/en/",
        "titulo": "Zas Player: free video player and screen recorder for Windows",
        "descripcion": "Download Zas Player, the free video player for Windows 10 and 11 that opens instantly. "
                       "Record your screen with sound, trim videos without quality loss and edit clips. No ads.",
        "og_titulo": "Zas Player · Open. Trim. Share.",
        "locale": "en_US",
        "otra": ("es", SITIO + "/", "/", "ES", "Leer esta página en español"),
    },
}

EN = {
    "saltar": "Skip to content",
    "nav-rendimiento": "Performance", "nav-funciones": "Features",
    "descargar-corto": "Download", "descargar": "Download Zas", "descargar-windows": "Download Zas for Windows",
    "versiones": "See releases",
    "antetitulo": "Free video player for Windows",
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
    "alt-recortar": "The Zas timeline with a part marked in amber", "alt-compartir": "Zas saying the clip is saved and copied",
    "func-ante": "One app, not three", "func-titulo": "Everything you do with your videos.",
    "b1-titulo": "Play", "b1-texto": "It stays in memory after closing, so the next video shows up as soon as you open it. The interface disappears when you’re not using it and it plays almost any format. It’s also a fast photo viewer: JPEG, PNG, WebP, HEIC, AVIF and more.",
    "alt-reproduce": "Zas playing a video full screen, with the controls at the bottom",
    "b2-titulo": "Edit", "b2-texto": "Split and remove parts on the timeline. Add text, boxes, arrows, pixelated areas and animated zoom, each with its own start and end. Export and it’s copied.",
    "b2-atajo": "opens the editor", "alt-editor": "The Zas editor with a text, an arrow and a box over the video",
    "b3-titulo": "Record and share", "b3-texto": "Drag a region of the screen and record with system audio and the microphone of your choice. Encoded by the graphics card, up to 120 fps. Instant replay saves the last seconds when something happens.",
    "a-grabar": "Record the screen", "a-repeticion": "Save the replay", "a-panel": "Recording panel",
    "alt-panel": "The Zas recording panel open on the left of the screen: record a region or the screen, instant replay, sound, quality, frames per second and codec",
    "final-titulo": "Open a video. Do much more.", "final-nota": "Free. No ads. Updates itself when you say so.",
    "faq-ante": "Questions", "faq-titulo": "What people usually ask.",
    "pie-versiones": "Releases", "creditos": "Built on", "y": "and", "stock": "Videos in the screenshots:", "bbb": "Measured with",
}

PREGUNTAS = {
    "es": [
        ("¿Qué es Zas Player?", "Zas (o Zas Player) es un reproductor de vídeo gratis para Windows 10 y 11 que abre al instante. Trae dentro un grabador de pantalla, un recortador de vídeos, un editor de clips y un visor de fotos."),
        ("¿Cómo descargo Zas?", "Pulsa «Descargar Zas» en esta página: baja el instalador oficial, Zas-Setup.exe, desde GitHub. Lo abres, se instala en segundos y a partir de ahí se actualiza solo cuando tú se lo pides."),
        ("¿Zas sirve para grabar la pantalla?", "Sí. Pulsa Win+Shift+R, arrastra una zona y graba con el sonido del sistema y el micrófono que elijas, hasta 120 fps y codificado por la tarjeta gráfica. La repetición instantánea guarda los últimos segundos con Win+Shift+G, y Alt+Z abre el panel de grabación."),
        ("¿Es gratis? ¿Tiene anuncios?", "Es gratis, sin anuncios y sin crear ninguna cuenta."),
        ("¿Qué formatos abre?", "Casi cualquier vídeo (MP4, MKV, WebM, MOV, AVI, WMV, TS…) gracias a mpv y FFmpeg, y fotos en JPEG, PNG, WebP, HEIC, AVIF y más."),
    ],
    "en": [
        ("What is Zas Player?", "Zas (or Zas Player) is a free video player for Windows 10 and 11 that opens instantly. It has a screen recorder, a video trimmer, a clip editor and a photo viewer built in."),
        ("How do I download Zas?", "Click “Download Zas” on this page: it downloads the official installer, Zas-Setup.exe, from GitHub. Open it, it installs in seconds and from then on it updates itself when you say so."),
        ("Can Zas record my screen?", "Yes. Press Win+Shift+R, drag a region and record with system audio and the microphone of your choice, up to 120 fps and encoded by the graphics card. Instant replay saves the last seconds with Win+Shift+G, and Alt+Z opens the recording panel."),
        ("Is it free? Does it have ads?", "It’s free, with no ads and no account to create."),
        ("What formats does it open?", "Almost any video (MP4, MKV, WebM, MOV, AVI, WMV, TS…) thanks to mpv and FFmpeg, and photos in JPEG, PNG, WebP, HEIC, AVIF and more."),
    ],
}

METODO = {
    "es": (
        "<p>Zas 1.15.1, la versión que se descarga aquí, en un PC con AMD Ryzen 5 3600, NVIDIA GeForce RTX 2060, 32 GB de memoria y Windows 11, con la pantalla a 2560×1440. "
        "Vídeo de prueba: un minuto de Big Buck Bunny (H.264, 1080p a 60 fps) y dos versiones de 10 s hechas a partir de él (H.265 en 4K a 30 fps y VP9 1080p a 30 fps).</p>"
        "<table><tr><th></th><th>H.264 1080p60</th><th>H.265 2160p30</th><th>VP9 1080p30</th></tr>"
        "<tr><td>Abrir con Zas en memoria</td><td>378 ms</td><td>134 ms</td><td>125 ms</td></tr>"
        "<tr><td>Abrir con Zas cerrado</td><td>710 ms</td><td>595 ms</td><td>514 ms</td></tr></table>"
        "<p><b>Abrir</b>: desde que se lanza <code>zas.exe vídeo</code> (lo mismo que un doble clic) hasta el primer fotograma en pantalla. Medianas de 8 aperturas en memoria y 5 desde cero. "
        "Con Zas en memoria, 2 de las 24 aperturas tardaron más (0,7 y 2,9 s); con Zas cerrado, la más lenta fue de 0,83 s. El archivo ya estaba en la caché de Windows.</p>"
        "<p><b>Clip copiado</b>: marcar un tramo de 12 s y pulsar Ctrl+E (sin recodificar) hasta que el archivo está en el portapapeles. Mediana de 5 tomas: 0,14 s; la primera tardó 33 s y está sin explicar. "
        "Al fotograma exacto (recodificando, Ctrl+Shift+E) el mismo tramo tarda de 4,6 a 5,0 s.</p>"
        "<p><b>Memoria</b>: 99 MB en reposo (en segundo plano, lista para abrir) y unos 300 MB reproduciendo el vídeo 1080p60.</p>"
        "<p>Son medidas de un equipo concreto: en el tuyo pueden variar.</p>"
    ),
    "en": (
        "<p>Zas 1.15.1, the version you download here, on a PC with an AMD Ryzen 5 3600, an NVIDIA GeForce RTX 2060, 32 GB of memory and Windows 11, with a 2560×1440 screen. "
        "Test video: one minute of Big Buck Bunny (H.264, 1080p at 60 fps) and two 10 s versions made from it (H.265 in 4K at 30 fps and VP9 1080p at 30 fps).</p>"
        "<table><tr><th></th><th>H.264 1080p60</th><th>H.265 2160p30</th><th>VP9 1080p30</th></tr>"
        "<tr><td>Open with Zas in memory</td><td>378 ms</td><td>134 ms</td><td>125 ms</td></tr>"
        "<tr><td>Open with Zas closed</td><td>710 ms</td><td>595 ms</td><td>514 ms</td></tr></table>"
        "<p><b>Open</b>: from launching <code>zas.exe video</code> (the same as a double-click) to the first frame on screen. Medians of 8 opens in memory and 5 from scratch. "
        "With Zas in memory, 2 of 24 opens took longer (0.7 and 2.9 s); with Zas closed, the slowest was 0.83 s. The file was already in the Windows cache.</p>"
        "<p><b>Clip copied</b>: marking a 12 s part and pressing Ctrl+E (no re-encoding) until the file is on the clipboard. Median of 5 runs: 0.14 s; the first took 33 s and is unexplained. "
        "Frame-accurate (re-encoding, Ctrl+Shift+E), the same part takes 4.6 to 5.0 s.</p>"
        "<p><b>Memory</b>: 99 MB idle (in the background, ready to open) and about 300 MB playing the 1080p60 video.</p>"
        "<p>These are measurements from one specific computer: yours may differ.</p>"
    ),
}


def version_publicada():
    try:
        with urllib.request.urlopen("https://api.github.com/repos/Zas-Player/zas-releases/releases/latest", timeout=10) as r:
            return json.load(r)["tag_name"].lstrip("v")
    except Exception:
        return None


def numero(n, dec, lang):
    t = f"{n:.{dec}f}"
    return t.replace(".", ",") if lang == "es" else t


def cabeza(lang, version):
    p = PAGINA[lang]
    e = html.escape
    datos = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Zas Player",
        "alternateName": ["Zas", "Zas video player", "Zas screen recorder", "Zas Player for Windows"],
        "url": p["url"],
        "description": p["descripcion"],
        "applicationCategory": "MultimediaApplication",
        "applicationSubCategory": "Video player" if lang == "en" else "Reproductor de vídeo",
        "operatingSystem": "Windows 10, Windows 11",
        "downloadUrl": DESCARGA,
        "installUrl": DESCARGA,
        "image": SITIO + "/img/og.jpg",
        "screenshot": [SITIO + "/img/reproductor-1600.webp", SITIO + "/img/editor-1600.webp", SITIO + "/img/panel-1600.webp"],
        "inLanguage": ["es", "en"],
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"},
        "featureList": ["Reproductor de vídeo", "Recortar vídeos sin recodificar", "Grabar la pantalla con sonido",
                        "Repetición instantánea", "Editor de clips", "Visor de imágenes"] if lang == "es" else
                       ["Video player", "Trim videos without re-encoding", "Screen recording with sound",
                        "Instant replay", "Clip editor", "Image viewer"],
    }
    if version:
        datos["softwareVersion"] = version
    sitio = {"@context": "https://schema.org", "@type": "WebSite", "name": "Zas Player", "alternateName": "Zas", "url": SITIO + "/", "inLanguage": lang}
    faq = {"@context": "https://schema.org", "@type": "FAQPage", "inLanguage": lang,
           "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": r}} for q, r in PREGUNTAS[lang]]}
    alternas = "\n".join([
        f'<link rel="alternate" hreflang="es" href="{SITIO}/">',
        f'<link rel="alternate" hreflang="en" href="{SITIO}/en/">',
        f'<link rel="alternate" hreflang="x-default" href="{SITIO}/">',
    ])
    otra_locale = PAGINA[p["otra"][0]]["locale"]
    # el idioma del navegador, antes de pintar nada: lo elegido con el botón manda; los
    # buscadores no se redirigen (cada idioma se indexa en su página, con hreflang)
    idioma = (
        "<script>(function(){try{"
        "if(/bot|crawl|spider|slurp|mediapartners|lighthouse|preview|facebookexternalhit|embedly/i.test(navigator.userAgent))return;"
        "var e=null;try{e=localStorage.getItem('zas-idioma')}catch(_){}"
        "var n=((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase();"
        "var q=e||(n.indexOf('es')===0?'es':'en');"
        f"if(q!=='{lang}')location.replace((q==='es'?'/':'/en/')+location.hash);"
        "}catch(_){}})();</script>\n"
    )
    return idioma + f"""<title>{e(p['titulo'])}</title>
<meta name="description" content="{e(p['descripcion'])}">
<meta name="theme-color" content="#141518">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{p['url']}">
{alternas}
<link rel="icon" href="/icono.svg" type="image/svg+xml">
<link rel="icon" href="/icono-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="/img/icono-180.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Zas Player">
<meta property="og:url" content="{p['url']}">
<meta property="og:title" content="{e(p['og_titulo'])}">
<meta property="og:description" content="{e(p['descripcion'])}">
<meta property="og:image" content="{SITIO}/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="{p['locale']}">
<meta property="og:locale:alternate" content="{otra_locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(p['og_titulo'])}">
<meta name="twitter:description" content="{e(p['descripcion'])}">
<meta name="twitter:image" content="{SITIO}/img/og.jpg">
<script type="application/ld+json">{json.dumps(datos, ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(sitio, ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(faq, ensure_ascii=False)}</script>"""


def pagina(plantilla, lang, version):
    s = plantilla
    if lang == "en":
        def texto(m):
            k = m.group(3)
            return m.group(1) + (html.escape(EN[k], quote=False) if k in EN else m.group(4)) + m.group(5)
        s = re.sub(r'(<(\w+)\b[^>]*\sdata-i="([^"]+)"[^>]*>)(.*?)(</\2>)', texto, s, flags=re.S)

        def alt(m):
            k = m.group(1)
            if k not in EN:
                return m.group(0)
            return re.sub(r'\salt="[^"]*"', lambda _: ' alt="' + html.escape(EN[k], quote=True) + '"', m.group(0))
        s = re.sub(r'<img\b[^>]*data-i-alt="([^"]*)"[^>]*>', alt, s, flags=re.S)
    # las marcas de traducción no hacen falta en la página
    s = re.sub(r'\sdata-i(-alt)?="[^"]*"', "", s)
    p = PAGINA[lang]
    otra = p["otra"]
    vt = (" · " + ("versión " if lang == "es" else "version ") + version) if version else ""
    for k, v in {
        "{{CABEZA}}": cabeza(lang, version), "{{LANG}}": lang, "{{INICIO}}": "/" if lang == "es" else "/en/",
        "{{OTRA_URL}}": otra[2], "{{OTRA_LANG}}": otra[0], "{{OTRA_CORTO}}": otra[3], "{{OTRA_ETIQUETA}}": otra[4],
        "{{VERSION_TEXTO}}": vt, "{{C1}}": numero(MEDIDAS["abrir_ms"], 0, lang), "{{C2}}": numero(MEDIDAS["clip_s"], 2, lang),
        "{{C3}}": numero(MEDIDAS["frio_ms"], 0, lang), "{{METODO}}": METODO[lang],
        "{{PREGUNTAS}}": "\n".join(f'        <details class="pregunta"><summary><h3>{html.escape(q)}</h3></summary><p>{html.escape(r)}</p></details>'
                                   for q, r in PREGUNTAS[lang]),
    }.items():
        s = s.replace(k, v)
    assert "{{" not in s, re.findall(r"\{\{\w+\}\}", s)
    return s


def main():
    plantilla = (AQUI / "plantilla.html").read_text(encoding="utf-8")
    version = version_publicada()
    (AQUI / "index.html").write_text(pagina(plantilla, "es", version), encoding="utf-8")
    (AQUI / "en").mkdir(exist_ok=True)
    (AQUI / "en" / "index.html").write_text(pagina(plantilla, "en", version), encoding="utf-8")
    hoy = date.today().isoformat()
    urls = []
    for lang in ("es", "en"):
        urls.append(f"""  <url>
    <loc>{PAGINA[lang]['url']}</loc>
    <lastmod>{hoy}</lastmod>
    <xhtml:link rel="alternate" hreflang="es" href="{SITIO}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="{SITIO}/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="{SITIO}/"/>
  </url>""")
    (AQUI / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
                                      + "\n".join(urls) + "\n</urlset>\n", encoding="utf-8")
    (AQUI / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITIO}/sitemap.xml\n", encoding="utf-8")
    print("hecho; versión", version)


if __name__ == "__main__":
    main()
