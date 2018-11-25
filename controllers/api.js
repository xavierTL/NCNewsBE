const { map } = require('../utils/map');

const jMap = JSON.stringify(map);
const out = { map, jMap };

exports.getAPI = (req, res, next) => {
  res
    .status(200)
    .send(out)
    .catch(next);
};

exports.out = out;
