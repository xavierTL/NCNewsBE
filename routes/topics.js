const topicsRouter = require('express').Router();
const {
  getAllTopics,
  postToTopics,
  getArticlesByTopic,
  postArticleByTopic,
} = require('../controllers/topics');
const { handle405s } = require('../errors');

topicsRouter
  .route('/')
  .get(getAllTopics)
  .post(postToTopics)
  .all(handle405s);

topicsRouter
  .route('/:topic/articles')
  .get(getArticlesByTopic)
  .post(postArticleByTopic)
  .all(handle405s);

module.exports = topicsRouter;
