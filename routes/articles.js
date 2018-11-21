const articlesRouter = require('express').Router();
const { welcomeMessage } = require('../controllers/general');

articlesRouter.route('/').get(welcomeMessage);

module.exports = articlesRouter;
