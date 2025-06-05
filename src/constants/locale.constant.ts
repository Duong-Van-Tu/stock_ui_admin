import enUS from 'antd/es/locale/en_US';
import viVN from 'antd/es/locale/vi_VN';
import frFR from 'antd/es/locale/fr_FR';

export enum Locale {
  EN = 'en'
  // VI = 'vi',
  // FR = 'fr'
}

export const locales: readonly Locale[] = Object.values(Locale);

export const antdLocales: Record<Locale, typeof enUS> = {
  [Locale.EN]: enUS
  // [Locale.VI]: viVN,
  // [Locale.FR]: frFR
};
