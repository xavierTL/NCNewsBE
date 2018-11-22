const articlesRouter = require('express').Router();
const { getArticles, getArticleById, patchArticle } = require('../controllers/articles');
const { handle405s } = require('../errors');

articlesRouter
  .route('/')
  .get(getArticles)
  .all(handle405s);

articlesRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(patchArticle)
  .all(handle405s);

module.exports = articlesRouter;
