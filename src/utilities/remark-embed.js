import { visit } from "unist-util-visit";
import path from "node:path";

export default function remarkEmbed() {
  return (tree, file) => {
    console.log("REMARK PLUGIN LOADED", file?.history?.[0]);
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

    const rewritePdfUrl = (url) => {
      if (!url || url.startsWith("http") || url.startsWith("/")) return url;
      // PDFs go to public/assets for direct access
      return `/assets/${url}`;
    };

    // --- Pass 1: convert PDF images directly to HTML ---
    visit(tree, "image", (node, index, parent) => {
      console.log("IMAGE NODE:", node.url);
      if (node.url && node.url.toLowerCase().endsWith('.pdf')) {
        console.log("PDF FOUND:", node.url);
        // Convert PDF to direct iframe - bypass all Astro processing
        const pdfHtml = `<!-- PDF_CONVERTED --><div class="pdf-container" style="width:100%;height:600px;">
  <iframe src="/assets/${node.url}" style="width:100%;height:100%;border:none;" loading="lazy"></iframe>
</div>`;
        
        if (parent && typeof index === 'number') {
          parent.children[index] = { type: "html", value: pdfHtml };
        }
        return;
      } else {
        // Regular image, just rewrite the URL
        node.url = rewriteUrl(node.url);
      }
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
  <iframe src="${rewriteUrl(url)}" style="width:100%;height:100%;border:none;" loading="lazy"></iframe>
</div>`;
      } else if (ytMatch) {
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
