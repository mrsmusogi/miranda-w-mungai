import { defineCollection} from "astro:content";
import { z } from 'astro/zod'

const sharedSchema = z.object({
  title: z.string().optional(),
  draft: z.boolean().optional().default(false),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  pubDate: z.date().optional(),
});

export const collections = {
  comics:                   defineCollection({ schema: sharedSchema }),
  experiments:              defineCollection({ schema: sharedSchema }),
  'film-work':              defineCollection({ schema: sharedSchema }),
  logs:                     defineCollection({ schema: sharedSchema }),
  'screenings-discussions': defineCollection({ schema: sharedSchema }),
};
