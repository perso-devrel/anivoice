export const SUPPORTED_LANGUAGES = [
  { key: 'ja', flag: '🇯🇵' },
  { key: 'ko', flag: '🇰🇷' },
  { key: 'en', flag: '🇺🇸' },
  { key: 'es', flag: '🇪🇸' },
  { key: 'pt', flag: '🇧🇷' },
  { key: 'id', flag: '🇮🇩' },
  { key: 'ar', flag: '🇸🇦' },
] as const;

export const LANGUAGE_KEYS = SUPPORTED_LANGUAGES.map((l) => l.key);
