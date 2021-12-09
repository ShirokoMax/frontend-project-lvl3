const mapping = {
  xml(data) {
    const parser = new DOMParser();
    return parser.parseFromString(data, 'application/xml');
  },
};

const parse = (data, type) => {
  const fn = mapping[type];
  if (typeof fn !== 'function') {
    const err = new Error('This data type is not supported');
    err.errorPath = 'errors.parserTypeError';
    throw err;
  }

  const doc = fn(data);
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    const err = new Error('Resource does not contain valid RSS');
    err.errorPath = 'errors.rssError';
    throw err;
  }
  return doc;
};

export default parse;
