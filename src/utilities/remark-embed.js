import { visit } from "unist-util-visit";

/**
 * Remark plugin that transforms ```embed code blocks
 * (from the Obsidian Link Embed plugin) into rendered HTML.
 *
 * Supports YouTube URLs — extracts the video ID and renders
 * a responsive iframe. Non-YouTube URLs render as a styled
 * link card with optional thumbnail.
 */
export default function remarkEmbed() {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "embed" || !parent) return;

      // Parse the YAML-like key: "value" pairs
      const fields = {};
      for (const line of node.value.split("\n")) {
        const match = line.match(/^(\w+):\s*"([^"]*)"/);
        if (match) fields[match[1]] = match[2];
      }

      const url = fields.url || "";
      const title = fields.title || "";
      const image = fields.image || "";
      const aspectRatio = fields.aspectRatio || "56.25";

      // Check for YouTube
      const ytMatch = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
      );

      let html;
      if (ytMatch) {
        const videoId = ytMatch[1];
        html = `<div class="embed-container" style="position:relative;padding-bottom:${aspectRatio}%;height:0;overflow:hidden;max-width:100%;">
  <iframe src="https://www.youtube.com/embed/${videoId}" title="${title}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe>
</div>`;
      } else {
        // Generic link card for non-YouTube embeds
        html = `<a class="embed-card" href="${url}" target="_blank" rel="noopener noreferrer">
  ${image ? `<img src="${image}" alt="${title}" loading="lazy" />` : ""}
  <span>${title}</span>
</a>`;
      }

      parent.children[index] = { type: "html", value: html };
    });
  };
}
