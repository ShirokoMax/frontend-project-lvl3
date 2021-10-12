import * as yup from 'yup';
import onChange from 'on-change';

export default () => { // Вынесите слой View (тот, где вотчеры) в отдельный файл.
  const schema = yup.string().url();
  
  const form = document.querySelector('form.rss-form.text-body');
  const urlInput = form.elements['url'];

  urlInput.focus(); // Может по-другому сделать?

  const state = onChange({
    form: {
      state: 'valid',
      data: {
        url: '',
      },
    },
    feeds: [],
  }, (path, value, previousValue) => {
    if (path === 'form.state') {
      switch (value) {
        case 'valid':
          urlInput.classList.remove('is-invalid');
          break;
  
        case 'invalid':
          urlInput.classList.add('is-invalid');
          break;
      
        default:
          break;
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const url = urlInput.value;

    schema.validate(url)
      .then((value) => {
        if (state.feeds.indexOf(value) !== -1) {
          throw new Error('DUBL!!!!'); // ___!!!___ ДОПИЛИТЬ СООБЩЕНИЕ ОШИБКИ!!!!!
        }

        form.reset(); // Это точно должно быть тут, а не в контроллере?
        urlInput.focus(); // Это точно должно быть тут, а не в контроллере?

        state.form.state = 'valid';
        state.form.data = value;
        state.feeds.push(value);  
      })
      .catch((err) => {
        state.form.state = 'invalid';
        console.log(err);
      });

  });
};
