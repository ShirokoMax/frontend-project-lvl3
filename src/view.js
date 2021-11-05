import onChange from 'on-change';

const generatePostsHtml = (posts, seenPosts, i18n) => {
  const postsHtml = posts.map((post) => {
    const isSeen = seenPosts.find((item) => item === post.id) !== undefined;

    return `
    <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
      <a class="${isSeen === true ? 'fw-normal' : 'fw-bold'}" href="${post.link}"
      data-id="${post.id}" target="_blank" rel="noopener noreferrer">
        ${post.title}
      </a>
      <button class="btn btn-outline-primary btn-sm" type="button" data-id="${post.id}"
        data-bs-toggle="modal" data-bs-target="#postModal">${i18n.t('posts.view')}</button>
    </li>
    `;
  });

  const postsWrapper = `
  <div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">${i18n.t('posts.header')}</h2>
    </div>
  
    <ul class="list-group border-0 rounded-0">${postsHtml.join('')}</ul>
  </div>`;

  return postsWrapper;
};

const generateFeedsHtml = (feeds, i18n) => {
  const feedsHtml = feeds.map((feed) => `
  <li class="list-group-item border-0 border-end-0">
    <h3 class="h6 m-0">${feed.title}</h3>
    <p class="m-0 small text-black-50">${feed.description}</p>
  </li>
  `);

  const feedsWrapper = `
  <div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">${i18n.t('feeds.header')}</h2>
    </div>
    <ul class="list-group border-0 rounded-0">${feedsHtml.join('')}</ul>
  </div>`;

  return feedsWrapper;
};

export default (state, i18n, elements) => {
  const {
    form,
    urlInput,
    formSubmit,
    postsContainer,
    feedsContainer,
    messageContainer,
  } = elements;

  urlInput.focus();

  return onChange(state, (path, value) => {
    if (path === 'form.valid') {
      if (value === true) {
        urlInput.classList.remove('is-invalid');
      }
      if (value === false) {
        urlInput.classList.add('is-invalid');
      }
    }

    if (path === 'form.state') {
      switch (value) {
        case 'initial':
          break;

        case 'pending':
          messageContainer.textContent = '';
          urlInput.disabled = true;
          formSubmit.disabled = true;
          break;

        case 'fulfilled':
          form.reset();
          urlInput.disabled = false;
          formSubmit.disabled = false;
          urlInput.focus();
          messageContainer.classList.remove('text-danger');
          messageContainer.classList.add('text-success');
          messageContainer.textContent = i18n.t('notifications.successful');
          break;

        case 'error':
          urlInput.disabled = false;
          formSubmit.disabled = false;
          messageContainer.classList.remove('text-success');
          messageContainer.classList.add('text-danger');
          messageContainer.textContent = state.form.error;
          break;

        default:
          throw new Error(i18n.t('errors.unknownProcess', { process: value }));
      }
    }

    if (path === 'posts') {
      const { seenPosts } = onChange.target(state);
      const postsHtml = generatePostsHtml(value, seenPosts, i18n);
      postsContainer.innerHTML = postsHtml;
    }

    if (path === 'feeds') {
      const feedsHtml = generateFeedsHtml(value, i18n);
      feedsContainer.innerHTML = feedsHtml;
    }

    if (path === 'seenPosts') {
      const { posts } = onChange.target(state);
      const postsHtml = generatePostsHtml(posts, value, i18n);
      postsContainer.innerHTML = postsHtml;
    }
  });
};
