import Image from 'next/image'

interface HeroImageProps {
  src: string
  alt: string
  title?: string
  heightClass?: string
}

export function HeroImage({
  src,
  alt,
  title,
  heightClass = 'h-[300px] md:h-[450px] lg:h-[650px]',
}: HeroImageProps) {
  return (
    <div className={`relative w-full ${heightClass}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      {title && (
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="mx-auto max-w-[1200px] px-4 md:px-8">
              <h1 className="font-heading text-[28px] font-bold text-cream">
                {title}
              </h1>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
