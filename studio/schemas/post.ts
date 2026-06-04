import { defineField, defineType } from 'sanity';
import { STUDIO_LANGUAGES } from '../config/languages';

export const postSchema = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content',  title: 'Content',  default: true },
    { name: 'seo',      title: 'SEO'                     },
    { name: 'images',   title: 'Images'                  },
    { name: 'pipeline', title: 'Pipeline'                },
  ],
  fields: [
    // ── Content group ──────────────────────────────────────────────────
    defineField({
      name: 'articleNumber',
      title: 'Article Number',
      type: 'number',
      group: 'content',
      description: 'Unique article number for ordering and lookup (e.g. 1, 2, 3...)',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 200 },
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      group: 'content',
      options: {
        list: [...STUDIO_LANGUAGES],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'translationKey',
      title: 'Translation Key',
      type: 'string',
      group: 'content',
      description: 'Shared UUID across EN, ES, and ID versions of the same article.',
      readOnly: true,
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      group: 'content',
      description: 'Original article URL from aitoken.com.tw used as the base for this post.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'AI Fundamentals',      value: 'fundamentals' },
          { title: 'Token Calculation',    value: 'calculation'  },
          { title: 'Token Pricing',        value: 'pricing'      },
          { title: 'Model Comparisons',    value: 'comparison'   },
          { title: 'AI Platforms & Tools', value: 'platform'     },
          { title: 'Tutorials',            value: 'tutorial'     },
          { title: 'Trust & Compliance',   value: 'compliance'   },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'difficultyLevel',
      title: 'Difficulty Level',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Beginner',     value: 'beginner'     },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced',     value: 'advanced'     },
        ],
        layout: 'radio',
      },
      initialValue: 'beginner',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      group: 'content',
      rows: 4,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'content',
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal',    value: 'normal'     },
            { title: 'Heading 2', value: 'h2'         },
            { title: 'Heading 3', value: 'h3'         },
            { title: 'Heading 4', value: 'h4'         },
            { title: 'Quote',     value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Number', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Em',     value: 'em'     },
              { title: 'Code',   value: 'code'   },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href',  type: 'url',     title: 'URL'             },
                  { name: 'blank', type: 'boolean', title: 'Open in new tab' },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          name: 'sectionImage',
          title: 'Section Image',
          options: { hotspot: true },
          fields: [
            { name: 'alt',         type: 'string', title: 'Alt Text'        },
            { name: 'caption',     type: 'string', title: 'Caption'         },
            { name: 'imagePrompt', type: 'text',   title: 'AI Image Prompt' },
          ],
        },
        {
          type: 'object',
          name: 'callout',
          title: 'Callout Box',
          fields: [
            {
              name: 'type',
              type: 'string',
              title: 'Type',
              options: {
                list: [
                  { title: 'Tip',     value: 'tip'     },
                  { title: 'Warning', value: 'warning' },
                  { title: 'Info',    value: 'info'    },
                ],
                layout: 'radio',
              },
              initialValue: 'tip',
            },
            { name: 'text', type: 'text', title: 'Text', rows: 3 },
          ],
        },
        {
          type: 'object',
          name: 'comparisonTable',
          title: 'Comparison Table',
          fields: [
            { name: 'caption', type: 'string', title: 'Caption' },
            {
              name: 'headers',
              type: 'array',
              title: 'Headers',
              of: [{ type: 'string' }],
            },
            {
              name: 'rows',
              type: 'array',
              title: 'Rows',
              of: [
                {
                  type: 'object',
                  name: 'row',
                  fields: [
                    {
                      name: 'cells',
                      type: 'array',
                      title: 'Cells',
                      of: [{ type: 'string' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),

    // ── SEO group ──────────────────────────────────────────────────────
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      group: 'seo',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      group: 'seo',
    }),
    defineField({
      name: 'focusKeyword',
      title: 'Focus Keyword',
      type: 'string',
      group: 'seo',
    }),
    defineField({
      name: 'secondaryKeywords',
      title: 'Secondary Keywords',
      type: 'array',
      group: 'seo',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      group: 'seo',
    }),

    // ── Images group ───────────────────────────────────────────────────
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      group: 'images',
      options: { hotspot: true },
      fields: [
        { name: 'alt',         type: 'string', title: 'Alt Text'        },
        { name: 'imagePrompt', type: 'text',   title: 'AI Image Prompt' },
      ],
    }),
    defineField({
      name: 'ogImage',
      title: 'OG Image (Social Share)',
      type: 'image',
      group: 'images',
      description: 'Ideal: 1200x630px. Defaults to featuredImage if empty.',
      fields: [
        { name: 'alt', type: 'string', title: 'Alt Text' },
      ],
    }),

    // ── Pipeline group ─────────────────────────────────────────────────
    defineField({
      name: 'generatedByPipeline',
      title: 'Generated by Pipeline',
      type: 'boolean',
      group: 'pipeline',
      initialValue: false,
    }),
    defineField({
      name: 'pipelineRunId',
      title: 'Pipeline Run ID',
      type: 'string',
      group: 'pipeline',
      readOnly: true,
    }),
    defineField({
      name: 'pipelineVersion',
      title: 'Pipeline Version',
      type: 'string',
      group: 'pipeline',
      readOnly: true,
    }),
    defineField({
      name: 'qaScore',
      title: 'QA Score',
      type: 'number',
      group: 'pipeline',
    }),
    defineField({
      name: 'qaFeedback',
      title: 'QA Feedback',
      type: 'text',
      group: 'pipeline',
      rows: 4,
      readOnly: true,
    }),
    defineField({
      name: 'qaCheckedAt',
      title: 'QA Checked At',
      type: 'datetime',
      group: 'pipeline',
      readOnly: true,
    }),
    defineField({
      name: 'retryCount',
      title: 'Retry Count',
      type: 'number',
      group: 'pipeline',
      initialValue: 0,
      readOnly: true,
    }),
  ],

  orderings: [
    {
      title: 'Article Number, Newest First',
      name: 'articleNumberDesc',
      by: [{ field: 'articleNumber', direction: 'desc' }],
    },
    {
      title: 'Published, Newest First',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],

  preview: {
    select: {
      title:         'title',
      articleNumber: 'articleNumber',
      language:      'language',
      category:      'category',
      media:         'featuredImage',
      generated:     'generatedByPipeline',
      qaScore:       'qaScore',
    },
    prepare({ title, articleNumber, language, category, media, generated, qaScore }: any) {
      const flag = generated ? '🤖 ' : '';
      const score = qaScore != null ? ` [QA:${qaScore}]` : '';
      return {
        title: `${flag}${title ?? 'Untitled'}${score}`,
        subtitle: [articleNumber ? `#${articleNumber}` : null, language, category].filter(Boolean).join(' · '),
        media,
      };
    },
  },
});
