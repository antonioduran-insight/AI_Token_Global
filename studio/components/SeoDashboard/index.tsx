import { useState } from 'react';
import styled from 'styled-components';
import {
  Stack,
  Heading,
  Text,
  Badge,
  Flex,
  Container,
  Button,
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
import { SeoCfOverview } from './SeoCfOverview';
import { SeoCfTopPages } from './SeoCfTopPages';
import { SeoCfReferrers } from './SeoCfReferrers';
import { SeoCfCountries } from './SeoCfCountries';
import { downloadFullReportAsJson } from './lib/exportReport';
import { loadOverview } from './lib/loadSnapshot';

type View = 'search' | 'behavior' | 'traffic';

// No mock data: sections show real snapshots, or an empty-state when a source has
// no data in the window. The site name comes from the snapshot meta.
const SITE_URL = loadOverview().meta.siteUrl;

const VIEWS: { id: View; label: string }[] = [
  { id: 'search', label: 'Search · Google Search Console' },
  { id: 'behavior', label: 'Behavior · Google Analytics 4' },
  { id: 'traffic', label: 'Traffic · Cloudflare' },
];

// Segmented control for the data-source switch. The Sanity Tab default was too
// flat — inactive tabs looked like plain text, so it wasn't obvious you could
// click them. This sits them in a bordered, tinted pill (so the group clearly
// reads as a "pick one" control), with a brand-tinted active state and a hover
// background on the others. Matches the locale-filter chip language elsewhere.
const ViewTabs = styled.div`
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.3rem;
  border: 1px solid rgba(127, 127, 127, 0.25);
  border-radius: 10px;
  background: rgba(127, 127, 127, 0.06);
  /* On phones the three long source labels don't fit on one row and force
     horizontal scroll. Stack them full-width instead (matches the 600px
     breakpoint the chart legends already use). */
  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: stretch;
  }
`;

const ViewTab = styled.button<{ $active: boolean }>`
  appearance: none;
  border: 0;
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: ${(p) => (p.$active ? 600 : 500)};
  white-space: nowrap;
  padding: 0.5rem 0.95rem;
  border-radius: 7px;
  color: ${(p) => (p.$active ? '#6155F1' : 'inherit')};
  background: ${(p) => (p.$active ? 'rgba(97, 85, 241, 0.14)' : 'transparent')};
  opacity: ${(p) => (p.$active ? 1 : 0.72)};
  transition: background-color 0.14s ease, opacity 0.14s ease, color 0.14s ease;
  &:hover {
    opacity: 1;
    background: ${(p) =>
      p.$active ? 'rgba(97, 85, 241, 0.18)' : 'rgba(127, 127, 127, 0.12)'};
  }
  &:focus-visible {
    outline: 2px solid #6155f1;
    outline-offset: 2px;
  }
  @media (max-width: 600px) {
    width: 100%;
    text-align: center;
  }
`;

export function SeoDashboard() {
  // Top-level view switcher: keeps Search (GSC) and Behavior (GA4) on separate
  // screens so neither requires scrolling past the other. Defaults to Search.
  const [view, setView] = useState<View>('search');

  return (
    <Container width={3} paddingX={[3, 4, 5]} paddingY={[4, 4, 5]}>
      <Stack space={5}>
        <Stack space={4}>
          <Flex align="center" gap={3} wrap="wrap" justify="space-between">
            <Flex align="center" gap={3} wrap="wrap">
              <Heading as="h1" size={4}>
                SEO Insights
              </Heading>
              <Badge tone="positive" fontSize={1}>
                Live data
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
            Insights for {SITE_URL} across search and on-site behaviour. Empty
            sections just mean no data in this window yet. Use{' '}
            <strong>Download report</strong> to export the dataset as JSON.
          </Text>

          <Flex align="center" gap={3} wrap="wrap">
            <Text
              size={0}
              weight="semibold"
              muted
              style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              View
            </Text>
            <ViewTabs role="tablist" aria-label="Dashboard data source">
              {VIEWS.map((v) => (
                <ViewTab
                  key={v.id}
                  type="button"
                  role="tab"
                  id={`seo-tab-${v.id}`}
                  aria-controls={`seo-view-${v.id}`}
                  aria-selected={view === v.id}
                  $active={view === v.id}
                  onClick={() => setView(v.id)}
                >
                  {v.label}
                </ViewTab>
              ))}
            </ViewTabs>
          </Flex>
        </Stack>

        {view === 'search' && (
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
        )}

        {view === 'behavior' && (
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

        {view === 'traffic' && (
          <Box
            key="traffic"
            id="seo-view-traffic"
            aria-labelledby="seo-tab-traffic"
            role="tabpanel"
          >
            <Stack space={5}>
              <SeoCfOverview />
              <SeoCfTopPages />
              <SeoCfReferrers />
              <SeoCfCountries />
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
