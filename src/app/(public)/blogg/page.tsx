import type { Metadata } from 'next'
import { BookOpen } from 'lucide-react'
import { getArticles } from '@/lib/data/articles'
import { BlogGrid } from '@/components/blog/BlogGrid'
import { EmptyState } from '@/components/shared/EmptyState'

export const metadata: Metadata = {
  title: 'Blogg — Roots & Culture',
  description:
    'Les artikler om norsk natur, kultur og tradisjoner. Inspirasjon fra fjell, fjord og skog.',
  openGraph: {
    title: 'Blogg',
    description:
      'Les artikler om norsk natur, kultur og tradisjoner. Inspirasjon fra fjell, fjord og skog.',
  },
}

export const revalidate = 3600

export default async function BloggPage() {
  const articles = await getArticles()

  return (
    <div className="mx-auto max-w-[1200px] px-4 md:px-8">
      <h1 className="pb-8 pt-12 font-heading text-[28px] font-bold text-forest">
        Blogg
      </h1>
      {articles.length > 0 ? (
        <BlogGrid articles={articles} />
      ) : (
        <EmptyState
          icon={BookOpen}
          heading="Ingen artikler"
          body="Vi har ingen publiserte artikler enna. Kom tilbake snart!"
        />
      )}
    </div>
  )
}
