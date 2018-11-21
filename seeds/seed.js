const {
  articleData, userData, topicData, commentData,
} = require('../db/data');

const { validateArticle, validateComment } = require('../utils/utils');

exports.seed = function (knex, Promise) {
  return knex('topics')
    .del()
    .then(() => knex('topics').insert(topicData))
    .then(() => knex('users')
      .insert(userData)
      .returning('*'))
    .then((userOut) => {
      const validArticleData = validateArticle(articleData, userOut);
      return Promise.all([
        knex('articles')
          .insert(validArticleData)
          .returning('*'),
        userOut,
      ]);
    })
    .then(([articleOut, userOut]) => {
      const validCommentData = validateComment(articleOut, userOut, commentData);
      return knex('comments')
        .insert(validCommentData)
        .returning('*');
    })
    .catch();
};
