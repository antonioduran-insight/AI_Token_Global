/**
 * Single source of truth for every model price shown on this site.
 *
 * Prices are USD per million tokens, taken from the vendors' own public pricing
 * pages on each model's `lastChecked` date. Nothing here is rounded, averaged
 * or estimated — if a number changes at the vendor, change it here and nowhere
 * else. No page is allowed to hardcode a price.
 *
 * When you check a model against its vendor page, set that model's
 * `lastChecked` in the same commit — and only that model's. Every pricing block
 * on the site renders the oldest `lastChecked` among the models it shows, so a
 * block can never claim to be fresher than its stalest row.
 */

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
  /** ISO date (YYYY-MM-DD) these numbers were last checked against sourceUrl. */
  lastChecked: string;
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
    displayName: 'GPT-5.6 Sol',
    inputPerMillion: 5.0,
    outputPerMillion: 30.0,
    lastChecked: '2026-10-07',
    sourceUrl: PROVIDER_PRICING_URL.OpenAI,
  },
  {
    provider: 'OpenAI',
    displayName: 'GPT-5.6 Terra',
    inputPerMillion: 2.0,
    outputPerMillion: 12.0,
    lastChecked: '2026-10-07',
    sourceUrl: PROVIDER_PRICING_URL.OpenAI,
  },
  {
    provider: 'OpenAI',
    displayName: 'GPT-5.6 Luna',
    inputPerMillion: 0.2,
    outputPerMillion: 1.2,
    lastChecked: '2026-10-07',
    sourceUrl: PROVIDER_PRICING_URL.OpenAI,
  },
  {
    provider: 'Anthropic',
    displayName: 'Claude Opus 5',
    inputPerMillion: 5.0,
    outputPerMillion: 25.0,
    lastChecked: '2026-09-03',
    sourceUrl: PROVIDER_PRICING_URL.Anthropic,
  },
  {
    provider: 'Anthropic',
    displayName: 'Claude Sonnet 5',
    inputPerMillion: 2.0,
    outputPerMillion: 10.0,
    lastChecked: '2026-09-03',
    sourceUrl: PROVIDER_PRICING_URL.Anthropic,
  },
  {
    provider: 'Anthropic',
    displayName: 'Claude Haiku 4.5',
    inputPerMillion: 1.0,
    outputPerMillion: 5.0,
    lastChecked: '2026-09-03',
    sourceUrl: PROVIDER_PRICING_URL.Anthropic,
  },
  {
    provider: 'Google',
    displayName: 'Gemini 3.1 Pro',
    inputPerMillion: 2.0,
    outputPerMillion: 12.0,
    lastChecked: '2026-09-03',
    sourceUrl: PROVIDER_PRICING_URL.Google,
  },
  {
    provider: 'Google',
    displayName: 'Gemini 3.5 Flash-Lite',
    inputPerMillion: 0.3,
    outputPerMillion: 2.5,
    lastChecked: '2026-09-03',
    sourceUrl: PROVIDER_PRICING_URL.Google,
  },
];

/** The oldest lastChecked among `models` — the date a block showing them can honestly claim. */
export function oldestCheck(models: readonly Model[] = MODELS): string {
  return models.map(m => m.lastChecked).reduce((a, b) => (b < a ? b : a));
}

/**
 * Kept for anything that still wants one site-wide date. Derived, never set by
 * hand: it is the stalest model's date, so it cannot run ahead of any row.
 */
export const PRICING_LAST_CHECKED = oldestCheck(MODELS);

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
 * The last-checked date for a pricing block, rendered for a locale: the oldest
 * lastChecked among the models the block shows. Pass exactly those models.
 */
export function formatPricingDate(locale: string, models: readonly Model[]): string {
  return formatIsoDate(oldestCheck(models), locale);
}

/**
 * Any YYYY-MM-DD rendered for a locale. Built from the date parts rather than
 * Date.parse so the ISO string is not read as UTC midnight and shifted a day
 * backwards at build time.
 */
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
