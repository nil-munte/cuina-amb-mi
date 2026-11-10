import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { dataLlarga, etiquetaTipus, type Recepta } from '../../lib/receptes';

// Genera un PDF real (només text, com la versió d'impressió) per a cada recepta,
// servit a /receptes/<id>.pdf perquè es pugui obrir en una finestra nova i compartir-lo.

export async function getStaticPaths() {
  const receptes = await getCollection('receptes');
  return receptes.map((r) => ({ params: { id: r.id }, props: { r } }));
}

export const prerender = true;

const AMPLE = 595.28; // A4
const ALT = 841.89;
const MARGE = 56;
const GRIS = rgb(0.4, 0.4, 0.4);
const NEGRE = rgb(0, 0, 0);

// Les fonts estàndard del PDF (WinAnsi) no tenen tots els caràcters Unicode.
const SUBSTITUCIONS: Record<string, string> = {
  '≈': '~', '−': '-', '–': '-', '—': '-', '→': '-', '’': "'", '‘': "'", '“': '"', '”': '"',
};
function neteja(s: string): string {
  let out = '';
  for (const ch of s) {
    if (SUBSTITUCIONS[ch]) { out += SUBSTITUCIONS[ch]; continue; }
    const c = ch.codePointAt(0)!;
    if ((c >= 32 && c <= 126) || (c >= 160 && c <= 255) || ch === '…' || ch === '•' || ch === '€') out += ch;
    else out += '?';
  }
  return out;
}

// Markdown mínim: fora èmfasi i imatges; els enllaços queden «text (url)».
function mdPla(s: string): string {
  return neteja(
    s
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .trim(),
  );
}

class Escriptor {
  doc!: PDFDocument;
  pag!: PDFPage;
  y = 0;
  regular!: PDFFont;
  negreta!: PDFFont;

  async init() {
    this.doc = await PDFDocument.create();
    this.regular = await this.doc.embedFont(StandardFonts.Helvetica);
    this.negreta = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.novaPagina();
  }

  novaPagina() {
    this.pag = this.doc.addPage([AMPLE, ALT]);
    this.y = ALT - MARGE;
  }

  espai(n: number) {
    this.y -= n;
    if (this.y < MARGE + 30) this.novaPagina();
  }

  linia(text: string, mides: { font?: PDFFont; mida?: number; color?: typeof NEGRE; indent?: number; penjant?: number; abans?: number; despres?: number }) {
    const font = mides.font ?? this.regular;
    const mida = mides.mida ?? 11;
    const interlinia = mida * 1.45;
    this.espai(mides.abans ?? 0);
    const maxAmple = AMPLE - 2 * MARGE - (mides.indent ?? 0);
    const paraules = text.split(/\s+/).filter(Boolean);
    let linia = '';
    let primera = true;
    const dibuixa = (l: string) => {
      if (this.y < MARGE + 30) { this.novaPagina(); }
      const x = MARGE + (mides.indent ?? 0) + (primera ? 0 : (mides.penjant ?? 0));
      this.pag.drawText(l, { x, y: this.y, size: mida, font, color: mides.color ?? NEGRE });
      this.y -= interlinia;
      primera = false;
    };
    for (const p of paraules) {
      const prova = linia ? `${linia} ${p}` : p;
      if (font.widthOfTextAtSize(prova, mida) > maxAmple - (primera ? 0 : (mides.penjant ?? 0)) && linia) {
        dibuixa(linia);
        linia = p;
      } else {
        linia = prova;
      }
    }
    if (linia) dibuixa(linia);
    this.espai(mides.despres ?? 0);
  }
}

export const GET: APIRoute = async ({ props }) => {
  const r = props.r as Recepta;
  const d = r.data;

  const e = new Escriptor();
  await e.init();

  e.linia(neteja(d.titol), { font: e.negreta, mida: 22, despres: 6 });
  const meta = [
    etiquetaTipus(r) + (d.tipus === 'participada' && d.origen ? `: ${neteja(d.origen)}` : ''),
    dataLlarga(d.data),
    `Per a ${d.racions} racions (recepta original)`,
    d.categoria,
  ].join(' · ');
  e.linia(meta, { mida: 9, color: GRIS, despres: 14 });

  let dinsGaleria = false;
  for (const liniaRaw of (r.body ?? '').split('\n')) {
    const linia = liniaRaw.trimEnd();
    const t = linia.trim();
    if (!t) continue;
    if (/^#{1,3} /.test(t)) dinsGaleria = /^## Galeria/.test(t);
    if (dinsGaleria) continue; // la galeria només té fotos: al PDF no hi surt
    if (t.startsWith('![')) continue; // fora imatges
    if (t.startsWith('### ')) {
      e.linia(mdPla(t.slice(4)), { font: e.negreta, mida: 12, abans: 10, despres: 2 });
    } else if (t.startsWith('## ')) {
      e.linia(mdPla(t.slice(3)), { font: e.negreta, mida: 15, abans: 14, despres: 4 });
    } else if (t.startsWith('# ')) {
      continue; // el títol ja hi és
    } else if (/^[-*] /.test(t)) {
      e.linia(`• ${mdPla(t.slice(2))}`, { indent: 10, penjant: 10 });
    } else if (/^\d+\. /.test(t)) {
      e.linia(mdPla(t), { indent: 10, penjant: 14 });
    } else {
      e.linia(mdPla(t), { despres: 4 });
    }
  }

  // Peu de pàgina: nom del lloc i número de pàgina.
  const pags = e.doc.getPages();
  pags.forEach((p, i) => {
    const peu = 'Cuina amb mi · Nil Munté Guerrero';
    const num = `${i + 1} / ${pags.length}`;
    p.drawText(peu, { x: MARGE, y: 30, size: 8, font: e.regular, color: GRIS });
    p.drawText(num, { x: AMPLE - MARGE - e.regular.widthOfTextAtSize(num, 8), y: 30, size: 8, font: e.regular, color: GRIS });
  });

  const bytes = await e.doc.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${r.id}.pdf"`,
    },
  });
};
