import 'bootstrap';
import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import runApp from './application.js';
import yupLocales from './locales/yupLocales.js';

const init = () => {
  const defaultLanguage = 'ru';

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
    loading: false,
    feeds: [],
    posts: [],
    seenPosts: [],
  };

  const elements = {
    form: document.querySelector('form.rss-form.text-body'),
    urlInput: document.getElementById('url-input'),
    formSubmit: document.querySelector('button[aria-label="add"]'),
    postsContainer: document.querySelector('div.posts'),
    feedsContainer: document.querySelector('div.feeds'),
    messageContainer: document.querySelector('p.feedback'),
    postModal: document.getElementById('postModal'),
  };

  const i18n = i18next.createInstance();
  return i18n.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  })
    .then(() => runApp(initialState, elements, i18n));
};

export default init;
