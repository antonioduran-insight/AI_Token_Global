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

/**
 * A price rise or cut the vendor has already announced.
 *
 * This belongs here rather than in prose inside a CMS document: a scheduled
 * change that only exists as a sentence someone wrote is a change nobody will
 * remember to apply. Anything that renders a price can render the warning too.
 *
 * On `effectiveDate` the new numbers become the real ones — move them into
 * inputPerMillion/outputPerMillion and delete the upcomingChange.
 */
export interface UpcomingChange {
  /** ISO date (YYYY-MM-DD) the new prices take effect. */
  effectiveDate: string;
  /** USD per 1,000,000 input tokens from effectiveDate. */
  inputPerMillion: number;
  /** USD per 1,000,000 output tokens from effectiveDate. */
  outputPerMillion: number;
}

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
  /** Set only when the vendor has announced a dated price change. */
  upcomingChange?: UpcomingChange;
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
    displayName: 'Claude Sonnet 5',
    inputPerMillion: 2.0,
    outputPerMillion: 10.0,
    sourceUrl: PROVIDER_PRICING_URL.Anthropic,
    upcomingChange: {
      effectiveDate: '2026-09-01',
      inputPerMillion: 3.0,
      outputPerMillion: 15.0,
    },
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
  return formatIsoDate(PRICING_LAST_CHECKED, locale);
}

/** Any YYYY-MM-DD rendered for a locale, without the UTC-midnight shift. */
export function formatIsoDate(iso: string, locale: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Models with a dated price change still ahead of them. */
export function modelsWithUpcomingChange(): Model[] {
  return MODELS.filter(m => m.upcomingChange);
}

/**
 * Fill a `pricing.upcomingChange` template with a model's scheduled new prices.
 * The caller supplies the already-translated template so this stays free of i18n.
 *
 *   formatUpcomingChange(t('pricing.upcomingChange'), model, 'en-US')
 *   → "Rises to $3.00 input / $15.00 output per 1M tokens on September 1, 2026"
 */
export function formatUpcomingChange(template: string, model: Model, locale: string): string {
  const change = model.upcomingChange;
  if (!change) return '';
  return template
    .replace('{input}', formatPrice(change.inputPerMillion))
    .replace('{output}', formatPrice(change.outputPerMillion))
    .replace('{date}', formatIsoDate(change.effectiveDate, locale));
}
