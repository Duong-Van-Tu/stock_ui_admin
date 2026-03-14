import { useTranslation } from 'react-i18next';
import { languageService } from '../services/language.service';

export function useLanguage() {
  const { i18n, t } = useTranslation();

  const changeLanguage = async (language: string) => {
    await languageService.changeLanguage(language);
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    t,
  };
}
