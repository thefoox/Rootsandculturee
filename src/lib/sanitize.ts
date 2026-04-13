// Server-safe HTML sanitization — no jsdom dependency.
// Content comes from our admin CMS (Tiptap editor), so we use a simple
// allowlist-based approach instead of a full DOM parser like DOMPurify.

const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
  'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i', 'u',
  'blockquote', 'code', 'pre', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span', 'section', 'article',
])

const ALLOWED_ATTRS = new Set([
  'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel', 'width', 'height',
])

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ''

  // Strip tags not in allowlist, keep their inner content
  return dirty
    // Remove script/style tags and their content entirely
    .replace(/<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Remove on* event handlers from all tags
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // Remove javascript: URLs
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
    // Strip disallowed tags but keep content
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g, (match, tag) => {
      const lower = tag.toLowerCase()
      if (!ALLOWED_TAGS.has(lower)) return ''
      // For allowed tags, strip disallowed attributes
      return match.replace(/\s+([a-zA-Z-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/g, (attrMatch, attrName) => {
        return ALLOWED_ATTRS.has(attrName.toLowerCase()) ? attrMatch : ''
      })
    })
}
