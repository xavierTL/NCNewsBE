const map = {
  '/api': {
    GET: 'return this map',
    '/topics': {
      GET: 'all topics',
      POST: 'new topic',
      '/:topic/articles': {
        GET: 'all articles by :topic',
        POST: 'new article by :topic',
      },
    },
    '/articles': {
      GET: 'all articles',
      '/:article_id': {
        GET: 'article by :article_id',
        PATCH: 'increment article votes',
        DELETE: 'deletes article by :article_id',
        '/comments': {
          GET: 'get all comments for :article_id',
          POST: 'add comment',
        },
      },
    },
    '/comments': {
      PATCH: 'increment comment votes',
      DELETE: 'deletes comment',
    },
    '/users': { GET: 'all users', '/:username': { GET: 'user' } },
  },
};

exports.jsonMap = JSON.stringify(map);
