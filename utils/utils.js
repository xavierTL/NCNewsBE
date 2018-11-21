exports.validateArticle = (rawArticle, rawUser) => {
  return rawArticle.reduce((validData, article) => {
    const { article_id, title, body, votes, topic, created_at } = article;
    const correctTime = validateTime(created_at);
    const VARIABLE = rawUser.find(user => user.username === article.created_by)
      .user_id;
    validData.push({
      article_id,
      title,
      body,
      votes,
      topic,
      user_id: VARIABLE,
      created_at: correctTime
    });
    return validData;
  }, []);
};

const validateTime = timeStamp => {
  return new Date(timeStamp);
};

exports.validateComment = (rawArticle, rawUser, rawComments) => {
  const out = rawComments.reduce((validData, comment) => {
    const { body, created_at } = comment;
    const theUser = rawUser.find(user => user.username === comment.created_by)
      .user_id;
    const theArticleID = rawArticle.find(
      article => article.title === comment.belongs_to
    ).article_id;
    const correctTime = validateTime(created_at);
    validData.push({
      user_id: theUser,
      article_id: theArticleID,
      created_at: correctTime,
      body
    });
    return validData;
  }, []);
  return out;
};
