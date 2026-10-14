// Medidas reales de Zas 1.15.1 (la versión publicada), tomadas el 14-oct-2026 en este equipo:
// AMD Ryzen 5 3600, NVIDIA GeForce RTX 2060, 32 GB, Windows 11 (26200), pantalla 2560x1440.
// Script: medir.ps1 (instancia de Zas aparte, sin tocar la instalada). Si se repiten, se
// cambian aquí; null deja la cifra en "—".
window.ZAS_MEDIDAS = {
  cifras: {
    abrir: 378,   // ms, mediana, H.264 1080p60, con Zas en memoria (8 aperturas)
    clip: 0.14,   // s, mediana, tramo de 12 s sin recodificar, hasta estar en el portapapeles (5 tomas)
    frio: 710     // ms, mediana, H.264 1080p60, con Zas cerrado (5 aperturas)
  },
  metodo: {
    es:
      "<p>Zas 1.15.1, la versión que se descarga aquí, en un PC con AMD Ryzen 5 3600, NVIDIA GeForce RTX 2060, 32 GB de memoria y Windows 11, con la pantalla a 2560×1440. " +
      "Vídeo de prueba: un minuto de Big Buck Bunny (H.264, 1080p a 60 fps) y dos versiones de 10 s hechas a partir de él (H.265 en 4K a 30 fps y VP9 1080p a 30 fps).</p>" +
      "<table><tr><th></th><th>H.264 1080p60</th><th>H.265 2160p30</th><th>VP9 1080p30</th></tr>" +
      "<tr><td>Abrir con Zas en memoria</td><td>378 ms</td><td>134 ms</td><td>125 ms</td></tr>" +
      "<tr><td>Abrir con Zas cerrado</td><td>710 ms</td><td>595 ms</td><td>514 ms</td></tr></table>" +
      "<p><b>Abrir</b>: desde que se lanza <code>zas.exe vídeo</code> (lo mismo que un doble clic) hasta el primer fotograma en pantalla. Medianas de 8 aperturas en memoria y 5 desde cero. " +
      "Con Zas en memoria, 2 de las 24 aperturas tardaron más (0,7 y 2,9 s); con Zas cerrado, la más lenta fue de 0,83 s. El archivo ya estaba en la caché de Windows.</p>" +
      "<p><b>Clip copiado</b>: marcar un tramo de 12 s y pulsar Ctrl+E (sin recodificar) hasta que el archivo está en el portapapeles. Mediana de 5 tomas: 0,14 s; la primera tardó 33 s y está sin explicar. " +
      "Al fotograma exacto (recodificando, Ctrl+Shift+E) el mismo tramo tarda de 4,6 a 5,0 s.</p>" +
      "<p><b>Memoria</b>: 99 MB en reposo (en segundo plano, lista para abrir) y unos 300 MB reproduciendo el vídeo 1080p60.</p>" +
      "<p>Son medidas de un equipo concreto: en el tuyo pueden variar.</p>",
    en:
      "<p>Zas 1.15.1, the version you download here, on a PC with an AMD Ryzen 5 3600, an NVIDIA GeForce RTX 2060, 32 GB of memory and Windows 11, with a 2560×1440 screen. " +
      "Test video: one minute of Big Buck Bunny (H.264, 1080p at 60 fps) and two 10 s versions made from it (H.265 in 4K at 30 fps and VP9 1080p at 30 fps).</p>" +
      "<table><tr><th></th><th>H.264 1080p60</th><th>H.265 2160p30</th><th>VP9 1080p30</th></tr>" +
      "<tr><td>Open with Zas in memory</td><td>378 ms</td><td>134 ms</td><td>125 ms</td></tr>" +
      "<tr><td>Open with Zas closed</td><td>710 ms</td><td>595 ms</td><td>514 ms</td></tr></table>" +
      "<p><b>Open</b>: from launching <code>zas.exe video</code> (the same as a double-click) to the first frame on screen. Medians of 8 opens in memory and 5 from scratch. " +
      "With Zas in memory, 2 of 24 opens took longer (0.7 and 2.9 s); with Zas closed, the slowest was 0.83 s. The file was already in the Windows cache.</p>" +
      "<p><b>Clip copied</b>: marking a 12 s part and pressing Ctrl+E (no re-encoding) until the file is on the clipboard. Median of 5 runs: 0.14 s; the first took 33 s and is unexplained. " +
      "Frame-accurate (re-encoding, Ctrl+Shift+E), the same part takes 4.6 to 5.0 s.</p>" +
      "<p><b>Memory</b>: 99 MB idle (in the background, ready to open) and about 300 MB playing the 1080p60 video.</p>" +
      "<p>These are measurements from one specific computer: yours may differ.</p>"
  }
};
