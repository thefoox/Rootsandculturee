import Image from 'next/image'
import Link from 'next/link'
import type { Article } from '@/types'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

interface BlogCardProps {
  article: Article
  className?: string
}

export function BlogCard({ article, className }: BlogCardProps) {
  const publishedDate = article.publishedAt
    ? formatDate(article.publishedAt)
    : ''

  return (
    <Link
      href={`/blogg/${article.slug}`}
      aria-label={`${article.title}${publishedDate ? `, publisert ${publishedDate}` : ''}`}
      className={cn(
        'group block overflow-hidden rounded-xl border border-forest/8 bg-card shadow-sm motion-safe:transition-all motion-safe:duration-150 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
        {article.coverImage?.url ? (
          <Image
            src={article.coverImage.url}
            alt={article.coverImage.alt}
            width={600}
            height={338}
            className="h-full w-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-card text-body">
            Ingen bilde
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-heading text-h4 font-bold leading-[1.25] text-forest">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 font-body text-body">
          {article.excerpt}
        </p>
        {publishedDate && (
          <p className="mt-2 font-body text-label text-body">
            {publishedDate}
          </p>
        )}
      </div>
    </Link>
  )
}
