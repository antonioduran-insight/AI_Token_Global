import { defineType, defineField } from 'sanity';
import { STUDIO_LANGUAGES } from '../config/languages';

const ACCENT_COLORS = [
  { title: 'Purple',  value: '#6155F1' },
  { title: 'Blue',    value: '#3E81E5' },
  { title: 'Teal',    value: '#0ABFBC' },
  { title: 'Amber',   value: '#F59E0B' },
  { title: 'Rose',    value: '#F43F5E' },
];

const portableText = { type: 'array', of: [{ type: 'block' }] } as const;

export const aiTrendsPageSchema = defineType({
  name: 'aiTrendsPage',
  title: 'AI Trends Page',
  type: 'document',
  fields: [
    // ── Identity ──────────────────────────────────────
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: { list: [...STUDIO_LANGUAGES], layout: 'radio' },
      validation: Rule => Rule.required(),
    }),

    // ── Hero ──────────────────────────────────────────
    defineField({ name: 'heroHeadline',  title: 'Hero Headline',          type: 'string',                validation: Rule => Rule.required() }),
    defineField({ name: 'heroSubtitle',  title: 'Hero Subtitle (line 1)', type: 'text', rows: 2 }),
    defineField({ name: 'heroSubtitle2', title: 'Hero Subtitle (line 2)', ...portableText }),

    // ── Intro section ─────────────────────────────────
    defineField({ name: 'introTitle',      title: 'Intro Section Title',     type: 'string' }),
    defineField({ name: 'introParagraphs', title: 'Intro Paragraphs',        ...portableText }),
    defineField({ name: 'summaryTitle',    title: 'Summary Card Title',      type: 'string' }),
    defineField({
      name: 'summaryPoints',
      title: 'Summary Bullet Points',
      type: 'array',
      of: [{ type: 'string' }],
    }),

    // ── Trend cards section ───────────────────────────
    defineField({ name: 'trendsSectionLabel', title: 'Trends Section Pill Label', type: 'string' }),
    defineField({ name: 'trendsSectionTitle', title: 'Trends Section Heading',    type: 'string' }),
    defineField({
      name: 'trendCards',
      title: 'Trend Cards',
      type: 'array',
      validation: Rule => Rule.max(5),
      of: [{
        type: 'object',
        fields: [
          { name: 'tag',        title: 'Tag Label',    type: 'string' },
          { name: 'title',      title: 'Card Title',   type: 'string', validation: (Rule: any) => Rule.required() },
          { name: 'body',       title: 'Card Body',    ...portableText },
          { name: 'pullQuote',  title: 'Pull Quote',   type: 'string', description: 'Optional highlighted quote at card bottom' },
          {
            name: 'accentColor',
            title: 'Accent Color',
            type: 'string',
            options: { list: ACCENT_COLORS, layout: 'radio' },
            validation: (Rule: any) => Rule.required(),
          },
        ],
        preview: {
          select: { title: 'title', subtitle: 'accentColor' },
          prepare: ({ title, subtitle }: { title: string; subtitle: string }) => ({
            title,
            subtitle: ACCENT_COLORS.find(c => c.value === subtitle)?.title ?? subtitle,
          }),
        },
      }],
    }),

    // ── Audience section ──────────────────────────────
    defineField({ name: 'audienceSectionTitle', title: 'Audience Section Title', type: 'string' }),
    defineField({ name: 'audienceIntro',         title: 'Audience Intro',         ...portableText }),
    defineField({
      name: 'audienceCards',
      title: 'Audience Cards',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'audience', title: 'Audience Label', type: 'string', validation: (Rule: any) => Rule.required() },
          { name: 'body',     title: 'Body',           ...portableText },
        ],
        preview: { select: { title: 'audience' } },
      }],
    }),

    // ── Sources section ───────────────────────────────
    defineField({ name: 'sourcesTitle', title: 'Sources Section Title', type: 'string' }),
    defineField({ name: 'sourcesNote',  title: 'Sources Note',          type: 'text', rows: 4 }),

    // ── FAQ (pattern ready for other pages) ───────────
    defineField({
      name: 'faq',
      title: 'FAQ Items',
      type: 'array',
      of: [{ type: 'faqItem' }],
    }),

    // ── SEO ───────────────────────────────────────────
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string', description: 'Overrides hero headline. Max 60 chars.', validation: (Rule: any) => Rule.max(60) }),
        defineField({ name: 'seoDescription', title: 'Meta Description', type: 'text', rows: 2, description: 'Max 160 chars.', validation: (Rule: any) => Rule.max(160) }),
        defineField({ name: 'ogImage', title: 'Open Graph Image', type: 'image', description: '1200×630px recommended.' }),
        defineField({ name: 'noindex', title: 'Hide from search engines', type: 'boolean', initialValue: false }),
      ],
    }),
  ],

  preview: {
    select: { title: 'heroHeadline', subtitle: 'language' },
    prepare: ({ title, subtitle }: { title: string; subtitle: string }) => ({
      title: title ?? 'AI Trends Page',
      subtitle: subtitle?.toUpperCase(),
    }),
  },
});
