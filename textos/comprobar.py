#!/usr/bin/env python3
"""Comprueba que textos/<código>.json tiene lo mismo que textos/en.json: las mismas claves,
las mismas listas, las mismas etiquetas HTML, los mismos números y nombres propios.

    python3 textos/comprobar.py fr de it
    python3 textos/comprobar.py            # no arguments: every textos/*.json (what CI runs)
"""
import json
import re
import sys
from pathlib import Path

AQUI = Path(__file__).parent
EN = json.loads((AQUI / "en.json").read_text(encoding="utf-8"))
FIJOS = ["Zas", "ShadowPlay", "OBS", "Medal", "Discord", "Windows", "NVIDIA", "AMD", "Intel"]


def plano(v, ruta=""):
    if isinstance(v, str):
        yield ruta, v
    elif isinstance(v, list):
        for i, x in enumerate(v):
            yield from plano(x, f"{ruta}[{i}]")
    elif isinstance(v, dict):
        for k, x in v.items():
            yield from plano(x, f"{ruta}.{k}" if ruta else k)


def mirar(codigo):
    f = AQUI / f"{codigo}.json"
    if not f.exists():
        return [f"falta {f.name}"]
    tr = json.loads(f.read_text(encoding="utf-8"))
    a, b = dict(plano(EN)), dict(plano(tr))
    mal = [f"falta {k}" for k in a if k not in b] + [f"sobra {k}" for k in b if k not in a]
    for k, en in a.items():
        t = b.get(k)
        if t is None:
            continue
        if not t.strip():
            mal.append(f"vacío {k}")
        if k.startswith("compara.filas") and not k.endswith("[0]") and en in ("si", "si*", "no"):
            if t != en:
                mal.append(f"{k}: tiene que seguir siendo {en!r}")
            continue
        if sorted(re.findall(r"</?\w+", en)) != sorted(re.findall(r"</?\w+", t)):
            mal.append(f"{k}: etiquetas HTML distintas")
        nums = lambda s: sorted(re.findall(r"\d+", s))
        if nums(en) != nums(t):
            mal.append(f"{k}: números distintos {nums(en)} -> {nums(t)}")
        for p in FIJOS:
            if p in en and p not in t:
                mal.append(f"{k}: falta {p!r}")
    return mal


if __name__ == "__main__":
    total = 0
    codes = sys.argv[1:] or sorted(f.stem for f in AQUI.glob("*.json") if f.stem != "en")
    for c in codes:
        m = mirar(c)
        total += len(m)
        print(f"{c}: " + ("bien" if not m else f"{len(m)} problemas"))
        for x in m[:30]:
            print("   " + x)
    sys.exit(1 if total else 0)
