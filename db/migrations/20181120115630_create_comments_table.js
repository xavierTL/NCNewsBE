exports.up = function (knex, Promise) {
  return knex.schema.createTable('comments', (table) => {
    table
      .increments('comment_id')
      .primary()
      .notNullable();
    table.integer('user_id').references('users.user_id');
    table
      .integer('article_id')
      .references('articles.article_id')
      .onDelete('CASCADE');
    table
      .integer('votes')
      .defaultTo(0)
      .notNullable();
    table.timestamp('created_at', 6).defaultTo(knex.fn.now(6));
    table.text('body').notNullable();
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('comments');
};
