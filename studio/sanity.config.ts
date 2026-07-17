import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import type { StructureBuilder } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { media, mediaAssetSource } from 'sanity-plugin-media';
import { postSchema } from './schemas/post';
import { imageMetaSchema } from './schemas/imageMeta';
import { faqItemSchema } from './schemas/faqItem';
import { aiTrendsPageSchema } from './schemas/aiTrendsPage';
import { apiModelPageSchema } from './schemas/apiModelPage';
import { apiComparePageSchema } from './schemas/apiComparePage';
import { beginnersGuidePageSchema } from './schemas/beginnersGuidePage';
import { userGuidePageSchema } from './schemas/userGuidePage';
import { useCasesPageSchema } from './schemas/useCasesPage';
import { tokenCalculatorPageSchema } from './schemas/tokenCalculatorPage';
import { compliancePageSchema } from './schemas/compliancePage';
import { homePageSchema } from './schemas/homePage';
import { seoInsightsSchema } from './schemas/seoInsights';
import { ArticleNumberFilter } from './components/ArticleNumberFilter';
import { SeoDashboard } from './components/SeoDashboard';

const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Blog Posts')
        .child(
          S.list()
            .title('Blog Posts')
            .items([
              S.listItem()
                .title('🇺🇸 English')
                .child(
                  S.documentList()
                    .title('🇺🇸 English')
                    .filter('_type == "post" && language == "en"')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('🇪🇸 Spanish')
                .child(
                  S.documentList()
                    .title('🇪🇸 Spanish')
                    .filter('_type == "post" && language == "es"')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('🇮🇩 Indonesian')
                .child(
                  S.documentList()
                    .title('🇮🇩 Indonesian')
                    .filter('_type == "post" && language == "id"')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('🇻🇳 Vietnamese')
                .child(
                  S.documentList()
                    .title('🇻🇳 Vietnamese')
                    .filter('_type == "post" && language == "vi"')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                ),
            ])
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(item => item.getId() !== 'post'),
    ]);

export default defineConfig({
  name: 'ai-token-global',
  title: 'AI Token Global',
  projectId: 'mq3wxr8n',
  dataset: 'production',
  plugins: [
    structureTool({ structure }),
    visionTool(),
    media(),
    {
      name: 'article-number-filter',
      tools: [
        {
          name: 'article-lookup',
          title: 'Find by #',
          icon: () => '🔢',
          component: ArticleNumberFilter,
        },
      ],
    },
    {
      name: 'seo-insights',
      tools: [
        {
          name: 'seo-insights',
          title: 'SEO',
          icon: () => '📊',
          component: SeoDashboard,
        },
      ],
    },
  ],
  schema: {
    types: [postSchema, imageMetaSchema, faqItemSchema, aiTrendsPageSchema, apiModelPageSchema, apiComparePageSchema, beginnersGuidePageSchema, userGuidePageSchema, useCasesPageSchema, tokenCalculatorPageSchema, compliancePageSchema, homePageSchema, seoInsightsSchema],
  },
});
