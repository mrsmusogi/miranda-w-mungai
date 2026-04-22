import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
const posts = defineCollection({
  loader: glob({
    pattern: ["**/*.md", "!_*/**"],
    base: "./src/content/posts/",
  }),
  schema: ({ image }) =>
    z.object({
      category: z.string(),
      tags: z.array(z.string()).nullish().transform((v) => v ?? []),
      title: z.string(),
      date: z.coerce.date(),
      published: z.boolean().default(false),
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});
export const collections = { posts };
