/**
 * Single source of truth for every model price shown on this site.
 *
 * Prices are USD per million tokens, taken from the vendors' own public pricing
 * pages on the date in PRICING_LAST_CHECKED. Nothing here is rounded, averaged
 * or estimated — if a number changes at the vendor, change it here and nowhere
 * else. No page is allowed to hardcode a price.
 *
 * When you update a price, update PRICING_LAST_CHECKED in the same commit: the
 * date is rendered next to every pricing block on the site.
 */

export const PRICING_LAST_CHECKED = '2026-08-11';

export type Provider = 'OpenAI' | 'Anthropic' | 'Google';

export interface Model {
  /** Vendor that serves the model. */
  provider: Provider;
  /** Exact name as the vendor writes it. */
  displayName: string;
  /** USD per 1,000,000 input tokens. */
  inputPerMillion: number;
  /** USD per 1,000,000 output tokens. */
  outputPerMillion: number;
  /** The vendor's own pricing page — the thing these numbers were checked against. */
  sourceUrl: string;
}

export const PROVIDER_PRICING_URL: Record<Provider, string> = {
  OpenAI: 'https://openai.com/api/pricing/',
  Anthropic: 'https://platform.claude.com/docs/en/about-claude/pricing',
  Google: 'https://ai.google.dev/gemini-api/docs/pricing',
};

export const MODELS: Model[] = [
  {
    provider: 'OpenAI',
    displayName: 'GPT-5.6 Terra',
    inputPerMillion: 2.0,
    outputPerMillion: 12.0,
    sourceUrl: PROVIDER_PRICING_URL.OpenAI,
  },
  {
    provider: 'OpenAI',
    displayName: 'GPT-5.6 Luna',
    inputPerMillion: 0.2,
    outputPerMillion: 1.2,
    sourceUrl: PROVIDER_PRICING_URL.OpenAI,
  },
  {
    provider: 'Anthropic',
    displayName: 'Claude Opus 5',
    inputPerMillion: 5.0,
    outputPerMillion: 25.0,
    sourceUrl: PROVIDER_PRICING_URL.Anthropic,
  },
  {
    provider: 'Anthropic',
    displayName: 'Claude Haiku 4.5',
    inputPerMillion: 1.0,
    outputPerMillion: 5.0,
    sourceUrl: PROVIDER_PRICING_URL.Anthropic,
  },
  {
    provider: 'Google',
    displayName: 'Gemini 3.1 Pro',
    inputPerMillion: 2.0,
    outputPerMillion: 12.0,
    sourceUrl: PROVIDER_PRICING_URL.Google,
  },
  {
    provider: 'Google',
    displayName: 'Gemini 3.5 Flash-Lite',
    inputPerMillion: 0.3,
    outputPerMillion: 2.5,
    sourceUrl: PROVIDER_PRICING_URL.Google,
  },
];

/** Look a model up by its exact displayName. Throws so a typo fails the build. */
export function getModel(displayName: string): Model {
  const model = MODELS.find(m => m.displayName === displayName);
  if (!model) {
    throw new Error(
      `[pricing] Unknown model "${displayName}". Known: ${MODELS.map(m => m.displayName).join(', ')}`
    );
  }
  return model;
}

/** The three models used wherever the site shows one flagship per provider. */
export const FLAGSHIP_MODELS: Model[] = [
  getModel('GPT-5.6 Terra'),
  getModel('Claude Opus 5'),
  getModel('Gemini 3.1 Pro'),
];

/** `$2.00` — always two decimals, so a column of prices lines up. */
export function formatPrice(usdPerMillion: number): string {
  return `$${usdPerMillion.toFixed(2)}`;
}

/**
 * PRICING_LAST_CHECKED rendered for a locale.
 * Built from the date parts rather than Date.parse so the ISO string is not
 * read as UTC midnight and shifted a day backwards at build time.
 */
export function formatPricingDate(locale: string): string {
  const [year, month, day] = PRICING_LAST_CHECKED.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
