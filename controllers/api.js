const { map } = require('../utils/map');

const out = { map };

exports.getAPI = (req, res, next) => {
  res
    .status(200)
    .send(out)
    .catch(next);
};

exports.out = out;
