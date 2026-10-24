// Transforma el cos d'una recepta en Markdown per a la web:
// - treu el títol (# ...) i la foto de portada inicial, que la pàgina ja mostra a la capçalera;
// - agrupa cada secció ## en una nota (<section class="panel">);
// - marca la quantitat de cada ingredient perquè es pugui recalcular segons les racions;
// - afegeix el vídeo de YouTube de la capçalera després del procediment;
// - fa que els enllaços a altres webs s'obrin en una pestanya nova.

const FRACCIONS = { '½': 0.5, '¼': 0.25, '¾': 0.75 };
const QUANTITAT = /^(\s*)(\d+(?:[.,]\d+)?(?:\s*[½¼¾])?|[½¼¾])(?:\s*(kg|g|ml|cl|dl|l)\b)?/;
const NOTES_GROGUES = new Set(['recomanacions', 'notes']);

const esElement = (n, tag) => n && n.type === 'element' && (!tag || n.tagName === tag);
const esBuit = (n) => n.type === 'text' && !n.value.trim();

function text(node) {
  if (node.type === 'text') return node.value;
  return (node.children || []).map(text).join('');
}

function clau(s) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
}

function esParagrafDImatge(node) {
  if (!esElement(node, 'p')) return false;
  const fills = node.children.filter((c) => !esBuit(c));
  return fills.length === 1 && esElement(fills[0], 'img');
}

function valor(s) {
  let v = 0;
  for (const part of s.replace(',', '.').split(/\s+|(?=[½¼¾])/)) {
    if (!part) continue;
    v += FRACCIONS[part] ?? parseFloat(part);
  }
  return v;
}

function marcaQuantitat(li) {
  let pare = li;
  let t = li.children[0];
  if (esElement(t, 'p')) {
    pare = t;
    t = t.children[0];
  }
  if (!t || t.type !== 'text') return;
  const m = t.value.match(QUANTITAT);
  if (!m) return;
  const unitat = m[3] || '';
  const qty = {
    type: 'element',
    tagName: 'b',
    properties: { className: ['qty'], dataQ: String(valor(m[2])), dataU: unitat },
    children: [{ type: 'text', value: m[2].trim() + (unitat ? ` ${unitat}` : '') }],
  };
  const davant = m[1] ? [{ type: 'text', value: m[1] }] : [];
  pare.children.splice(0, 1, ...davant, qty, { type: 'text', value: t.value.slice(m[0].length) });
}

function recorreLi(node, fn) {
  for (const c of node.children || []) {
    if (esElement(c, 'li')) fn(c);
    recorreLi(c, fn);
  }
}

function enllacosExterns(node) {
  for (const c of node.children || []) {
    if (esElement(c, 'a') && /^https?:\/\//.test(String(c.properties?.href ?? ''))) {
      c.properties.target = '_blank';
      c.properties.rel = ['noopener', 'noreferrer'];
    }
    enllacosExterns(c);
  }
}

function idYoutube(url) {
  const m = String(url).match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function notaVideo(id) {
  return {
    type: 'element',
    tagName: 'section',
    properties: { className: ['panel', 'panel-video'] },
    children: [
      { type: 'element', tagName: 'h2', properties: {}, children: [{ type: 'text', value: 'Vídeo' }] },
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['video'] },
        children: [
          {
            type: 'element',
            tagName: 'iframe',
            properties: {
              src: `https://www.youtube-nocookie.com/embed/${id}`,
              title: 'Vídeo de la recepta',
              loading: 'lazy',
              allow: 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
              allowFullScreen: true,
            },
            children: [],
          },
        ],
      },
    ],
  };
}

export default function rehypePanels() {
  return (tree, file) => {
    const frontmatter = file.data?.astro?.frontmatter ?? {};
    const sortida = [];
    const ingredients = [];
    let actual = null;
    let portadaTreta = false;

    for (const node of tree.children) {
      if (!actual && esElement(node, 'h1')) continue;
      if (!actual && !portadaTreta && esParagrafDImatge(node)) {
        portadaTreta = true;
        continue;
      }
      if (esElement(node, 'h2')) {
        const k = clau(text(node));
        actual = {
          type: 'element',
          tagName: 'section',
          properties: { className: ['panel', `panel-${k}`, ...(NOTES_GROGUES.has(k) ? ['reco'] : [])] },
          children: [node],
        };
        if (k === 'ingredients') ingredients.push(actual);
        sortida.push(actual);
        continue;
      }
      if (actual) actual.children.push(node);
      else if (!esBuit(node)) sortida.push(node);
    }

    for (const seccio of ingredients) recorreLi(seccio, marcaQuantitat);

    const id = frontmatter.video ? idYoutube(frontmatter.video) : null;
    if (id) {
      const i = sortida.findIndex((n) => n.properties?.className?.includes('panel-procediment'));
      sortida.splice(i >= 0 ? i + 1 : sortida.length, 0, notaVideo(id));
    }

    tree.children = sortida;
    enllacosExterns(tree);
  };
}
