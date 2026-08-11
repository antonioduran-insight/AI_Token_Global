// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.aitoken.global',
  integrations: [sitemap()],
  output: 'static',
});
