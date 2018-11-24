const usersRouter = require('express').Router();
const { handle405s } = require('../errors');
const { getUsers, getUser } = require('../controllers/users');

usersRouter
  .route('/')
  .get(getUsers)
  .all(handle405s);

usersRouter
  .route('/:username')
  .get(getUser)
  .all(handle405s);

// usersRouter.route('/').get(welcomeMessage);

module.exports = usersRouter;
