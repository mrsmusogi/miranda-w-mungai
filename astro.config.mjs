import { defineConfig } from "astro/config";
import remarkEmbed from "./src/utilities/remark-embed.js";

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkEmbed],
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
    domains: [],
  },
  vite: {
    assetsInclude: ["**/*.base", "**/.obsidian/**", "**/_bases/**"],
    server: {
      watch: {
        ignored: [
          "**/.obsidian/**",
          "**/_bases/**",
          "**/bases/**",
          "**/_home/**",
          "**/home/**",
          "**/_base/**",
          "**/base/**",
        ],
      },
    },
  },

  devToolbar: {
    enabled: false,
  },
});
