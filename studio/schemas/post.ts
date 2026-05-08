import { defineField, defineType } from 'sanity';
import { mediaAssetSource } from 'sanity-plugin-media';
import { STUDIO_LANGUAGES } from '../config/languages';

export const postSchema = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'articleNumber',
      title: 'Article Number',
      type: 'number',
      description: 'Unique article number for ordering and lookup (e.g. 1, 2, 3...)',
      validation: Rule => Rule.required().integer().positive(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required().max(300),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: 'Select from Media Library — search by article number to find the right image',
      options: {
        hotspot: true,
        sources: [mediaAssetSource],
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for screen readers and SEO',
          validation: Rule => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      description: 'Which language site this post belongs to',
      options: {
        list: [...STUDIO_LANGUAGES],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'URL' },
                  { name: 'blank', type: 'boolean', title: 'Open in new tab' },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt text' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
        {
          type: 'object',
          name: 'codeBlock',
          title: 'Code Block',
          fields: [
            { name: 'code', type: 'text', title: 'Code' },
            { name: 'language', type: 'string', title: 'Language' },
          ],
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string', description: 'Overrides post title. Max 60 chars.', validation: Rule => Rule.max(60) }),
        defineField({ name: 'seoDescription', title: 'Meta Description', type: 'text', rows: 2, description: 'Overrides excerpt. Max 160 chars.', validation: Rule => Rule.max(160) }),
        defineField({ name: 'ogImage', title: 'Open Graph Image', type: 'image', description: '1200×630px recommended. Defaults to cover image.' }),
        defineField({ name: 'noindex', title: 'Hide from search engines', type: 'boolean', initialValue: false }),
      ],
    }),
  ],

  preview: {
    select: { title: 'title', subtitle: 'articleNumber', media: 'coverImage' },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `#${subtitle}` : 'No number set',
        media,
      };
    },
  },
});
