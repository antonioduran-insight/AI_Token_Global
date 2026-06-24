import { createClient } from '@sanity/client';

export interface SeoData {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: { asset: { url: string } };
  noindex?: boolean;
}

export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt: string;
  articleNumber?: number;
  language: string;
  category?: string;
  coverImage?: { asset: { url: string } };
  tags?: string[];
  body: any[];
}

export type PortableTextBlock = any[];

export interface TrendCard {
  _key: string;
  tag: string;
  title: string;
  body: PortableTextBlock;
  pullQuote?: string;
  accentColor: string;
}

export interface AudienceCard {
  _key: string;
  audience: string;
  body: PortableTextBlock;
}

export interface FaqItem {
  _key: string;
  question: string;
  answer: PortableTextBlock;
}

export interface AiTrendsPageData {
  seo?: SeoData;
  heroHeadline: string;
  heroSubtitle: string;
  heroSubtitle2: PortableTextBlock;
  introTitle: string;
  introParagraphs: PortableTextBlock;
  summaryTitle: string;
  summaryPoints: string[];
  trendsSectionLabel: string;
  trendsSectionTitle: string;
  trendCards: TrendCard[];
  audienceSectionTitle: string;
  audienceIntro: PortableTextBlock;
  audienceCards: AudienceCard[];
  sourcesTitle: string;
  sourcesNote: string;
  downloadTitle?: string;
  downloadMeta?: string;
  downloadUrl?: string;
  faq: FaqItem[];
}

function getClient() {
  const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
  const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production';
  if (!projectId) return null;
  return createClient({ projectId, dataset, apiVersion: '2024-01-01', useCdn: true });
}

export async function getAllPosts(lang: string): Promise<SanityPost[]> {
  const client = getClient();
  if (!client) return [];
  return client.fetch(
    `*[_type == "post" && language == $lang] | order(coalesce(articleNumber, 999999) asc, _createdAt desc) {
      _id, title, slug, publishedAt, excerpt, tags, category, articleNumber, language,
      coverImage { asset -> { url } }
    }`,
    { lang }
  );
}

export async function getPostBySlug(slug: string, lang: string): Promise<SanityPost | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch(
    `*[_type == "post" && slug.current == $slug && language == $lang][0] {
      _id, title, slug, publishedAt, excerpt, tags, category, articleNumber, language,
      coverImage { asset -> { url } },
      body[] {
        ...,
        _type == "image" => {
          ...,
          asset -> { url, metadata { dimensions } }
        }
      }
    }`,
    { slug, lang }
  );
}

export async function getRelatedPosts(currentSlug: string, lang: string, category: string | undefined, limit = 3): Promise<SanityPost[]> {
  const client = getClient();
  if (!client) return [];
  // Prefer same-category posts; fall back to other recent posts in the same language.
  const sameCat = category
    ? await client.fetch(
        `*[_type == "post" && language == $lang && category == $category && slug.current != $currentSlug] | order(publishedAt desc, articleNumber asc) [0...$limit] {
          _id, title, slug, publishedAt, excerpt, tags, category, articleNumber, language,
          coverImage { asset -> { url } }
        }`,
        { lang, category, currentSlug, limit }
      )
    : [];
  if (sameCat.length >= limit) return sameCat;
  const remaining = limit - sameCat.length;
  const fillerSlugs = [currentSlug, ...sameCat.map((p: SanityPost) => p.slug.current)];
  const fillers = await client.fetch(
    `*[_type == "post" && language == $lang && !(slug.current in $excluded)] | order(publishedAt desc, articleNumber asc) [0...$limit] {
      _id, title, slug, publishedAt, excerpt, tags, category, articleNumber, language,
      coverImage { asset -> { url } }
    }`,
    { lang, excluded: fillerSlugs, limit: remaining }
  );
  return [...sameCat, ...fillers];
}

export async function getAllPostSlugs(): Promise<{ slug: string; lang: string }[]> {
  const client = getClient();
  if (!client) return [];
  const posts = await client.fetch(
    `*[_type == "post"] { "slug": slug.current, language }`
  );
  return posts.map((p: any) => ({ slug: p.slug, lang: p.language ?? 'en' }));
}

