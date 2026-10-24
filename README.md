# Cuina amb mi

Les receptes que he cuinat i aquelles en què he participat, amb fotos de cada pas.

**Web:** https://nil-munte.github.io/cuina-amb-mi/

## Les receptes

Cada recepta és a [`receptes/`](receptes/), en una carpeta pròpia amb el text sencer (`README.md`) i les fotos (`fotos/`). Es poden llegir directament aquí a GitHub.

## Afegir-ne una

1. Copia [`plantilla/recepta.md`](plantilla/recepta.md) a `receptes/AAAA-MM-DD-nom/README.md` i omple-la.
2. Prepara les fotos: `python scripts/fotos.py <originals> receptes/AAAA-MM-DD-nom --portada <foto>`.
3. Obre una pull request. Quan es fusiona, la web s'actualitza sola.

## Desenvolupament

```
npm install
npm run dev
```
