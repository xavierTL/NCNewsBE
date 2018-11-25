const { jsonMap } = require('../utils/map');

exports.getAPI = (req, res, next) => {
  res
    .status(200)
    .send(jsonMap)
    .catch(next);
};
