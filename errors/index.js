exports.handle400s = (err, req, res, next) => {
  if (err.status === 400) {
    res.status(400).send({ msg: 'invalid input syntax for data type' });
  }
  const codesRef400 = {
    23502: 'null value in column violates not-null constraint',
    '22P02': 'invalid input syntax for data type',
  };
  if (codesRef400[err.code] || err.status === 400) {
    res.status(400).send({ msg: codesRef400[err.code] });
  } else next(err);
};

exports.handle404s = (err, req, res, next) => {
  if (err.status === 404 || err.code === '23503') {
    res.status(404).send({ msg: 'silly! no pages here' });
  } else {
    next(err);
  }
};

exports.handle405s = (req, res, next) => {
  res.status(405).send({ msg: 'method not allowed' });
};
