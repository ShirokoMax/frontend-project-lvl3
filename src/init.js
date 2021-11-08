import 'bootstrap';
import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import runApp from './application.js';

const init = () => {
  const defaultLanguage = 'ru';

  const yupLocales = resources[defaultLanguage].translation.validationErrors;
  yup.setLocale(yupLocales);

  const initialState = {
    form: {
      state: 'initial',
      valid: true,
      data: {
        url: '',
      },
      error: '',
    },
    refreshing: false,
    feeds: [],
    posts: [],
    seenPosts: [],
  };

  const i18n = i18next.createInstance();
  return i18n.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  })
    .then(() => runApp(initialState, i18n));
};

export default init;
