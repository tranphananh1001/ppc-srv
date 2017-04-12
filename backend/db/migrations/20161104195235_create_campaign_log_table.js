
// migration for cammpaign log table
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('campaigns_log', function(table) {
  	table.increments();
  	table.bigInteger('campaign_id');
  	table.enum('type', ['USER', 'API', 'OTHER']);
  	table.text('contents');
  	table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('campaigns_log')
};
