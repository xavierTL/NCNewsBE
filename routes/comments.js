const commentsRouter = require("express").Router();

commentsRouter.route("/").get(getSomething);

module.exports = commentsRouter;