export async function getAiTrendsPage(lang: string): Promise<AiTrendsPageData | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch(
    `*[_type == "aiTrendsPage" && language == $lang][0] {
      seo { seoTitle, seoDescription, ogImage { asset -> { url } }, noindex },
      heroHeadline, heroSubtitle, heroSubtitle2,
      introTitle, introParagraphs,
      summaryTitle, summaryPoints,
      trendsSectionLabel, trendsSectionTitle,
      trendCards[] { _key, tag, title, body, pullQuote, accentColor },
      audienceSectionTitle, audienceIntro,
      audienceCards[] { _key, audience, body },
      sourcesTitle, sourcesNote,
      downloadTitle, downloadMeta, downloadUrl,
      faq[] { _key, question, answer }
    }`,
    { lang }
  );
}

// ── API Model Page (chatgpt / claude / gemini) ────────────────────────────

export interface ReadingLink {
  _key: string;
  label: string;
  url: string;
}

export interface ApiModelPageData {
  seo?: SeoData;
  modelSlug: string;
  heroHeadline: string;
  heroSubtitle?: string;
  heroAccent: 'purple' | 'teal' | 'blue';
  overviewBody?: PortableTextBlock;
  whatIsTitle?: string;
  whatIsBody?: PortableTextBlock;
  useCasesTitle?: string;
  useCasesBody?: PortableTextBlock;
  pricingTitle?: string;
  pricingBody?: PortableTextBlock;
  pricingReference?: PortableTextBlock;
  uniqueSectionTitle?: string;
  uniqueSectionBody?: PortableTextBlock;
  comparingTitle?: string;
  comparingBody?: PortableTextBlock;
  furtherReadingTitle?: string;
  furtherReading?: ReadingLink[];
  faqTitle?: string;
  faq?: FaqItem[];
}

export async function getApiModelPage(modelSlug: string, lang: string): Promise<ApiModelPageData | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch(
    `*[_type == "apiModelPage" && modelSlug == $modelSlug && language == $lang][0] {
      seo { seoTitle, seoDescription, ogImage { asset -> { url } }, noindex },
      modelSlug, heroHeadline, heroSubtitle, heroAccent,
      overviewBody, whatIsTitle, whatIsBody,
      useCasesTitle, useCasesBody,
      pricingTitle, pricingBody, pricingReference,
      uniqueSectionTitle, uniqueSectionBody,
      comparingTitle, comparingBody,
      furtherReadingTitle,
      furtherReading[] { _key, label, url },
      faqTitle,
      faq[] { _key, question, answer }
    }`,
    { modelSlug, lang }
  );
}

// ── API Compare Page ──────────────────────────────────────────────────────

export interface TypeCard {
  _key: string;
  icon: 'text' | 'image' | 'video';
  title: string;
  subtitle?: string;
  description?: string;
  ctaLabel?: string;
  anchorId?: string;
}

export interface ModelRow {
  _key: string;
  modelName: string;
  description?: string;
}

export interface ApiComparePageData {
  seo?: SeoData;
  heroHeadline: string;
  heroSubtitle?: string;
  heroNote?: string;
  typeCards?: TypeCard[];
  pricingCalloutTitle?: string;
  pricingCalloutBody?: string;
  pricingCalloutCta?: string;
  textModelsTitle?: string;
  textModelsSubtitle?: string;
  textModels?: ModelRow[];
  imageModelsTitle?: string;
  imageModelsSubtitle?: string;
  imageModels?: ModelRow[];
  videoModelsTitle?: string;
  videoModelsSubtitle?: string;
  videoModels?: ModelRow[];
  faqTitle?: string;
  faq?: FaqItem[];
  ctaHeadline?: string;
  ctaBody?: string;
}

export async function getApiComparePage(lang: string): Promise<ApiComparePageData | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch(
    `*[_type == "apiComparePage" && language == $lang][0] {
      seo { seoTitle, seoDescription, ogImage { asset -> { url } }, noindex },
      heroHeadline, heroSubtitle, heroNote,
      typeCards[] { _key, icon, title, subtitle, description, ctaLabel, anchorId },
      pricingCalloutTitle, pricingCalloutBody, pricingCalloutCta,
      textModelsTitle, textModelsSubtitle,
      textModels[] { _key, modelName, description },
      imageModelsTitle, imageModelsSubtitle,
      imageModels[] { _key, modelName, description },
      videoModelsTitle, videoModelsSubtitle,
      videoModels[] { _key, modelName, description },
      faqTitle,
      faq[] { _key, question, answer },
      ctaHeadline, ctaBody
    }`,
    { lang }
  );
}

// ── Beginners Guide Page ──────────────────────────────────────────────────

export interface ReadingStep {
  _key: string;
  stepLabel?: string;
  title: string;
  body?: PortableTextBlock;
  linkLabel?: string;
  linkUrl?: string;
}

