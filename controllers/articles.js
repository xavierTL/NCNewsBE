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

exports.getArticleById = (req, res, next) => {
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
    .then((articles) => {
      if (articles.length === 0) {
        return next({ status: 404 });
      }
      res.status(200).send(articles);
    })
    .catch(next);
};

exports.patchArticle = () => {};
