# Cuina amb mi

Web de receptes personal. Astro + GitHub Pages: https://nil-munte.github.io/cuina-amb-mi/

## Com s'organitza

- Cada recepta és una carpeta `receptes/AAAA-MM-DD-nom-de-la-recepta/` amb:
  - `README.md`: la recepta sencera, consultable directament a GitHub.
  - `fotos/`: les fotos en WebP. La foto de portada és sempre `fotos/portada.webp`.
- `plantilla/recepta.md` és la plantilla base. La capçalera es valida a `src/content.config.ts`: si un camp falta o és incorrecte, el build falla.
- Dues tipologies: `tipus: feta` (es mostra «Feta per mi», en vermell) i `tipus: participada` («Hi he participat», en blau). Les participades han de tenir `origen` (on o amb qui).
- Categories fixes: Entrants, Plats principals, Postres.
- Vídeos: només l'enllaç de YouTube (no llistat) al camp `video`. Mai vídeos al repositori.

## Afegir una recepta

L'usuari treballa la recepta amb Claude i Claude la puja. Passos:

1. L'original sol ser un Word (`.docx`) amb fotos HEIC o JPG en una carpeta. Llegeix el Word i adapta'l a `plantilla/recepta.md`:
   - Seccions en aquest ordre: Ingredients → Estris → Procediment → Recomanacions → Notes → Galeria. Les opcionals que no tinguin contingut s'ometen.
   - Cada ingredient comença per la quantitat i la unitat (`600 g de…`, `2 cebes`, `½ l de…`): així la web pot recalcular les quantitats segons les racions. Unitats reconegudes: g, kg, ml, cl, dl, l.
   - Si falta una dada (racions, categoria, tipus, origen, data), pregunta-la. No inventis res.
   - Pregunta quina foto és la portada i quines fotos van a cada pas. La resta van a Galeria.
2. Prepara les fotos (converteix, gira i elimina la ubicació GPS):
   ```
   pip install -r scripts/requirements.txt
   python scripts/fotos.py "<carpeta-originals>" receptes/<carpeta-recepta> --portada <fitxer-original>
   ```
   No pugis mai les fotos originals.
3. Comprova-ho amb `npm run build` (i `npm run dev` per veure-ho).
4. Crea una branca `recepta/<nom>`, fes commit i obre una PR amb `gh pr create`. **No fusionis**: l'usuari revisa la PR i la fusiona.

## Normes del repositori

- Mai push directe a `main`: sempre branca + PR.
- Commits amb `Nil Munté Guerrero <118383955+nil-munte@users.noreply.github.com>` (ja configurat al repo). Mai l'adreça de feina.
- Textos de la web en català.
