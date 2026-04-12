import type { PageSection } from '@/types'

function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | null; id: string } {
  // YouTube: various URL formats
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return { type: 'youtube', id: ytMatch[1] }

  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/)
  if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] }

  return { type: null, id: '' }
}

export function VideoSection({ section }: { section: PageSection }) {
  const videoUrl = section.body?.trim() || ''
  const { type, id } = parseVideoUrl(videoUrl)

  const embedSrc = type === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${id}`
    : type === 'vimeo'
      ? `https://player.vimeo.com/video/${id}`
      : null

  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-[960px] px-6 md:px-8">
        {section.heading && (
          <div className="mb-10 text-center">
            <h2 className="font-heading text-h2 font-bold tracking-tight text-forest">
              {section.heading}
            </h2>
            {section.subheading && (
              <p className="mt-3 text-body leading-relaxed text-body/70">
                {section.subheading}
              </p>
            )}
          </div>
        )}
        {embedSrc ? (
          <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg">
            <iframe
              src={embedSrc}
              title={section.heading || 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        ) : videoUrl ? (
          <p className="text-center text-body text-body/60">
            Ugyldig video-URL. Stottede formater: YouTube eller Vimeo-lenker.
          </p>
        ) : null}
      </div>
    </section>
  )
}
