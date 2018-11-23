const articlesRouter = require('express').Router();
const {
  getArticles, getArticle, patchArticle, deleteArticle,
} = require('../controllers/articles');
const {
  getCommentsByArticleId,
  postCommentByArticleId,
  patchComment,
  deleteComment,
} = require('../controllers/comments');
const { handle405s } = require('../errors');
const { checkParam } = require('../utils/utils');

articlesRouter
  .route('/')
  .get(getArticles)
  .all(handle405s);

articlesRouter
  .route('/:article_id')
  .get(getArticle)
  .patch(patchArticle)
  .delete(deleteArticle)
  .all(handle405s);

articlesRouter
  .param('article_id', checkParam)
  .route('/:article_id/comments')
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId)
  .all(handle405s);

articlesRouter
  .route('/:article_id/comments/:comment_id')
  .patch(patchComment)
  .delete(deleteComment);

module.exports = articlesRouter;
