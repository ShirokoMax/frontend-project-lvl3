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
    const postLink = item.querySelector('link');
    const postId = uniqueId('post_');
    return {
      id: postId,
      feedId,
      title: postTitle.textContent,
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

export default parse;
