import { TRANSLATIONS, SupportedLocale } from './translations';

export interface ValidationReport {
  locale: SupportedLocale;
  missingCount: number;
  extraCount: number;
  missingKeys: string[];
  extraKeys: string[];
}

export function validateTranslations(): Record<SupportedLocale, ValidationReport> {
  const englishKeys = Object.keys(TRANSLATIONS.en || {});
  const locales: SupportedLocale[] = ['en', 'te', 'hi', 'kn', 'ta', 'ml', 'mr', 'bn'];
  const reports: Partial<Record<SupportedLocale, ValidationReport>> = {};

  locales.forEach((locale) => {
    const localeDict = TRANSLATIONS[locale] || {};
    const localeKeys = Object.keys(localeDict);

    const missingKeys = englishKeys.filter((key) => !localeKeys.includes(key));
    const extraKeys = localeKeys.filter((key) => !englishKeys.includes(key));

    reports[locale] = {
      locale,
      missingCount: missingKeys.length,
      extraCount: extraKeys.length,
      missingKeys,
      extraKeys,
    };
  });

  return reports as Record<SupportedLocale, ValidationReport>;
}

export function printTranslationValidationReport(): boolean {
  const reports = validateTranslations();
  let allValid = true;

  console.log('\n==================================================');
  console.log('🌐 FARM SEVA 8-LOCALE TRANSLATION VALIDATION REPORT');
  console.log('==================================================');

  Object.values(reports).forEach((report) => {
    const isClean = report.missingCount === 0 && report.extraCount === 0;
    if (!isClean) allValid = false;

    console.log(
      `Locale: ${report.locale.padEnd(4)} | Missing: ${String(report.missingCount).padStart(3)} | Extra: ${String(report.extraCount).padStart(3)} | ${isClean ? '✅ PASS' : '❌ FAIL'}`
    );

    if (report.missingKeys.length > 0) {
      console.log(`   └─ Missing Keys (${report.missingKeys.length}): ${report.missingKeys.slice(0, 5).join(', ')}${report.missingKeys.length > 5 ? '...' : ''}`);
    }
  });

  console.log('==================================================\n');
  return allValid;
}