export interface StuckCallout {
  _key: string;
  title: string;
  body?: PortableTextBlock;
}

export interface NextRead {
  _key: string;
  title: string;
  excerpt?: string;
  url?: string;
}

export interface BeginnersGuidePage {
  _id: string;
  language: string;
  heroLabel?: string;
  heroHeadline: string;
  heroSubtitle?: string;
  stepsTitle?: string;
  stepsIntroBody?: PortableTextBlock;
  readingSteps?: ReadingStep[];
  stuckTitle?: string;
  stuckBody?: PortableTextBlock;
  stuckCallouts?: StuckCallout[];
  faqTitle?: string;
  faq?: FaqItem[];
  nextReadsTitle?: string;
  nextReadsIntroBody?: PortableTextBlock;
  nextReads?: NextRead[];
  ctaTitle?: string;
  ctaBody?: string;
  seo?: SeoData;
}

export async function getBeginnersGuidePage(lang: string): Promise<BeginnersGuidePage | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch(
    `*[_type == "beginnersGuidePage" && language == $lang][0] {
      _id, language, heroLabel, heroHeadline, heroSubtitle,
      stepsTitle, stepsIntroBody,
      readingSteps[] { _key, stepLabel, title, body, linkLabel, linkUrl },
      stuckTitle, stuckBody,
      stuckCallouts[] { _key, title, body },
      faqTitle,
      faq[] { _key, question, answer },
      nextReadsTitle, nextReadsIntroBody,
      nextReads[] { _key, title, excerpt, url },
      ctaTitle, ctaBody,
      seo { seoTitle, seoDescription, ogImage { asset -> { url } }, noindex }
    }`,
    { lang }
  );
}

// ── User Guide Page ───────────────────────────────────────────────────────

export interface FeatureCard {
  _key: string;
  title: string;
  body?: PortableTextBlock;
}

export interface ModelCard {
  _key: string;
  name: string;
  description?: string;
}

export interface AudienceCardGuide {
  _key: string;
  role: string;
  body?: PortableTextBlock;
}

export interface GuideStep {
  _key: string;
  title: string;
  body?: PortableTextBlock;
}

export interface UserGuidePage {
  _id: string;
  language: string;
  heroLabel?: string;
  heroHeadline: string;
  heroSubtitle?: string;
  heroSubtitle2?: string;
  whatIsTitle?: string;
  whatIsBody?: PortableTextBlock;
  problemsTitle?: string;
  problemsBody?: PortableTextBlock;
  featuresTitle?: string;
  features?: FeatureCard[];
  modelsTitle?: string;
  models?: ModelCard[];
  useCasesTitle?: string;
  useCasesBody?: PortableTextBlock;
  audienceTitle?: string;
  audience?: AudienceCardGuide[];
  openclawTitle?: string;
  openclawBody?: PortableTextBlock;
  gettingStartedTitle?: string;
  steps?: GuideStep[];
  faqTitle?: string;
  faq?: FaqItem[];
  seo?: SeoData;
}

export async function getUserGuidePage(lang: string): Promise<UserGuidePage | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch(
    `*[_type == "userGuidePage" && language == $lang][0] {
      _id, language, heroLabel, heroHeadline, heroSubtitle, heroSubtitle2,
      whatIsTitle, whatIsBody,
      problemsTitle, problemsBody,
      featuresTitle,
      features[] { _key, title, body },
      modelsTitle,
      models[] { _key, name, description },
      useCasesTitle, useCasesBody,
      audienceTitle,
      audience[] { _key, role, body },
      openclawTitle, openclawBody,
      gettingStartedTitle,
      steps[] { _key, title, body },
      faqTitle,
      faq[] { _key, question, answer },
      seo { seoTitle, seoDescription, ogImage { asset -> { url } }, noindex }
    }`,
    { lang }
  );
}

// ── Use Cases Page ────────────────────────────────────────────────────────

export interface UseCaseCard {
  _key: string;
  title: string;
  description?: string;
  commonDirections?: string;
}

export interface UseCasesPage {
  _id: string;
  language: string;
  heroLabel?: string;
  heroHeadline: string;
  heroSubtitle?: string;
  useCases?: UseCaseCard[];
  footerNoteBody?: PortableTextBlock;
  seo?: SeoData;
}

export async function getUseCasesPage(lang: string): Promise<UseCasesPage | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch(
    `*[_type == "useCasesPage" && language == $lang][0] {
      _id, language, heroLabel, heroHeadline, heroSubtitle,
      useCases[] { _key, title, description, commonDirections },
      footerNoteBody,
      seo { seoTitle, seoDescription, ogImage { asset -> { url } }, noindex }
    }`,
    { lang }
  );
}

