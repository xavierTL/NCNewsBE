const commentsRouter = require('express').Router();
const { welcomeMessage } = require('../controllers/general');

commentsRouter.route('/').get(welcomeMessage);

module.exports = commentsRouter;
