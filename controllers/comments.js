const connection = require('../db/connection');

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const {
    limit, sort_ascending, criteria, p,
  } = req.query;
  const sort = sort_ascending === 'true' ? 'asc' : 'desc';
  connection('comments')
    .select('comment_id', 'votes', 'created_at', 'username AS author', 'body')
    .join('users', 'users.user_id', '=', 'comments.user_id')
    .limit(limit || 10)
    .offset(p || 0)
    .orderBy(criteria || 'comments.created_at', sort)
    .where('comments.article_id', '=', article_id)
    .then((body) => {
      if (body.length === 0) {
        return next({ status: 404 });
      }
      res.status(200).send({ body });
    })
    .catch(next);
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;
  body.article_id = article_id;
  connection('comments')
    .insert(body)
    .returning('*')
    .then((body) => {
      if (body.length === 0) {
        return next({ status: 404 });
      }
      res.status(201).send({ body });
    })
    .catch(next);
};

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  if (typeof inc_votes !== 'number') {
    next({ status: 400 });
  }
  connection('comments')
    .where('comment_id', '=', comment_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then((updatedComment) => {
      if (updatedComment.length === 0) {
        return next({ status: 404 });
      }
      res.status(200).send({ updatedComment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  connection('comments')
    .where('comment_id', '=', comment_id)
    .del()
    .returning('*')
    .then((response) => {
      if (response.length === 0) {
        return next({ status: 404 });
      }
      res.status(204).send({});
    })
    .catch(next);
};
