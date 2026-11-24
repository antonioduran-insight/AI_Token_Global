/**
 * Single source of truth for the token calculator's estimation heuristic.
 *
 * The calculator's arithmetic (client script in token-calculator.astro) and the
 * ratios printed in its "Estimation Rules" card (calculator.rule2 in every
 * src/i18n/<lang>.json, via {zh}/{en}/{sym} placeholders) both read from here,
 * so the text a visitor reads can never disagree with the number it computes.
 */

export interface TokenRatios {
  /** Tokens per Chinese (CJK Unified Ideographs) character. */
  chineseChar: number;
  /** Tokens per English word. */
  englishWord: number;
  /** Tokens per digit, punctuation mark or other non-space symbol. */
  symbol: number;
}

export const TOKEN_RATIOS: TokenRatios = {
  chineseChar: 1.5,
  // The rest of the site says one token is roughly ¾ of an English word,
  // so one word is 4/3 ≈ 1.33 tokens.
  englishWord: 4 / 3,
  symbol: 0.3,
};

/** A ratio as the rules card prints it: at most two decimals, in the page's locale. */
export function formatRatio(value: number, locale: string): string {
  return value.toLocaleString(locale, { maximumFractionDigits: 2 });
}

/** Fill the {zh}/{en}/{sym} placeholders of a translated rule template. */
export function fillRatioTemplate(template: string, locale: string, ratios: TokenRatios = TOKEN_RATIOS): string {
  return template
    .replace('{zh}', formatRatio(ratios.chineseChar, locale))
    .replace('{en}', formatRatio(ratios.englishWord, locale))
    .replace('{sym}', formatRatio(ratios.symbol, locale));
}
