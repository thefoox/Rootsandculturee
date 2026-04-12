import type { PageSection } from '@/types'
import { HeroSection } from './HeroSection'
import { TextSection } from './TextSection'
import { TextImageSection } from './TextImageSection'
import { CtaSection } from './CtaSection'
import { FaqSection } from './FaqSection'
import { ValuesSection } from './ValuesSection'
import { TeamSection } from './TeamSection'
import { GallerySection } from './GallerySection'
import { ContactInfoSection } from './ContactInfoSection'
import { ExperiencesGridSection } from './ExperiencesGridSection'
import { ArticlesGridSection } from './ArticlesGridSection'
import { ProductsGridSection } from './ProductsGridSection'
import { TrustBarSection } from './TrustBarSection'
import { LocationSection } from './LocationSection'
import { TestimonialsSection } from './TestimonialsSection'
import { NewsletterSection } from './NewsletterSection'
import { CategoriesSection } from './CategoriesSection'
import { VideoSection } from './VideoSection'
import { StatsSection } from './StatsSection'
import { LogoBarSection } from './LogoBarSection'

export function SectionRenderer({ section }: { section: PageSection }) {
  switch (section.type) {
    case 'hero':
      return <HeroSection section={section} />
    case 'text':
      return <TextSection section={section} />
    case 'text-image':
      return <TextImageSection section={section} />
    case 'cta':
      return <CtaSection section={section} />
    case 'faq':
      return <FaqSection section={section} />
    case 'values':
      return <ValuesSection section={section} />
    case 'team':
      return <TeamSection section={section} />
    case 'gallery':
      return <GallerySection section={section} />
    case 'contact-info':
      return <ContactInfoSection section={section} />
    case 'experiences-grid':
      return <ExperiencesGridSection section={section} />
    case 'articles-grid':
      return <ArticlesGridSection section={section} />
    case 'products-grid':
      return <ProductsGridSection section={section} />
    case 'trust-bar':
      return <TrustBarSection section={section} />
    case 'location':
      return <LocationSection section={section} />
    case 'testimonials':
      return <TestimonialsSection section={section} />
    case 'newsletter':
      return <NewsletterSection section={section} />
    case 'categories':
      return <CategoriesSection section={section} />
    case 'video':
      return <VideoSection section={section} />
    case 'stats':
      return <StatsSection section={section} />
    case 'logo-bar':
      return <LogoBarSection section={section} />
    default:
      return null
  }
}
