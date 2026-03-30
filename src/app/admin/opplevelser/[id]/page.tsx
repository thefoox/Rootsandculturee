'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { PublishBar } from '@/components/admin/PublishBar'
import { DateSlotsEditor } from '@/components/admin/DateSlotsEditor'
import { Input } from '@/components/ui/Input'
import { FormError } from '@/components/ui/FormError'
import { generateSlug } from '@/lib/validations'
import {
  getExperienceById,
  getExperienceDatesAdmin,
  updateExperience,
} from '@/actions/experiences'
import { toast } from 'sonner'
import type { ProductImage, ExperienceCategory, Difficulty } from '@/types'

const categoryOptions: { value: ExperienceCategory; label: string }[] = [
  { value: 'retreat', label: 'Retreat' },
  { value: 'kurs', label: 'Kurs' },
  { value: 'matopplevelse', label: 'Matopplevelse' },
]

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: 'lett', label: 'Lett' },
  { value: 'moderat', label: 'Moderat' },
  { value: 'krevende', label: 'Krevende' },
]

export default function EditExperiencePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ExperienceCategory>('retreat')
  const [difficulty, setDifficulty] = useState<Difficulty>('lett')
  const [location, setLocation] = useState('')
  const [durationText, setDurationText] = useState('')
  const [images, setImages] = useState<ProductImage[]>([])
  const [dates, setDates] = useState<{ date: string; maxSeats: number }[]>([])
  const [basePrice, setBasePrice] = useState('')
  const [whatIsIncluded, setWhatIsIncluded] = useState('')
  const [cancellationPolicy, setCancellationPolicy] = useState('')
  const [whatToBring, setWhatToBring] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getExperienceById(id), getExperienceDatesAdmin(id)]).then(
      ([experience, existingDates]) => {
        if (!experience) {
          router.push('/admin/opplevelser')
          return
        }
        setName(experience.name)
        setSlug(experience.slug)
        setDescription(experience.description)
        setCategory(experience.category)
        setDifficulty(experience.difficulty)
        setLocation(experience.location)
        setDurationText(experience.durationText)
        setImages(experience.images)
        setBasePrice(String(experience.basePrice / 100))
        setWhatIsIncluded(experience.whatIsIncluded.join('\n'))
        setCancellationPolicy(experience.cancellationPolicy)
        setWhatToBring(experience.whatToBring)
        setIsPublished(experience.publishedAt !== null)
        setDates(
          existingDates.map((d) => ({
            date: d.date.toISOString().split('T')[0],
            maxSeats: d.maxSeats,
          }))
        )
        setLoading(false)
      }
    )
  }, [id, router])

  const submitForm = async (publish: boolean) => {
    const setLoadingState = publish ? setIsPublishing : setIsSaving
    setLoadingState(true)
    setErrors({})

    const formData = new FormData()
    formData.set('name', name)
    formData.set('slug', slug)
    formData.set('description', description)
    formData.set('category', category)
    formData.set('difficulty', difficulty)
    formData.set('location', location)
    formData.set('durationText', durationText)
    formData.set('images', JSON.stringify(images))
    formData.set('dates', JSON.stringify(dates))
    formData.set('basePrice', basePrice)
    formData.set('whatIsIncluded', whatIsIncluded)
    formData.set('cancellationPolicy', cancellationPolicy)
    formData.set('whatToBring', whatToBring)
    formData.set('publish', String(publish))

    const result = await updateExperience(id, formData)
    setLoadingState(false)

    if (result.success) {
      toast.success('Opplevelse oppdatert.')
      router.push('/admin/opplevelser')
    } else if (result.errors) {
      setErrors(result.errors)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-bark">
        Laster...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <AdminBreadcrumb
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Opplevelser', href: '/admin/opplevelser' },
          { label: `Rediger: ${name}` },
        ]}
      />
      <h1 className="mb-8 font-heading text-[28px] font-bold text-forest">
        Rediger opplevelse
      </h1>

      {errors._form && (
        <FormError id="form-error" message={errors._form} className="mb-4" />
      )}

      <div className="space-y-6">
        <section>
          <h2 className="mb-4 font-heading text-[20px] font-bold text-forest">
            Grunnleggende info
          </h2>
          <div className="space-y-4">
            <Input
              label="Navn"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSlug(generateSlug(e.target.value))
              }}
              error={errors.name}
            />
            <Input
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              error={errors.slug}
            />
            <div className="flex flex-col gap-1">
              <label
                htmlFor="description"
                className="text-[13px] font-normal tracking-wide text-forest"
              >
                Beskrivelse
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="min-h-[44px] rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-[15px] text-forest placeholder:text-bark/60 focus:border-forest"
              />
            </div>
            <fieldset>
              <legend className="mb-2 text-[13px] font-normal tracking-wide text-forest">
                Vanskelighetsgrad
              </legend>
              <div className="flex gap-6">
                {difficultyOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex min-h-[44px] items-center gap-2 text-[15px] text-forest"
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={opt.value}
                      checked={difficulty === opt.value}
                      onChange={() => setDifficulty(opt.value)}
                      className="h-4 w-4 accent-ember"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <Input
              label="Sted"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              error={errors.location}
            />
            <Input
              label="Varighet"
              value={durationText}
              onChange={(e) => setDurationText(e.target.value)}
              error={errors.durationText}
              placeholder="f.eks. 3 timer, 2 dager"
            />
            <fieldset>
              <legend className="mb-2 text-[13px] font-normal tracking-wide text-forest">
                Kategori
              </legend>
              <div className="flex gap-6">
                {categoryOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex min-h-[44px] items-center gap-2 text-[15px] text-forest"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={opt.value}
                      checked={category === opt.value}
                      onChange={() => setCategory(opt.value)}
                      className="h-4 w-4 accent-ember"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <hr className="border-forest/12" />

        <section>
          <h2 className="mb-4 font-heading text-[20px] font-bold text-forest">
            Bilder
          </h2>
          <ImageUpload images={images} onChange={setImages} />
        </section>

        <hr className="border-forest/12" />

        <section>
          <h2 className="mb-4 font-heading text-[20px] font-bold text-forest">
            Datoer og plasser
          </h2>
          <DateSlotsEditor dates={dates} onChange={setDates} />
        </section>

        <hr className="border-forest/12" />

        <section>
          <h2 className="mb-4 font-heading text-[20px] font-bold text-forest">
            Innhold
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="whatIsIncluded"
                className="text-[13px] font-normal tracking-wide text-forest"
              >
                Hva er inkludert (en per linje)
              </label>
              <textarea
                id="whatIsIncluded"
                value={whatIsIncluded}
                onChange={(e) => setWhatIsIncluded(e.target.value)}
                rows={4}
                className="min-h-[44px] rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-[15px] text-forest placeholder:text-bark/60 focus:border-forest"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="cancellationPolicy"
                className="text-[13px] font-normal tracking-wide text-forest"
              >
                Kanselleringsvilkar
              </label>
              <textarea
                id="cancellationPolicy"
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                rows={3}
                className="min-h-[44px] rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-[15px] text-forest placeholder:text-bark/60 focus:border-forest"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="whatToBring"
                className="text-[13px] font-normal tracking-wide text-forest"
              >
                Hva du ma ta med
              </label>
              <textarea
                id="whatToBring"
                value={whatToBring}
                onChange={(e) => setWhatToBring(e.target.value)}
                rows={3}
                className="min-h-[44px] rounded-md border border-forest/20 bg-card px-3 py-2 font-body text-[15px] text-forest placeholder:text-bark/60 focus:border-forest"
              />
            </div>
          </div>
        </section>

        <hr className="border-forest/12" />

        <section>
          <h2 className="mb-4 font-heading text-[20px] font-bold text-forest">
            Pris
          </h2>
          <Input
            label="Pris (NOK)"
            type="number"
            min={0}
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            error={errors.basePrice}
          />
        </section>
      </div>

      <PublishBar
        onSaveDraft={() => submitForm(false)}
        onPublish={() => submitForm(true)}
        isPublished={isPublished}
        isSaving={isSaving}
        isPublishing={isPublishing}
        contentType="experience"
      />
    </div>
  )
}
