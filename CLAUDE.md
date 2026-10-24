# Cuina amb mi

Web de receptes personal. Astro + GitHub Pages: https://nil-munte.github.io/cuina-amb-mi/

## Com s'organitza

- Cada recepta és una carpeta `receptes/AAAA-MM-DD-nom-de-la-recepta/` amb:
  - `README.md`: la recepta sencera, consultable directament a GitHub.
  - `fotos/`: les fotos en WebP. La foto de portada és sempre `fotos/portada.webp`.
- `plantilla/recepta.md` és la plantilla base. La capçalera es valida a `src/content.config.ts`: si un camp falta o és incorrecte, el build falla.
- Dues tipologies: `tipus: feta` (es mostra «Feta per mi», en vermell) i `tipus: participada` («Hi he participat», en blau). Les participades han de tenir `origen` (on o amb qui).
- Categories fixes: Entrants, Plats principals, Acompanyaments, Postres.
- Vídeos: només l'enllaç de YouTube (no llistat) al camp `video`. Mai vídeos al repositori.

## Afegir una recepta

L'usuari treballa la recepta amb Claude i Claude la puja. Passos:

1. L'original sol ser un Word (`.docx`) amb fotos HEIC o JPG en una carpeta. Llegeix el Word i adapta'l a `plantilla/recepta.md`:
   - Seccions en aquest ordre: Ingredients → Estris → Procediment → Recomanacions → Notes → Inspiració (enllaços on es va inspirar) → Galeria. Si la recepta té parts (puré, salsa...), cada part és un subapartat `###` dins d'Ingredients i de Procediment. Les opcionals que no tinguin contingut s'ometen.
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
4. Crea una branca `recepta/<nom>`, fes commit i obre una PR amb `gh pr create` (vegeu la secció següent).

## Treballar amb pull requests

La branca `main` està protegida: no s'hi pot fer push directe.
Explicació completa: `docs/governanca.md`.

1. Posa't a `main`, fes `git pull` i crea una branca per al canvi
   (`git switch -c <nom-del-canvi>`).
2. Fes els canvis i valida'ls en local (`npm run build`).
3. Fes push de la branca i obre la PR amb `gh pr create`. Obrir-la no publica
   res: no cal demanar confirmació.
4. **No fusionis la PR.** Només la pot fusionar Nil Munté Guerrero (@nil-munte).
5. Comprova que el check `Build` acaba en verd (`gh pr checks`). Si falla,
   corregeix-ho i fes push a la mateixa branca.

Quan publiquis a GitHub (commits, PR, issues):
- **Sense atribució a Claude:** ni `Co-Authored-By: Claude …` als commits ni
  `Generated with Claude Code` a les PR o issues. Només hi ha de constar la
  persona que fa el canvi.
- **Sense adreces de correu** als missatges ni als fitxers que es pugen:
  identifica les persones pel nom i l'usuari de GitHub. Els commits es fan amb
  l'adreça noreply de GitHub de @nil-munte (ja configurada a la còpia local);
  mai amb l'adreça de feina.

Textos de la web en català.
