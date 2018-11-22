exports.up = function (knex, Promise) {
  return knex.schema.createTable('users', (table) => {
    table
      .increments('user_id')
      .primary()
      .notNullable();
    table.string('username').notNullable();
    table.string('avatar_url').notNullable();
    table.string('name').notNullable();
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('users');
};
