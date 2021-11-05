import * as yup from 'yup';
import axios from 'axios';
import onChange from 'on-change';
import view from './view.js';
import { parse, parseNewPosts } from './parser.js';

export default (i18n) => {
  const state = view({
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
  }, i18n);

  const errorHandler = (err) => {
    state.form.valid = false;
    state.form.error = err.message;
    state.form.state = 'initial';
    state.form.state = 'error';
  };

  const postsUpdateFrequency = 5000;

  const getNewPosts = () => {
    const existedFeeds = onChange.target(state).feeds;
    const existedPosts = onChange.target(state).posts;

    existedFeeds.forEach((feed) => {
      const { url } = feed;
      axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then((resp) => {
          if (resp.status === 200) {
            return resp.data;
          }
          throw new Error(i18n.t('errors.networkError', { code: resp.status }));
        })
        .then((data) => {
          const xmlDataOfNewPosts = parseNewPosts(data.contents, 'xml', feed.id, existedPosts, i18n);

          const { posts } = xmlDataOfNewPosts;
          state.posts.push(...posts);
        })
        .catch(() => {
          const requestError = new Error(i18n.t('errors.requestError'));
          errorHandler(requestError);
        });
    });

    setTimeout(() => {
      getNewPosts();
    }, postsUpdateFrequency);
  };

  const schema = yup.string().url().required();

  const form = document.querySelector('form.rss-form.text-body');
  const urlInput = document.getElementById('url-input');
  const postsContainer = document.querySelector('div.posts');
  const postModal = document.getElementById('postModal');

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
            const xmlData = parse(data.contents, 'xml', i18n);
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
          .then(() => {
            const isRefreshing = onChange.target(state).refreshing;
            if (isRefreshing === false) {
              state.refreshing = true;
              setTimeout(() => {
                getNewPosts();
              }, postsUpdateFrequency);
            }
          })
          .catch(() => {
            const requestError = new Error(i18n.t('errors.requestError'));
            errorHandler(requestError);
          });
      })
      .catch((err) => {
        errorHandler(err);
      });
  });

  postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (id) {
      state.seenPosts.push(id);
    }
  });

  postModal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;

    const postEl = button.closest('li.list-group-item');
    const anchorEl = postEl.querySelector('a');
    const postId = anchorEl.dataset.id;

    const { posts } = onChange.target(state);
    const post = posts.find((item) => item.id === postId);
    const postTitle = post.title;
    const postDescription = post.description;
    const postLink = post.link;

    const modalTitle = postModal.querySelector('#postModalLabel');
    const modalDesc = postModal.querySelector('div.modal-body');
    const modalLink = postModal.querySelector('a.full-article');

    modalTitle.textContent = postTitle;
    modalDesc.textContent = postDescription;
    modalLink.href = postLink;
  });
};
