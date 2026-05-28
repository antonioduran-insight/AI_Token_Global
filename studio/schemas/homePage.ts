import { defineType, defineField } from 'sanity';
import { STUDIO_LANGUAGES } from '../config/languages';

export const homePageSchema = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',

  fields: [
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: { list: [...STUDIO_LANGUAGES], layout: 'radio' },
      validation: Rule => Rule.required(),
    }),

    // ── Hero ─────────────────────────────────────────────
    defineField({ name: 'heroLabel',      title: 'Hero Label (pill)',               type: 'string', initialValue: 'Your AI Knowledge Hub' }),
    defineField({ name: 'heroHeadline',   title: 'Hero Headline (line 1)',          type: 'string', initialValue: 'Master AI Tokens,' }),
    defineField({ name: 'heroAccentText', title: 'Hero Accent Text (colored line)', type: 'string', initialValue: 'Models & APIs' }),
    defineField({ name: 'heroSubtitle',   title: 'Hero Subtitle Paragraph',        type: 'text', rows: 3 }),

    defineField({
      name: 'heroStats',
      title: 'Hero Stats (3 items)',
      type: 'array',
      of: [{
        type: 'object',
        name: 'heroStat',
        fields: [
          defineField({ name: 'statNumber', title: 'Number (e.g. "60+")', type: 'string', validation: (Rule: any) => Rule.required() }),
          defineField({ name: 'statLabel',  title: 'Label (e.g. "AI Models Covered")', type: 'string', validation: (Rule: any) => Rule.required() }),
        ],
        preview: { select: { title: 'statNumber', subtitle: 'statLabel' } },
      }],
    }),

    // ── Token explainer ──────────────────────────────────
    defineField({
      name: 'tokenBody2',
      title: 'Token Explainer — Second Paragraph',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Second paragraph in the "What is a Token?" section. Supports bold/italic.',
    }),

    defineField({
      name: 'tokenBreakdown',
      title: 'Token Breakdown Example',
      type: 'object',
      description: 'Visual demo of how a sentence is split into tokens. Edit per language.',
      fields: [
        defineField({
          name: 'tokens',
          title: 'Token chunks',
          description: 'Each chunk renders as a colored chip (alternating purple / blue) in order. Use one chunk per token — including punctuation as its own chunk if it would tokenize separately.',
          type: 'array',
          of: [{ type: 'string' }],
          initialValue: ['Hello', ',', 'how', 'are', 'you', '?', 'I', "'m", 'learning', 'about', 'AI', 'tokens'],
        }),
        defineField({
          name: 'tokenCount',
          title: 'Displayed token count (optional)',
          description: 'Defaults to the number of chunks above. Override only if you want a different number shown (e.g. "60+").',
          type: 'string',
        }),
        defineField({
          name: 'charCount',
          title: 'Displayed character count',
          description: 'E.g. "~48". Supports a leading "~" for an approximation.',
          type: 'string',
          initialValue: '~48',
        }),
      ],
    }),

    // ── FAQ ─────────────────────────────────────────────
    defineField({ name: 'faqTitle',    title: 'FAQ Section Title',    type: 'string', initialValue: 'Frequently Asked Questions' }),
    defineField({ name: 'faqSubtitle', title: 'FAQ Section Subtitle', type: 'string', initialValue: "Everything you've been wondering about AI tokens, APIs, and costs — answered." }),
    defineField({
      name: 'faq',
      title: 'FAQ Items',
      type: 'array',
      of: [{ type: 'faqItem' }],
    }),

    // ── SEO ─────────────────────────────────────────────
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({ name: 'seoTitle',       title: 'SEO Title',       type: 'string' }),
        defineField({ name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 2 }),
        defineField({ name: 'ogImage',        title: 'OG Image',        type: 'image' }),
        defineField({ name: 'noindex',        title: 'No Index',        type: 'boolean' }),
      ],
    }),
  ],
});
