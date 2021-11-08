export default {
  translation: {
    notifications: {
      successful: 'RSS успешно загружен',
    },
    posts: {
      header: 'Посты',
      view: 'Просмотр',
    },
    feeds: {
      header: 'Фиды',
    },
    errors: {
      unknownProcess: 'Неизвестное состояние процесса: {{process}}',
      networkError: 'Сетевой ответ был неудовлетворительным. Код статуса: {{code}}',
      requestError: 'Ошибка сети',
      parserTypeError: 'Данный тип данных не поддерживается. Укажите один из следующих типов: {{types}}',
      rssError: 'Ресурс не содержит валидный RSS',
    },
    validationErrors: {
      string: {
        default: 'Недействительно',
        url: 'Ссылка должна быть валидным URL',
      },
      mixed: {
        required: 'Это обязательное поле',
        notOneOf: 'RSS уже существует',
      },
    },
  },
};
