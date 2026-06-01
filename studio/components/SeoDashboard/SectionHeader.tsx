import { Stack, Flex, Heading, Text } from '@sanity/ui';

// Single header style for every dashboard section.
//
//   ┌ Title ────────────────── Last 30 days · 50 queries
//   └ One-sentence "what this section answers" line
//
// The subtitle is short on purpose — long enough to orient a new reader,
// short enough that nobody skips it.

interface Props {
  title: string;
  rangeDays: number;
  /** One-line description of what the section shows and how to read it. */
  subtitle?: string;
  /** Visible row count after filtering (e.g. when locale chip narrows the view). */
  visibleCount?: number;
  /** Total row count before filtering — shown only when different from visibleCount. */
  totalCount?: number;
  /** Noun for the count, e.g. "queries", "pages". */
  countNoun?: string;
}

export function SectionHeader({
  title,
  rangeDays,
  subtitle,
  visibleCount,
  totalCount,
  countNoun,
}: Props) {
  const showCount =
    typeof visibleCount === 'number' && typeof totalCount === 'number' && countNoun;
  const countLabel = showCount
    ? visibleCount === totalCount
      ? `${totalCount} ${countNoun}`
      : `${visibleCount} of ${totalCount} ${countNoun}`
    : null;

  return (
    <Stack space={2}>
      <Flex align="baseline" justify="space-between" gap={3} wrap="wrap">
        <Heading as="h2" size={2}>
          {title}
        </Heading>
        <Text
          size={0}
          weight="semibold"
          muted
          style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          Last {rangeDays} days{countLabel ? ` · ${countLabel}` : ''}
        </Text>
      </Flex>
      {subtitle ? (
        <Text size={1} muted style={{ lineHeight: 1.55, maxWidth: '720px' }}>
          {subtitle}
        </Text>
      ) : null}
    </Stack>
  );
}
