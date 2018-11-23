const connection = require('../db/connection');
const { cl } = require('../utils/utils');

exports.getArticles = (req, res, next) => {
  const {
    limit, sort_ascending, criteria, p,
  } = req.query;
  const sort = sort_ascending === 'true' ? 'asc' : 'desc';
  connection('articles')
    .select(
      'username AS author',
      'title',
      'articles.article_id',
      'topic',
      'articles.votes',
      'articles.created_at',
    )
    .limit(limit || 10)
    .orderBy(criteria || 'articles.created_at', sort)
    .offset(p || 0)
    .join('users', 'users.user_id', '=', 'articles.user_id')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .groupBy('articles.article_id', 'users.username')
    .count('comments.comment_id AS comment_count')
    .then((articles) => {
      res.status(200).send(articles);
    })
    .catch(next);
};

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  const {
    limit, sort_ascending, criteria, p,
  } = req.query;
  const sort = sort_ascending === 'true' ? 'asc' : 'desc';
  connection('articles')
    .select(
      'username AS author',
      'title',
      'articles.article_id',
      'topic',
      'articles.votes',
      'articles.created_at',
    )
    .limit(limit || 10)
    .orderBy(criteria || 'articles.created_at', sort)
    .offset(p || 0)
    .join('users', 'users.user_id', '=', 'articles.user_id')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .where('articles.article_id', '=', article_id)
    .groupBy('articles.article_id', 'users.username')
    .count('comments.comment_id AS comment_count')
    .then((article) => {
      if (article.length === 0) {
        return next({ status: 404 });
      }
      res.status(200).send(article);
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const { inc_votes } = req.body;
  if (inc_votes && typeof inc_votes !== 'number') {
    return next({ status: 400 });
  }
  const { article_id } = req.params;
  connection('articles')
    .where('article_id', '=', article_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then((updatedArticle) => {
      if (updatedArticle.length === 0) {
        return next({ status: 404 });
      }
      res.status(201).send(updatedArticle);
    })
    .catch(next);
};
exports.deleteArticle = (req, res, end) => {
  const { article_id } = req.params;
  connection('articles')
    .where('article_id', '=', article_id)
    .del()
    .then(() => {
      res.status(200).send({});
    });
};
