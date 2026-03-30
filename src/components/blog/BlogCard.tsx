import Image from 'next/image'
import Link from 'next/link'
import type { Article } from '@/types'
import { formatDate } from '@/lib/format'

interface BlogCardProps {
  article: Article
}

export function BlogCard({ article }: BlogCardProps) {
  const publishedDate = article.publishedAt
    ? formatDate(article.publishedAt)
    : ''

  return (
    <Link
      href={`/blogg/${article.slug}`}
      aria-label={`${article.title}${publishedDate ? `, publisert ${publishedDate}` : ''}`}
      className="group block overflow-hidden rounded-lg bg-card shadow-sm motion-safe:transition-all motion-safe:duration-100 motion-safe:hover:shadow-md"
    >
      <div className="relative aspect-video w-full overflow-hidden">
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
          <div className="flex h-full w-full items-center justify-center bg-card text-bark">
            Ingen bilde
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-heading text-[20px] font-bold leading-[1.25] text-forest">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 font-body text-[15px] text-bark">
          {article.excerpt}
        </p>
        {publishedDate && (
          <p className="mt-2 font-body text-[13px] text-bark">
            {publishedDate}
          </p>
        )}
      </div>
    </Link>
  )
}
