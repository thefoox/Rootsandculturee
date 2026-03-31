import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getArticles } from '@/lib/data/articles'
import { BlogCard } from '@/components/blog/BlogCard'
import type { PageSection } from '@/types'

export async function ArticlesGridSection({ section }: { section: PageSection }) {
  const articles = await getArticles()

  return (
    <section className="bg-card py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="flex items-end justify-between">
          <div>
            {section.heading && (
              <h2 className="font-heading text-h1 font-bold text-forest">
                {section.heading}
              </h2>
            )}
            {section.subheading && (
              <p className="mt-2 max-w-md font-body text-body">
                {section.subheading}
              </p>
            )}
          </div>
          <Link
            href="/blogg"
            className="hidden font-body text-body font-medium text-forest hover:underline md:inline-flex md:items-center md:gap-1"
          >
            Les alle <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <BlogCard key={article.id} article={article} className="bg-cream" />
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link
            href="/blogg"
            className="inline-flex items-center gap-1 font-body text-body font-medium text-forest hover:underline"
          >
            Les alle artikler <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
