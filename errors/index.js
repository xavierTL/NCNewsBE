exports.handle400s = (err, req, res, next) => {
  const codesRef400 = { 23502: 'null value in column "slug" violates not-null constraint' };
  if (codesRef400[err.code]) {
    res.status(400).send({ msg: codesRef400[err.code] });
  } else next(err);
};

exports.handler405 = (err, req, res, next) => {};

// exports.handle
