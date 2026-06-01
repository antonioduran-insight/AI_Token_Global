// Central definitions for every SEO term that appears in the dashboard UI.
//
// Components hover-show these via <InfoTooltip term="…" />.
// Keep definitions plain-language — the readers are editors and writers,
// not SEO specialists. Avoid jargon, and when jargon is unavoidable,
// define it inline ("CTR — click-through rate, i.e., clicks ÷ impressions").

export const GLOSSARY = {
  clicks:
    'How many times someone clicked through to your site from a Google search result. Each click counts once even if the same person clicks repeatedly.',
  impressions:
    'How many times any of your pages appeared in a Google search result — whether or not the searcher clicked.',
  ctr:
    'Click-Through Rate. Clicks ÷ Impressions. The percent of people who saw your page in Google results and clicked it. Industry averages: position 1 ≈ 28%, position 5 ≈ 7%, position 10 ≈ 2.5%.',
  position:
    'Where your page ranked in Google search results on average during the window. 1 = top of page 1. Lower numbers are better. Anything past 10 is on page 2 or deeper, where almost no one clicks.',
  avgPosition:
    'Average organic search position across the window. 1 = top of page 1; lower is better. Past 10 = page 2 or deeper.',
  query:
    'The exact text someone typed into Google before clicking through to your site.',
  page:
    'The URL on your site that appeared in Google search results.',
  locale:
    'Language version of the page (EN = English, ES = Spanish, ID = Indonesian). Determined by the URL path prefix (/en, /es, /id).',
  strikingDistance:
    'Queries you already rank for on page 2 of Google (positions 11–20). A modest content refresh can push them onto page 1, where click-through rates are 3–5× higher. The highest-leverage editorial work on a content site.',
  potentialAtPosition1:
    'Estimated clicks the query would earn if it reached position 1 in Google, calculated as impressions × 28% (industry-typical CTR for position 1).',
  potentialGain:
    'Estimated extra clicks per window if the query moved from its current position to position 1. Potential at position 1, minus current clicks.',
  expectedCtr:
    'The CTR your page should have at its current rank, based on industry-standard "CTR by position" curves. If your actual CTR is below this, the page is underperforming for its rank.',
  shortfall:
    'How far below expected CTR your actual CTR is, as a percentage of expected. A −60% shortfall means you\'re getting 40% of the clicks a typical page at this position would get.',
  ctrGainAtTypical:
    'Estimated extra clicks per window if your page\'s CTR matched the position-typical curve. The action to capture this is rewriting the title tag and meta description — not improving rank.',
  shareOfTotal:
    'This locale\'s share of total clicks (or impressions) across the whole site. Helps decide where to invest content time.',
  wow:
    'Week-over-week (or window-over-window): change vs. the previous period of the same length.',
  topQueryByLocale:
    'The single highest-traffic query for this locale during the window.',
  topPageByLocale:
    'The single highest-traffic page (by clicks) for this locale during the window.',
} as const;

export type GlossaryTerm = keyof typeof GLOSSARY;

/** Safe lookup. Returns the description if found, else null. */
export function glossaryLookup(term: string): string | null {
  return (GLOSSARY as Record<string, string>)[term] ?? null;
}
