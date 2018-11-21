/* eslint "no-console" : 0 */

exports.up = function (knex, Promise) {
  console.log('creating topics...');
  return knex.schema.createTable('topics', (table) => {
    table
      .string('slug')
      .primary()
      .unique()
      .notNullable();
    table.string('description').notNullable();
  });
};

exports.down = function (knex, Promise) {
  console.log('dropping topics table...');
  return knex.schema.dropTable('topics');
};
