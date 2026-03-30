import type { Article } from '@/types'
import { BlogCard } from './BlogCard'

interface BlogGridProps {
  articles: Article[]
}

export function BlogGrid({ articles }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <BlogCard key={article.id} article={article} />
      ))}
    </div>
  )
}
