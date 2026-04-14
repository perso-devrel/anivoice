import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './ko';
import en from './en';
import ja from './ja';
import zh from './zh';

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
    ja: { translation: ja },
    zh: { translation: zh },
  },
  lng: 'ko',
  fallbackLng: 'ko',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
