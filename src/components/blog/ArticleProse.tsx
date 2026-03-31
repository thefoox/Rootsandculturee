import { sanitizeHtml } from '@/lib/sanitize'

interface ArticleProseProps {
  html: string
}

export function ArticleProse({ html }: ArticleProseProps) {
  return (
    <div
      className="article-prose"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  )
}
