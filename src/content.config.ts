import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sources = defineCollection({
  loader: glob({ pattern: '*.md', base: './sources' }),
  schema: z.object({
    speaker: z.string(),
    title: z.string(),
    url: z.string().url(),
    date: z.union([z.string(), z.date()]),
    tags: z.array(z.string()).default([]),
  }),
});

const themes = defineCollection({
  loader: glob({ pattern: '*.md', base: './themes' }),
  schema: z.object({
    description: z.string().optional(),
  }),
});

export const collections = { sources, themes };
