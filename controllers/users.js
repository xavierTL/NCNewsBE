const connection = require('../db/connection');

exports.getUsers = (req, res, next) => {
  connection('users')
    .select()
    .then(users => res.status(200).send(users))
    .catch(next);
};

exports.getUser = (req, res, next) => {
  const { username } = req.params;
  connection('users')
    .select()
    .where('username', '=', username)
    .then((user) => {
      if (user.length === 0) {
        return next({ status: 404 });
      }
      res.status(200).send({ user });
    });
};
