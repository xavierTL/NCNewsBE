const connection = require('../db/connection');
const { cl } = require('../utils/utils');
const { handle400s } = require('../errors');

exports.getAllTopics = (req, res, next) => {
  connection('topics')
    .select()
    .then((topics) => {
      res.send({ topics });
    })
    .catch(console.log);
};

exports.postToTopics = (req, res, next) => {
  bc('posting');
  connection('topics')
    .insert(req.body)
    .returning('*')
    .then((out) => {
      if (out[0]) {
        const posted = out[0];
        res.status(201).send({ posted });
      } else return Promise.reject({ status: 404 });
    })
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
  const {
    limit, sort_ascending, criteria, p,
  } = req.query;
  const sort = sort_ascending === 'true' ? 'asc' : 'desc';
  connection('articles')
    .select(
      'username AS author',
      'title',
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'topic',
    )
    .limit(limit || 10)
    .join('users', 'users.user_id', '=', 'articles.user_id')
    .join('comments', 'comments.article_id', '=', 'articles.article_id')
    .where('topic', '=', topic)
    .groupBy('articles.article_id', 'users.username')
    .count('articles.article_id AS comment_count')
    .orderBy(criteria || 'articles.created_at', sort)
    .offset(p || 0)
    .then((articles) => {
      res.send(articles);
    })
    .catch(console.log);
};
