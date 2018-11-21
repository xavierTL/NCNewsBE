const topicsRouter = require('express').Router();
const { getAllTopics, postToTopics, getArticlesByTopic } = require('../controllers/topics');
const { handler405 } = require('../errors');

topicsRouter
  .route('/')
  .get(getAllTopics)
  .post(postToTopics)
  .all(handler405);

topicsRouter.route('/:topic/articles').get(getArticlesByTopic);

module.exports = topicsRouter;
