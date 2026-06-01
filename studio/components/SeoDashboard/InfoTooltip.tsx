import { Tooltip, Box, Text } from '@sanity/ui';
import styled from 'styled-components';
import { glossaryLookup } from './lib/glossary';

// Small "i" badge that, on hover, reveals a plain-English definition.
// Used to disambiguate SEO jargon (clicks, impressions, CTR, position,
// shortfall, etc.) wherever it appears in the dashboard UI.
//
// Two ways to use:
//   <InfoTooltip term="clicks" />              — looks up in glossary
//   <InfoTooltip description="custom text" />  — pass an explicit string
//
// Renders nothing if neither the term nor description resolves to text,
// so callers can safely pass possibly-unknown term keys.

interface Props {
  term?: string;
  description?: string;
  /** Optional aria-label override (defaults to "definition of <term>"). */
  ariaLabel?: string;
}

const Badge = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  font-family: ui-serif, Georgia, serif;
  font-size: 9px;
  font-weight: 700;
  font-style: italic;
  line-height: 1;
  opacity: 0.5;
  cursor: help;
  vertical-align: middle;
  margin-left: 0.35rem;
  padding: 0;
  transition: opacity 0.15s ease;
  &:hover { opacity: 1; }
  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    opacity: 1;
  }
`;

const Content = styled(Box)`
  max-width: 280px;
`;

export function InfoTooltip({ term, description, ariaLabel }: Props) {
  const text = description ?? (term ? glossaryLookup(term) : null);
  if (!text) return null;

  return (
    <Tooltip
      content={
        <Content padding={3}>
          <Text size={1} style={{ lineHeight: 1.5 }}>
            {text}
          </Text>
        </Content>
      }
      placement="top"
      portal
      fallbackPlacements={['bottom', 'right', 'left']}
    >
      <Badge
        type="button"
        aria-label={ariaLabel ?? (term ? `Definition of ${term}` : 'More information')}
      >
        i
      </Badge>
    </Tooltip>
  );
}
