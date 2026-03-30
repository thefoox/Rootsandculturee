interface ArticleProseProps {
  html: string
}

export function ArticleProse({ html }: ArticleProseProps) {
  return (
    <div
      className="article-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
