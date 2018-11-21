const usersRouter = require("express").Router();

usersRouter.route("/").get(getSOmething);

module.exports = usersRouter;
