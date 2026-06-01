import { Stack, Heading, Text, Badge, Flex, Container, Button } from '@sanity/ui';
import { SeoOverview } from './SeoOverview';
import { SeoTopQueries } from './SeoTopQueries';
import { SeoTopPages } from './SeoTopPages';
import { SeoStrikingDistance } from './SeoStrikingDistance';
import { SeoByLocale } from './SeoByLocale';
import { SeoCtrOutliers } from './SeoCtrOutliers';
import { SeoGa4Overview } from './SeoGa4Overview';
import { downloadFullReportAsJson } from './lib/exportReport';

export function SeoDashboard() {
  return (
    <Container width={3} paddingX={5} paddingY={5}>
      <Stack space={5}>
        <Stack space={3}>
          <Flex align="center" gap={3} wrap="wrap" justify="space-between">
            <Flex align="center" gap={3} wrap="wrap">
              <Heading as="h1" size={4}>
                SEO Insights
              </Heading>
              <Badge tone="caution" fontSize={1}>
                Mock data
              </Badge>
            </Flex>
            <Button
              text="Download report (JSON)"
              mode="ghost"
              tone="primary"
              fontSize={1}
              padding={3}
              onClick={downloadFullReportAsJson}
            />
          </Flex>
          <Text size={1} muted>
            Search performance dashboard for aitoken.global. The numbers below are
            placeholders until the site is verified in Google Search Console — once
            it is, this page swaps to real data with no code changes. Use{' '}
            <strong>Download report</strong> to export the full dataset as JSON for
            AI brainstorming.
          </Text>
        </Stack>

        <SeoOverview />

        <SeoTopQueries />

        <SeoTopPages />

        <SeoStrikingDistance />

        <SeoByLocale />

        <SeoCtrOutliers />

        <Stack space={3}>
          <Heading as="h2" size={3}>
            Behavior · Google Analytics 4
          </Heading>
          <Text size={1} muted>
            The sections above are search (Google Search Console). The section
            below is on-site behaviour (Google Analytics 4) — mock data until the
            GA4 Data API credentials land, then it swaps to real automatically,
            same as the search sections.
          </Text>
        </Stack>

        <SeoGa4Overview />
      </Stack>
    </Container>
  );
}
