import { defineType, defineField } from 'sanity';
import { STUDIO_LANGUAGES } from '../config/languages';

/**
 * Privacy Policy and Terms of Service, one document per docType per language.
 *
 * The cookie consent banner links here before asking anyone to accept anything,
 * so an unpublished privacy document means visitors are consenting to a policy
 * they cannot read. `lastUpdated` is required for the same reason: a legal page
 * without a date is not much use to a reader deciding whether to trust it.
 */
export const legalPageSchema = defineType({
  name: 'legalPage',
  title: 'Legal Page',
  type: 'document',

  fields: [
    // ── Identity ──────────────────────────────────────────
    defineField({
      name: 'docType',
      title: 'Document',
      type: 'string',
      description: 'privacy → /{lang}/privacy/ · terms → /{lang}/terms/',
      options: {
        list: [
          { title: 'Privacy Policy (privacy)', value: 'privacy' },
          { title: 'Terms of Service (terms)', value: 'terms' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: { list: [...STUDIO_LANGUAGES], layout: 'radio' },
      validation: Rule => Rule.required(),
    }),

    // ── Content ───────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'Shown as the page heading, e.g. "Privacy Policy".',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'date',
      description: 'Rendered near the top of the page. Move it whenever the text changes.',
      options: { dateFormat: 'YYYY-MM-DD' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The policy itself. Headings become the page structure.',
    }),

    // ── SEO ───────────────────────────────────────────────
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string', description: 'Overrides the page title. Max 60 chars.', validation: (Rule: any) => Rule.max(60).warning('Over 60 chars — search engines may truncate the title') }),
        defineField({ name: 'seoDescription', title: 'Meta Description', type: 'text', rows: 2, description: 'Max 160 chars.', validation: (Rule: any) => Rule.max(160).warning('Over 160 chars — search engines may truncate the description') }),
        defineField({ name: 'ogImage', title: 'Open Graph Image', type: 'image', description: '1200×630px recommended.' }),
        defineField({ name: 'noindex', title: 'Hide from search engines', type: 'boolean', initialValue: false }),
      ],
    }),
  ],

  preview: {
    select: { docType: 'docType', lang: 'language', title: 'title', lastUpdated: 'lastUpdated' },
    prepare: ({ docType, lang, title, lastUpdated }: { docType: string; lang: string; title: string; lastUpdated: string }) => ({
      title: title ?? `${docType} page`,
      subtitle: `${docType?.toUpperCase()} · ${lang?.toUpperCase()}${lastUpdated ? ` · updated ${lastUpdated}` : ''}`,
    }),
  },
});
