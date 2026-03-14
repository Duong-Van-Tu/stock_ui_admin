import i18n from 'i18next';
import { LANGUAGE_CODES, LANGUAGE_STORAGE_KEYS } from '../constants/language.constants';

export const languageService = {
  getCurrentLanguage() {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEYS.currentLanguage) || LANGUAGE_CODES.vi;
  },
  async changeLanguage(language: string) {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEYS.currentLanguage, language);
    await i18n.changeLanguage(language);
  },
};
