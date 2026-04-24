import { visit } from "unist-util-visit";
import path from "node:path";

import path from "node:path";
import { visit } from "unist-util-visit";

export default function remarkEmbed() {
  return (tree, file) => {
    const notePath = file?.history?.[0];
    const assetDir = notePath
      ? `${path.basename(notePath, ".md")}-assets`
      : null;

    const rewriteUrl = (url) => {
      if (
        !assetDir ||
        !url ||
        url.startsWith("http") ||
        url.startsWith("/") ||
        url.includes("/")
      )
        return url;
      return `./${assetDir}/${url}`;
    };

    // --- Pass 1: rewrite bare image links throughout the document ---
    visit(tree, "image", (node) => {
      node.url = rewriteUrl(node.url);
    });

    // --- Pass 2: handle ```embed``` blocks ---
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "embed" || !parent) return;

      const fields = {};
      for (const line of node.value.split("\n")) {
        const match = line.match(/^(\w+):\s*"([^"]*)"/);
        if (match) fields[match[1]] = match[2];
      }

      const url = fields.url || "";

      const isPdf = url.toLowerCase().endsWith(".pdf");
      const title = fields.title || "";
      // Rewrite the embed's image field too, in case it's a local asset
      const image = rewriteUrl(fields.image || "");
      const aspectRatio = fields.aspectRatio || "56.25";

      const ytMatch = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/,
      );

      let html;
      if (isPdf) {
        html = `<div class="pdf-container" style="width:100%;height:600px;">
  <iframe src="${url}" style="width:100%;height:100%;border:none;" loading="lazy"></iframe>
</div>`;
      }
      if (ytMatch) {
        const videoId = ytMatch[1];
        html = `<div class="embed-container" style="position:relative;padding-bottom:${aspectRatio}%;height:0;overflow:hidden;max-width:100%;">
  <iframe src="https://www.youtube.com/embed/${videoId}" title="${title}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe>
</div>`;
      } else {
        html = `<a class="embed-card" href="${url}" target="_blank" rel="noopener noreferrer">
  ${image ? `<img src="${image}" alt="${title}" loading="lazy" />` : ""}
  <span>${title}</span>
</a>`;
      }

      parent.children[index] = { type: "html", value: html };
    });
  };
}
// export default function remarkEmbed() {
//   return (tree) => {
//     visit(tree, "code", (node, index, parent) => {
//       if (node.lang !== "embed" || !parent) return;

//       // Parse the YAML-like key: "value" pairs
//       const fields = {};
//       for (const line of node.value.split("\n")) {
//         const match = line.match(/^(\w+):\s*"([^"]*)"/);
//         if (match) fields[match[1]] = match[2];
//       }

//       const url = fields.url || "";
//       const title = fields.title || "";
//       const image = fields.image || "";
//       const aspectRatio = fields.aspectRatio || "56.25";

//       // Check for YouTube
//       const ytMatch = url.match(
//         /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
//       );

//       let html;
//       if (ytMatch) {
//         const videoId = ytMatch[1];
//         html = `<div class="embed-container" style="position:relative;padding-bottom:${aspectRatio}%;height:0;overflow:hidden;max-width:100%;">
//   <iframe src="https://www.youtube.com/embed/${videoId}" title="${title}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe>
// </div>`;
//       } else {
//         // Generic link card for non-YouTube embeds
//         html = `<a class="embed-card" href="${url}" target="_blank" rel="noopener noreferrer">
//   ${image ? `<img src="${image}" alt="${title}" loading="lazy" />` : ""}
//   <span>${title}</span>
// </a>`;
//       }

//       parent.children[index] = { type: "html", value: html };
//     });
//   };
// }
