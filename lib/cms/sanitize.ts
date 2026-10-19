import "server-only";
import sanitizeHtml from "sanitize-html";

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

export function isSafeHref(href: string) {
  return SAFE_HREF.test(href.trim());
}

/** Allows only the formatting the editor can produce: paragraphs, headings, bold/italic, lists and safe links. */
export function sanitizeRichText(html: string): string {
  const clean = sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "h2", "h3", "ul", "ol", "li", "a"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      b: "strong",
      i: "em",
      a: (tagName, attribs) => {
        const href = attribs.href && isSafeHref(attribs.href) ? attribs.href.trim() : "";
        const out: Record<string, string> = {};
        if (href) out.href = href;
        if (/^https?:\/\//i.test(href)) {
          out.target = "_blank";
          out.rel = "noopener noreferrer";
        }
        return { tagName, attribs: out };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "a" && !frame.attribs.href,
  });
  // An editor with only an empty paragraph means "no text".
  return clean.replace(/^(<p>(\s|<br\s*\/?>)*<\/p>)+$/i, "").trim();
}
