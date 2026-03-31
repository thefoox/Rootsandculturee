'use client'

import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
  heading?: string
}

export function FAQAccordion({ items, heading }: FAQAccordionProps) {
  return (
    <div>
      {heading && (
        <h2 className="mb-6 font-heading text-h2 font-bold text-forest">
          {heading}
        </h2>
      )}
      <div>
        {items.map((item, index) => (
          <details
            key={index}
            className="group border-b border-forest/10"
          >
            <summary className="flex cursor-pointer items-center justify-between py-4 font-heading text-lg font-bold text-forest [&::-webkit-details-marker]:hidden [&::marker]:hidden list-none">
              <span>{item.question}</span>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-forest/60 motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="grid grid-rows-[0fr] motion-safe:transition-[grid-template-rows] motion-safe:duration-200 group-open:grid-rows-[1fr]">
              <div className="overflow-hidden">
                <p className="pb-2 pt-2 text-body leading-relaxed text-body">
                  {item.answer}
                </p>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
