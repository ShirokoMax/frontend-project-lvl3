const parse = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'application/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    const err = new Error('Resource does not contain valid RSS');
    err.errorType = 'RSS Error';
    throw err;
  }
  return doc;
};

export default parse;
