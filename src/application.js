import * as yup from 'yup';
import axios from 'axios';
import i18n from 'i18next';
import view from './view.js';
import parse from './parser.js';
import resources from './locales/index.js';

export default async () => {
  // const i18n = i18n.createInstance();
  await i18n.init({ // переделать на Промисы и then
    lng: 'ru',
    debug: false,
    returnObjects: true,
    resources: {
      ru: resources.ru,
    },
  });

  const state = view({
    form: {
      state: 'initial',
      valid: true,
      data: {
        url: '',
      },
      error: '',
    },
    feeds: [],
    posts: [],
  });

  yup.setLocale(i18n.t('validationErrors'));
  //  yup.setLocale(t('errors'));

  const schema = yup.string().url().required();

  const form = document.querySelector('form.rss-form.text-body');
  const urlInput = form.elements.url;

  const errorHandler = (err) => {
    state.form.valid = false;
    state.form.error = err.message;
    state.form.state = 'initial';
    state.form.state = 'error';
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = urlInput.value;

    schema.validate(url)
      .then((value) => {
        if (state.feeds.find((el) => el.url === value) !== undefined) {
          state.form.valid = false;
          state.form.error = i18n.t('errors.duplicate');
          state.form.state = 'error';
          throw new Error(i18n.t('errors.duplicate'));
        }

        state.form.valid = true;
        state.form.state = 'pending';
        state.form.data = value;
      })
      .then(() => { // argument = undefined
        axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`)
          .then((resp) => {
            if (resp.status === 200) {
              return resp.data;
            }
            throw new Error(i18n.t('errors.networkError', { code: resp.status }));
          })
          .then((data) => {
            const xmlData = parse(data.contents, 'xml');
            const { id, title, description } = xmlData;
            state.feeds.push({
              url,
              id,
              title,
              description,
            });

            const { posts } = xmlData;
            state.posts.push(...posts);
            state.form.state = 'fulfilled';
          })
          .catch((err) => {
            errorHandler(err);
          });
      })
      .catch((err) => {
        errorHandler(err);
      });
  });
};
