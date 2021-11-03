import i18n from 'i18next';
import uniqueId from 'lodash/uniqueId.js';

const mapping = {
  xml(data) {
    const parser = new DOMParser();
    return parser.parseFromString(data, 'application/xml');
  },
};

const parse = (data, type) => {
  const fn = mapping[type];
  if (typeof fn !== 'function') {
    throw new Error(
      `${i18n.t('errors.parserTypeError',
        { types: Object.keys(mapping).join(', ') })}`,
    );
  }

  const doc = fn(data);
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error(i18n.t('errors.rssError'));
  }

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

const parseNewPosts = (data, type, feedId, posts) => {
  const fn = mapping[type];
  if (typeof fn !== 'function') {
    throw new Error(
      `${i18n.t('errors.parserTypeError',
        { types: Object.keys(mapping).join(', ') })}`,
    );
  }

  const doc = fn(data);
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error(i18n.t('errors.rssError'));
  }

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

export { parse, parseNewPosts };