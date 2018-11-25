const commentsRouter = require('express').Router();
const { patchComment, deleteComment } = require('../controllers/comments');
const { handle405s } = require('../errors');
const { checkParam } = require('../utils/utils');

commentsRouter
  .param('comment_id', checkParam)
  .route('/:comment_id')
  .patch(patchComment)
  .delete(deleteComment)
  .all(handle405s);

module.exports = commentsRouter;
