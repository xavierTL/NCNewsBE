const connection = require('../db/connection');

exports.getAllTopics = (req, res, next) => {
  connection('topics')
    .select()
    .then((topics) => {
      res.send({ topics });
    })
    .catch(next);
};

exports.postToTopics = (req, res, next) => {
  connection('topics')
    .insert(req.body)
    .returning('*')
    .then((body) => {
      res.status(201).send(body);
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
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .where('topic', '=', topic)
    .groupBy('articles.article_id', 'users.username')
    .count('comments.comment_id AS comment_count')
    .orderBy(criteria || 'articles.created_at', sort)
    .offset(p || 0)
    .then((articles) => {
      if (articles.length === 0) {
        return next({ status: 404 });
      }
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.postArticleByTopic = (req, res, next) => {
  req.body.topic = req.params.topic;
  connection('articles')
    .insert(req.body)
    .returning('*')
    .then(([postedData]) => {
      res.status(201).send({ postedData });
    })
    .catch(next);
};
