import { useState } from 'react';
import {
  Stack,
  Heading,
  Text,
  Badge,
  Flex,
  Container,
  Button,
  TabList,
  Tab,
  Box,
} from '@sanity/ui';
import { SeoOverview } from './SeoOverview';
import { SeoTopQueries } from './SeoTopQueries';
import { SeoTopPages } from './SeoTopPages';
import { SeoStrikingDistance } from './SeoStrikingDistance';
import { SeoByLocale } from './SeoByLocale';
import { SeoCtrOutliers } from './SeoCtrOutliers';
import { SeoGa4Overview } from './SeoGa4Overview';
import { SeoGa4TrafficSources } from './SeoGa4TrafficSources';
import { SeoGa4TopPages } from './SeoGa4TopPages';
import { SeoGa4Events } from './SeoGa4Events';
import { SeoGa4ByLocale } from './SeoGa4ByLocale';
import { downloadFullReportAsJson } from './lib/exportReport';

type View = 'search' | 'behavior';

export function SeoDashboard() {
  // Top-level view switcher: keeps Search (GSC) and Behavior (GA4) on separate
  // screens so neither requires scrolling past the other. Defaults to Search.
  const [view, setView] = useState<View>('search');

  return (
    <Container width={3} paddingX={5} paddingY={5}>
      <Stack space={5}>
        <Stack space={4}>
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
            Insights for aitoken.global across search and on-site behaviour. The
            numbers are placeholders until each source is connected — then that
            view swaps to real data with no code changes. Use{' '}
            <strong>Download report</strong> to export the dataset as JSON.
          </Text>

          <TabList space={2}>
            <Tab
              aria-controls="seo-view-search"
              id="seo-tab-search"
              label="Search · Google Search Console"
              onClick={() => setView('search')}
              selected={view === 'search'}
            />
            <Tab
              aria-controls="seo-view-behavior"
              id="seo-tab-behavior"
              label="Behavior · Google Analytics 4"
              onClick={() => setView('behavior')}
              selected={view === 'behavior'}
            />
          </TabList>
        </Stack>

        {view === 'search' ? (
          <Box
            key="search"
            id="seo-view-search"
            aria-labelledby="seo-tab-search"
            role="tabpanel"
          >
            <Stack space={5}>
              <SeoOverview />
              <SeoTopQueries />
              <SeoTopPages />
              <SeoStrikingDistance />
              <SeoByLocale />
              <SeoCtrOutliers />
            </Stack>
          </Box>
        ) : (
          <Box
            key="behavior"
            id="seo-view-behavior"
            aria-labelledby="seo-tab-behavior"
            role="tabpanel"
          >
            <Stack space={5}>
              <SeoGa4Overview />
              <SeoGa4TrafficSources />
              <SeoGa4TopPages />
              <SeoGa4Events />
              <SeoGa4ByLocale />
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
