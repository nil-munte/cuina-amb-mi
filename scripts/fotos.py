"""Prepara les fotos d'una recepta per publicar-les.

Converteix les fotos (HEIC, JPG, PNG) a WebP de 2000 px pel costat llarg, en corregeix
l'orientació i n'elimina totes les metadades (inclosa la ubicació GPS), perquè el
repositori és públic. Els originals no es modifiquen.

Ús:
    python scripts/fotos.py <carpeta-amb-les-fotos-originals> <carpeta-de-la-recepta> [--portada NOM]

Exemple:
    python scripts/fotos.py "D:/Receptes/2026-10-12 Fricando" receptes/2026-10-12-fricando-amb-moixernons --portada IMG_1234.HEIC

Cada foto es desa a <carpeta-de-la-recepta>/fotos/ amb un nom net. La foto indicada a
--portada es desa com a portada.webp. Requereix: pip install -r scripts/requirements.txt
"""

import argparse
import re
import sys
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

COSTAT_MAXIM = 2000
QUALITAT = 82
EXTENSIONS = {".heic", ".heif", ".jpg", ".jpeg", ".png", ".webp"}


def nom_net(nom: str) -> str:
    s = unicodedata.normalize("NFD", nom).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-") or "foto"


def converteix(origen: Path, desti: Path) -> None:
    with Image.open(origen) as img:
        img = ImageOps.exif_transpose(img)
        img.thumbnail((COSTAT_MAXIM, COSTAT_MAXIM))
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")
        # Només es conserva el perfil de color; fora EXIF, GPS i XMP.
        icc = img.info.get("icc_profile")
        img.info.clear()
        opcions = {"icc_profile": icc} if icc else {}
        img.save(desti, "WEBP", quality=QUALITAT, method=6, **opcions)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("originals", type=Path)
    p.add_argument("recepta", type=Path)
    p.add_argument("--portada", help="nom del fitxer original que serà la portada")
    a = p.parse_args()

    fotos = sorted(f for f in a.originals.iterdir() if f.suffix.lower() in EXTENSIONS)
    if not fotos:
        print(f"No hi ha fotos a {a.originals}", file=sys.stderr)
        return 1
    if a.portada and not any(f.name == a.portada for f in fotos):
        print(f"No trobo la portada {a.portada} a {a.originals}", file=sys.stderr)
        return 1

    desti = a.recepta / "fotos"
    desti.mkdir(parents=True, exist_ok=True)
    for f in fotos:
        nom = "portada" if f.name == a.portada else nom_net(f.stem)
        sortida = desti / f"{nom}.webp"
        converteix(f, sortida)
        print(f"{f.name} -> {sortida} ({sortida.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
