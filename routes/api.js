const apiRouter = require("express").Router();
const { topicsRouter } = require("./topics");
const { articlesRouter } = require("./topics");
const { commentsRouter } = require("./topics");
const { usersRouter } = require("./topics");

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);
