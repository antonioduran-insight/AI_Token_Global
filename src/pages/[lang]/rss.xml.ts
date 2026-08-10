import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SUPPORTED_LANGS, isValidLang, useTranslations, LANG_META } from '../../i18n/index';
import type { Lang } from '../../i18n/index';
import { getAllPosts } from '../../lib/sanity';
import type { SanityPost } from '../../lib/sanity';

// One feed per locale: /en/rss.xml, /es/rss.xml, /id/rss.xml, /vi/rss.xml
export async function getStaticPaths() {
  return SUPPORTED_LANGS.map(lang => ({ params: { lang } }));
}

const MAX_ITEMS = 50;

export async function GET(context: APIContext) {
  const lang = context.params.lang ?? 'en';
  if (!isValidLang(lang)) return new Response('Not found', { status: 404 });

  const t = useTranslations(lang as Lang);
  const siteOrigin = (context.site ?? new URL('https://aitoken.global')).origin;

  // Reuses the existing blog-index query. It orders by articleNumber for the
  // on-site listing, so re-sort here — a feed reader expects newest first.
  const posts: SanityPost[] = await getAllPosts(lang);
  const items = posts
    .filter(p => p.publishedAt && p.slug?.current)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, MAX_ITEMS)
    .map(p => ({
      title: p.title,
      link: `${siteOrigin}/${lang}/blog/${p.slug.current}/`,
      description: p.excerpt ?? '',
      pubDate: new Date(p.publishedAt),
    }));

  return rss({
    title: t('rss.title'),
    description: t('rss.description'),
    site: siteOrigin,
    items,
    customData: `<language>${LANG_META[lang as Lang].locale.toLowerCase()}</language>`,
  });
}
