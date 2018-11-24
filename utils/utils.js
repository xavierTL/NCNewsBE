/* eslint "no-console" : 0 */

const validateTime = timeStamp => new Date(timeStamp);

exports.validateArticle = (rawArticle, rawUser) => rawArticle.reduce((validData, article) => {
  const {
    article_id, title, body, votes, topic, created_at,
  } = article;
  const correctTime = validateTime(created_at);
  const VARIABLE = rawUser.find(user => user.username === article.created_by).user_id;
  validData.push({
    article_id,
    title,
    body,
    votes,
    topic,
    user_id: VARIABLE,
    created_at: correctTime,
  });
  return validData;
}, []);

exports.validateComment = (rawArticle, rawUser, rawComments) => {
  const out = rawComments.reduce((validData, comment) => {
    const { body, created_at } = comment;
    const theUser = rawUser.find(user => user.username === comment.created_by).user_id;
    const theArticleID = rawArticle.find(article => article.title === comment.belongs_to)
      .article_id;
    const correctTime = validateTime(created_at);
    validData.push({
      user_id: theUser,
      article_id: theArticleID,
      created_at: correctTime,
      body,
    });
    return validData;
  }, []);
  return out;
};

exports.cl = (input) => {
  console.log(' ');
  console.log('--***----***----***----***----***----***----***----***--');
  console.log('-*****--*****--*****--*****--*****--*****--*****--*****-');
  console.log('***-******-******-******-******-******-******-******-***');
  console.log(' ');
  console.log('       ', input);
  console.log(' ');
  console.log('***-******-******-******-******-******-******-******-***');
  console.log('-*****--*****--*****--*****--*****--*****--*****--*****-');
  console.log('--***----***----***----***----***----***----***----***--');
  console.log(' ');
};

exports.checkParam = (req, res, next, endpoint) => {
  if (/^\d+$/.test(endpoint)) next();
  else next({ code: '22P02' });
};

exports.checkParamStr = (req, res, next, endpoint) => {
  if (/^\d+$/.test(endpoint)) next();
  else next({ code: '22P02' });
};
