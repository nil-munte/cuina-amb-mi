import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Cada recepta és una carpeta receptes/AAAA-MM-DD-nom/ amb un README.md i una subcarpeta fotos/.
// L'identificador de la recepta (i la seva URL) és el nom de la carpeta.
const receptes = defineCollection({
  loader: glob({
    pattern: '*/README.md',
    base: './receptes',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z
    .object({
      titol: z.string(),
      data: z.coerce.date(),
      tipus: z.enum(['feta', 'participada']),
      origen: z.string().nullish(),
      racions: z.number().int().positive(),
      categoria: z.enum(['Entrants', 'Plats principals', 'Acompanyaments', 'Postres']),
      video: z.string().url().nullish(),
    })
    .refine((d) => d.tipus !== 'participada' || !!d.origen, {
      message: "Les receptes 'participada' han d'indicar l'origen (on o amb qui)",
      path: ['origen'],
    }),
});

export const collections = { receptes };
