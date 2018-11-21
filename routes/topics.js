const topicsRouter = require("express").Router();

topicsRouter.route("/").get(getSOmething);

module.exports = topicsRouter;
