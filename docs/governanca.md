# Governança del repositori

Com es treballa en aquest repositori: qui pot fer què, quines regles protegeixen
la branca principal i com es canvia la configuració.

## Com es treballa

```
1. Crea una branca des de main i fes-hi els canvis (una recepta nova, un canvi a la web...)
2. Fes push de la branca i obre una pull request cap a main
3. El workflow «Web» comprova la PR (check «Build»): si una recepta té la capçalera malament, falla
4. Nil Munté Guerrero revisa la PR i, si és correcta, la fusiona (squash)
5. En fusionar-la, el mateix workflow publica la web a GitHub Pages
```

Ningú no pot fer push directe a `main`, ni tampoc *force push* ni esborrar-la.

## Qui pot fer què

| Qui | Rol | Obrir PR | Aprovar | Fusionar |
|---|---|---|---|---|
| Nil Munté Guerrero (@nil-munte) | admin | Sí | Sí, és el code owner (no les seves pròpies) | Sí, també les seves PR sense aprovació |
| Dependabot | — | Sí, PR d'actualització de dependències | No | No |

- **Aprovar** una PR és donar-hi el vistiplau. Només compta l'aprovació dels
  code owners (`.github/CODEOWNERS`).
- **Fusionar-la** a `main` només ho pot fer Nil Munté Guerrero (@nil-munte).
  Com que GitHub no deixa aprovar una PR pròpia, és a la *bypass list* de la
  regla i pot fusionar les seves PR sense aprovació.

## Configuració

A **Settings** del repositori:

| On | Valor |
|---|---|
| **Rules → Rulesets → Protecció de main** | Branca principal. *Restrict deletions*, *Block force pushes*, *Require a pull request* (1 aprovació del code owner; es descarta amb commits nous; només *squash*), *Require status checks* (`Build`) i *Restrict updates*. *Bypass list:* @nil-munte, *For pull requests only* |
| **General → Pull Requests** | Només *Allow squash merging* (missatge: títol i descripció de la PR) i *Automatically delete head branches* |
| **Actions → General → Workflow permissions** | Lectura. Desmarcat: *Allow GitHub Actions to create and approve pull requests* |
| **Pages** | Font: *GitHub Actions*. Entorn `github-pages`: només desplega des de `main` |
| **Code security** | Alertes i actualitzacions de seguretat de Dependabot actives; `.github/dependabot.yml` revisa npm, pip i Actions cada mes |
| **Collaborators and teams** | Vegeu «Qui pot fer què» |
| `.github/CODEOWNERS` | `* @nil-munte` |

Per canviar qui aprova, edita `.github/CODEOWNERS` amb una PR. Per canviar qui
fusiona, edita la *Bypass list* de la regla.

## Si alguna cosa falla

| Símptoma | Causa | Què fer |
|---|---|---|
| La PR es queda esperant «Build» | El workflow no s'ha executat | Comprova que `.github/workflows/deploy.yml` és a `main` i no té filtres a `pull_request` |
| El check «Build» falla | Una recepta té la capçalera incorrecta o el build peta | Mira el log: indica la recepta i el camp |
| *Review required* | Falta l'aprovació del code owner | Si la PR és de Nil, la pot fusionar igualment |
| *Merging is blocked* per a qui no és Nil | *Restrict updates* | És el comportament esperat: la fusiona Nil |
| Un workflow falla en fer push a `main` | *Restrict updates* | Els workflows no poden escriure a la branca principal: publica a artefactes |
