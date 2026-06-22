// Single source of truth for the locales the SEO dashboard knows about.
//
// To add a new language to the dashboard (e.g., German `de`, French `fr`,
// Mandarin `zh`), edit the `SUPPORTED_LOCALES` array below — and that's it.
// The change automatically:
//
//   1. Widens the `Locale` type so TypeScript starts accepting the new code
//      anywhere a row's `locale` is read.
//   2. Adds a new filter chip to every section's locale filter (`LocaleFilter`
//      reads its options from this list).
//   3. Adds a column to the By Locale comparison grid (component iterates
//      `data.locales` which gets a new entry from the mock/real snapshot).
//
// You still have to (a) author mock rows in the new locale across the section
// snapshot files and (b) make sure your fetch script splits real GSC data by
// the new path prefix. But no component code edits are required.

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'id', label: 'Indonesia' },
  { code: 'vi', label: 'Tiếng Việt' },   
] as const;

/** Two-letter code union, derived from the constant above. */
export type Locale = (typeof SUPPORTED_LOCALES)[number]['code'];

/** Full display name lookup (e.g., 'en' → 'English'). */
export function localeLabel(code: Locale): string {
  return SUPPORTED_LOCALES.find((l) => l.code === code)?.label ?? code.toUpperCase();
}

/** Type guard — useful when accepting strings from JSON. */
export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.some((l) => l.code === value);
}
