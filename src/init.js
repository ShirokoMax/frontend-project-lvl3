import 'bootstrap';
import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import runApp from './application.js';

const init = () => {
  const language = 'ru';

  const yupLocales = resources[language].translation.validationErrors;
  yup.setLocale(yupLocales);

  const i18n = i18next.createInstance();
  return i18n.init({
    lng: language,
    debug: false,
    resources: {
      ru: resources.ru,
    },
  })
    .then(() => runApp(i18n))
};

export default init;
