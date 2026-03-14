import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGE_CODES } from '../constants/language.constants';
import enLocale from '../locales/en.json';
import viLocale from '../locales/vi.json';
import { languageService } from '../services/language.service';

void i18n.use(initReactI18next).init({
  lng: languageService.getCurrentLanguage(),
  fallbackLng: LANGUAGE_CODES.vi,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    [LANGUAGE_CODES.vi]: {
      translation: viLocale,
    },
    [LANGUAGE_CODES.en]: {
      translation: enLocale,
    },
  },
});

export default i18n;
