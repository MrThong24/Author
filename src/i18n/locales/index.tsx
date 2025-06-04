import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import viCustomer from './vi/customer.json';
import enCustomer from './en/customer.json';
import { LanguageCode } from 'src/shared/common/enum';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { customer: viCustomer },
      en: { customer: enCustomer }
    },
    fallbackLng: LanguageCode.VIETNAMESE,
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
