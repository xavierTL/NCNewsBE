const { articleData, userData, topicData, commentData } =
  process.env.NODE_ENV === "test"
    ? require("../db/data/test-data")
    : require("../db/data/development-data");

//require("../db/data/development-data");

exports.seed = function(knex, Promise) {
  return knex("topics")
    .del()
    .then(function() {
      return knex("topics").insert(topicData);
    })
    .then(function() {
      return knex("users")
        .insert(userData)
        .returning("*");
    })
    .then(function(userOut) {
      const validArticleData = validateArticle(articleData, userOut);
      return Promise.all([
        knex("articles")
          .insert(validArticleData)
          .returning("*"),
        userOut
      ]);
    })
    .then(function([articleOut, userOut]) {
      const validCommentData = validateComment(
        articleOut,
        userOut,
        commentData
      );
      return knex("comments")
        .insert(validCommentData)
        .returning("*");
    })
    .catch(console.log);
};
