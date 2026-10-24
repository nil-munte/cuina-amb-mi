import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';

export type Recepta = CollectionEntry<'receptes'>;

export const CATEGORIES = ['Entrants', 'Plats principals', 'Postres'] as const;

const MESOS = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'];

export function dataLlarga(d: Date): string {
  const mes = MESOS[d.getUTCMonth()];
  return `${d.getUTCDate()} ${/^[aeiou]/.test(mes) ? "d'" : 'de '}${mes} de ${d.getUTCFullYear()}`;
}

export const etiquetaTipus = (r: Recepta) => (r.data.tipus === 'feta' ? 'Feta per mi' : 'Hi he participat');

// La portada és la foto fotos/portada.* de la carpeta de cada recepta.
const portades = import.meta.glob<{ default: ImageMetadata }>('/receptes/*/fotos/portada.{webp,jpg,jpeg,png}', { eager: true });

export function portada(id: string): ImageMetadata | undefined {
  const clau = Object.keys(portades).find((k) => k.split('/')[2] === id);
  return clau ? portades[clau].default : undefined;
}

// Text dels ingredients, per poder cercar «què faig amb carbassa?».
export function textIngredients(body: string = ''): string {
  const m = body.match(/(?:^|\n)## Ingredients[^\n]*\n([\s\S]*?)(?=\n## |$)/);
  return m ? m[1].replace(/^[#\-*\s]+/gm, ' ').replace(/\s+/g, ' ').trim() : '';
}

export const perData = (a: Recepta, b: Recepta) => b.data.data.getTime() - a.data.data.getTime();

export const url = (camí = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${camí}`;
