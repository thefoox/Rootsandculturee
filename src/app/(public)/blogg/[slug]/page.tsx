import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getArticles } from '@/lib/data/articles'
import { HeroImage } from '@/components/shared/HeroImage'
import { ArticleProse } from '@/components/blog/ArticleProse'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { formatDate } from '@/lib/format'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return { title: 'Artikkel ikke funnet — Roots & Culture' }
  }

  return {
    title: `${article.metaTitle} — Roots & Culture`,
    description: article.metaDescription,
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      images: article.coverImage?.url ? [{ url: article.coverImage.url }] : undefined,
    },
  }
}

export async function generateStaticParams() {
  const articles = await getArticles()
  return articles.map((a) => ({ slug: a.slug }))
}

export default async function ArtikkelDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  return (
    <>
      {article.coverImage?.url && (
        <HeroImage
          src={article.coverImage.url}
          alt={article.coverImage.alt}
          heightClass="h-[250px] md:h-[450px]"
        />
      )}
      <article className="mx-auto max-w-[720px] px-4 pb-16 pt-12 md:px-8">
        <Breadcrumbs items={[{ label: 'Blogg', href: '/blogg' }, { label: article.title }]} />
        <h1 className="mt-4 pb-4 font-heading text-[28px] font-bold text-forest">
          {article.title}
        </h1>
        {article.publishedAt && (
          <p className="pb-8 font-body text-[13px] text-body">
            Publisert {formatDate(article.publishedAt)}
          </p>
        )}
        <ArticleProse html={article.body} />
      </article>
    </>
  )
}
