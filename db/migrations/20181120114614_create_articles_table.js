exports.up = function (knex, Promise) {
  return knex.schema.createTable('articles', (table) => {
    table
      .increments('article_id')
      .primary()
      .notNullable();
    table.string('title').notNullable();
    table.text('body').notNullable();
    table
      .integer('votes')
      .defaultTo(0)
      .notNullable();
    table
      .string('topic')
      .references('slug')
      .inTable('topics');
    table
      .integer('user_id')
      .references('user_id')
      .inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('articles');
};