// ── Token Calculator Page ─────────────────────────────────────────────────

export interface TokenCalculatorPage {
  _id: string;
  language: string;
  heroLabel?: string;
  heroHeadline: string;
  heroSubtitle?: string;
  faqSectionLabel?: string;
  faqTitle?: string;
  faqIntro?: string;
  faq?: FaqItem[];
  ctaTitle?: string;
  ctaBody?: string;
  seo?: SeoData;
}

export async function getTokenCalculatorPage(lang: string): Promise<TokenCalculatorPage | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch(
    `*[_type == "tokenCalculatorPage" && language == $lang][0] {
      _id, language, heroLabel, heroHeadline, heroSubtitle,
      faqSectionLabel, faqTitle, faqIntro,
      faq[] { _key, question, answer },
      ctaTitle, ctaBody,
      seo { seoTitle, seoDescription, ogImage { asset -> { url } }, noindex }
    }`,
    { lang }
  );
}

// ── Compliance Page ───────────────────────────────────────────────────────

export interface BlockerItem {
  _key: string;
  text: string;
}

export interface SolutionCard {
  _key: string;
  title: string;
  body?: PortableTextBlock;
}

export interface AudienceItem {
  _key: string;
  role: string;
  description?: string;
}

export interface RoleCard {
  _key: string;
  title: string;
  body?: PortableTextBlock;
}

export interface CompliancePage {
  _id: string;
  language: string;
  heroLabel?: string;
  heroHeadline: string;
  heroSubtitle?: string;
  blockersTitle?: string;
  blockersIntroBody?: PortableTextBlock;
  blockerItems?: BlockerItem[];
  proposalTitle?: string;
  proposalBody?: string;
  proposalCtaLabel?: string;
  proposalCtaUrl?: string;
  solutionTitle?: string;
  solutions?: SolutionCard[];
  audienceTitle?: string;
  audienceItems?: AudienceItem[];
  audienceFootnote?: PortableTextBlock;
  roleTitle?: string;
  roles?: RoleCard[];
  faqTitle?: string;
  faq?: FaqItem[];
  sidebarCtaTitle?: string;
  sidebarCtaBody?: string;
  sidebarCtaLabel?: string;
  sidebarCtaUrl?: string;
  seo?: SeoData;
}

export async function getCompliancePage(lang: string): Promise<CompliancePage | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch(
    `*[_type == "compliancePage" && language == $lang][0] {
      _id, language, heroLabel, heroHeadline, heroSubtitle,
      blockersTitle, blockersIntroBody,
      blockerItems[] { _key, text },
      proposalTitle, proposalBody, proposalCtaLabel, proposalCtaUrl,
      solutionTitle,
      solutions[] { _key, title, body },
      audienceTitle,
      audienceItems[] { _key, role, description },
      audienceFootnote,
      roleTitle,
      roles[] { _key, title, body },
      faqTitle,
      faq[] { _key, question, answer },
      sidebarCtaTitle, sidebarCtaBody, sidebarCtaLabel, sidebarCtaUrl,
      seo { seoTitle, seoDescription, ogImage { asset -> { url } }, noindex }
    }`,
    { lang }
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────

export interface HeroStat {
  statNumber: string;
  statLabel: string;
}

export interface TokenBreakdown {
  tokens?: string[];
  tokenCount?: string;
  charCount?: string;
}

export interface HomePageData {
  heroHeadline?: string;
  heroAccentText?: string;
  heroSubtitle?: string;
  heroStats?: HeroStat[];
  tokenBody2?: PortableTextBlock;
  tokenBreakdown?: TokenBreakdown;
  faqTitle?: string;
  faqSubtitle?: string;
  faq?: FaqItem[];
  seo?: SeoData;
}

export async function getHomePage(lang: string): Promise<HomePageData | null> {
  const client = getClient();
  if (!client) return null;
  return client.fetch(
    `*[_type == "homePage" && language == $lang][0] {
      heroHeadline, heroAccentText, heroSubtitle,
      heroStats[] { statNumber, statLabel },
      tokenBody2,
      tokenBreakdown { tokens, tokenCount, charCount },
      faqTitle, faqSubtitle,
      faq[] { _key, question, answer },
      seo { seoTitle, seoDescription, ogImage { asset -> { url } }, noindex }
    }`,
    { lang }
  );
}

