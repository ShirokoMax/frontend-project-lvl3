import * as yup from 'yup';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import view from './view.js';
import parse from './parser.js';

const postsUpdateFrequency = 5000;

const getProxiedUrl = (url) => {
  const corsProxy = 'https://hexlet-allorigins.herokuapp.com';
  const corsProxyApi = `${corsProxy}/get?disableCache=true&url=`;
  return new URL(`${corsProxyApi}${url}`);
};

const getFeedData = (doc) => {
  const feedTitle = doc.querySelector('channel > title');
  const feedDescription = doc.querySelector('channel > description');
  const feedId = uniqueId('feed_');
  const itemsCollection = doc.querySelectorAll('item');
  const itemsArray = Array.from(itemsCollection);

  const items = itemsArray.map((item) => {
    const postTitle = item.querySelector('title');
    const postDescription = item.querySelector('description');
    const postLink = item.querySelector('link');
    const postId = uniqueId('post_');
    return {
      id: postId,
      feedId,
      title: postTitle.textContent,
      description: postDescription.textContent,
      link: postLink.textContent,
    };
  });

  return {
    id: feedId,
    title: feedTitle.textContent,
    description: feedDescription.textContent,
    posts: items,
  };
};

const getNewPostsData = (doc, feedId, posts) => {
  const feedPosts = posts.filter((item) => item.feedId === feedId);

  const itemsCollection = doc.querySelectorAll('item');
  const itemsArray = Array.from(itemsCollection);

  const newPosts = [];

  itemsArray.forEach((item) => {
    const postTitle = item.querySelector('title');

    const findedPost = feedPosts.find((feedPost) => feedPost.title === postTitle.textContent);
    if (findedPost === undefined) {
      const postDescription = item.querySelector('description');
      const postLink = item.querySelector('link');
      const postId = uniqueId('post_');
      newPosts.push({
        id: postId,
        feedId,
        title: postTitle.textContent,
        description: postDescription.textContent,
        link: postLink.textContent,
      });
    }
  });

  return {
    posts: newPosts,
  };
};

export default (initialState, elements, i18n) => {
  const state = view(initialState, elements, i18n);

  const errorHandler = (err) => {
    state.form.valid = false;
    state.form.error = err.errorPath;
    state.form.state = 'initial';
    state.form.state = 'error';
    console.error(err);
  };

  const getNewPosts = () => {
    const existedFeeds = state.feeds;
    const existedPosts = state.posts;

    existedFeeds.forEach((feed) => {
      const { url } = feed;
      axios.get(getProxiedUrl(url))
        .then(({ data }) => {
          const xmlData = parse(data.contents, 'xml');
          const dataOfNewPosts = getNewPostsData(xmlData, feed.id, existedPosts);

          const { posts } = dataOfNewPosts;
          state.posts.push(...posts);
        });
    });
  };

  const addNewFeed = (url, schema) => schema.validate(url)
    .then((value) => {
      state.form.valid = true;
      state.form.state = 'pending';
      state.form.data = value;
      axios.get(getProxiedUrl(url))
        .then(({ data }) => {
          const xmlData = parse(data.contents, 'xml');
          const feedData = getFeedData(xmlData);
          const { id, title, description } = feedData;
          state.feeds.push({
            url,
            id,
            title,
            description,
          });

          const { posts } = feedData;
          state.posts.push(...posts);
          state.form.state = 'fulfilled';
        })
        .then(() => {
          const isLoading = state.loading;
          if (isLoading === false) {
            state.loading = true;
            setInterval(() => {
              getNewPosts();
            }, postsUpdateFrequency);
          }
        })
        .catch((err) => {
          if (axios.isAxiosError(err)) {
            const modifiedErr = err;
            modifiedErr.errorPath = 'errors.networkError';
            errorHandler(modifiedErr);
          } else {
            errorHandler(err);
          }
        });
    });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.urlInput.value;

    const feedsUrls = state.feeds.map((feed) => feed.url);
    const schema = yup.string().url().required().notOneOf(feedsUrls);

    addNewFeed(url, schema)
      .catch((err) => {
        if (err.name === 'ValidationError') {
          const modifiedErr = err;
          modifiedErr.errorPath = err.message;
          errorHandler(err);
        } else {
          errorHandler(err);
        }
      });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (id) {
      state.seenPosts.push(id);
    }
  });

  elements.postModal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;

    const postEl = button.closest('li.list-group-item');
    const anchorEl = postEl.querySelector('a');
    const postId = anchorEl.dataset.id;

    const { posts } = state;
    const post = posts.find((item) => item.id === postId);
    const postTitle = post.title;
    const postDescription = post.description;
    const postLink = post.link;

    const modalTitle = elements.postModal.querySelector('#postModalLabel');
    const modalDesc = elements.postModal.querySelector('div.modal-body');
    const modalLink = elements.postModal.querySelector('a.full-article');

    modalTitle.textContent = postTitle;
    modalDesc.textContent = postDescription;
    modalLink.href = postLink;
  });
};
