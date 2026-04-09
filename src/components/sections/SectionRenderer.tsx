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
    default:
      return null
  }
}
