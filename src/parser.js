const mapping = {
  xml(data) {
    const parser = new DOMParser();
    return parser.parseFromString(data, 'application/xml');
  },
};

const parse = (data, type) => {
  const fn = mapping[type];
  if (typeof fn !== 'function') {
    throw new Error('errors.parserTypeError');
  }

  const doc = fn(data);
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('errors.rssError');
  }
  return doc;
};

export default parse;
