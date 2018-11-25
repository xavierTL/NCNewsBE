const apiRouter = require('express').Router();
const topicsRouter = require('./topics');
const articlesRouter = require('./articles');
const commentsRouter = require('./comments');
const usersRouter = require('./users');
const { getAPI } = require('../controllers/api');
const { handle405s } = require('../errors');

apiRouter
  .route('/')
  .get(getAPI)
  .all(handle405s);

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/*', (req, res, next) => {
  next({ status: 404 });
});
module.exports = apiRouter;
