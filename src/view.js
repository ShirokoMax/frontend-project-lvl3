import onChange from 'on-change';

const generatePostsHtml = (posts, seenPosts, i18n) => {
  const postsHtml = posts.map((post) => {
    const isSeen = seenPosts.find((item) => item === post.id) !== undefined;

    return `
    <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
      <a class="${isSeen ? 'fw-normal' : 'fw-bold'}" href="${post.link}"
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

export default (state, elements, i18n) => {
  const {
    form,
    urlInput,
    formSubmit,
    postsContainer,
    feedsContainer,
    messageContainer,
    modalTitle,
    modalDesc,
    modalLink,
  } = elements;

  urlInput.focus();

  return onChange(state, (path, value) => {
    if (path === 'form.valid') {
      if (value) {
        urlInput.classList.remove('is-invalid');
      } else {
        urlInput.classList.add('is-invalid');
      }
    }

    if (path === 'form.state') {
      let err;

      switch (value) {
        case 'initial':
          break;

        case 'pending':
          messageContainer.textContent = '';
          urlInput.readOnly = true;
          formSubmit.disabled = true;
          break;

        case 'fulfilled':
          form.reset();
          urlInput.readOnly = false;
          formSubmit.disabled = false;
          urlInput.focus();
          messageContainer.classList.remove('text-danger');
          messageContainer.classList.add('text-success');
          messageContainer.textContent = i18n.t('notifications.successful');
          break;

        case 'error': {
          urlInput.readOnly = false;
          formSubmit.disabled = false;
          messageContainer.classList.remove('text-success');
          messageContainer.classList.add('text-danger');

          const { error } = state.form;
          let errorPath;
          switch (error.errorType) {
            case 'Network Error':
              errorPath = 'errors.networkError';
              break;
            case 'Validation Error':
              errorPath = error.message;
              break;
            case 'RSS Error':
              errorPath = 'errors.rssError';
              break;
            default:
              errorPath = 'errors.unknownError';
          }
          messageContainer.textContent = i18n.t(errorPath);
          break;
        }

        default:
          err = new Error('Unknown process state');
          err.errorType = 'Unknown Process Error';
          throw err;
      }
    }

    if (path === 'posts') {
      const { seenPosts } = state;
      const postsHtml = generatePostsHtml(value, seenPosts, i18n);
      postsContainer.innerHTML = postsHtml;
    }

    if (path === 'feeds') {
      const feedsHtml = generateFeedsHtml(value, i18n);
      feedsContainer.innerHTML = feedsHtml;
    }

    if (path === 'seenPosts') {
      const { posts } = state;
      const postsHtml = generatePostsHtml(posts, value, i18n);
      postsContainer.innerHTML = postsHtml;
    }

    if (path === 'openedPostId') {
      const { posts } = state;
      const post = posts.find((item) => item.id === value);
      const postTitle = post.title;
      const postDescription = post.description;
      const postLink = post.link;

      modalTitle.textContent = postTitle;
      modalDesc.textContent = postDescription;
      modalLink.href = postLink;
    }
  });
};
