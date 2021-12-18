const parse = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    const err = new Error('Resource does not contain valid RSS');
    err.errorPath = 'errors.rssError';
    throw err;
  }
  return doc;
};

export default parse;
