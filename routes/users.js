const usersRouter = require('express').Router();
const { welcomeMessage } = require('../controllers/general');

usersRouter.route('/').get(welcomeMessage);

module.exports = usersRouter;
