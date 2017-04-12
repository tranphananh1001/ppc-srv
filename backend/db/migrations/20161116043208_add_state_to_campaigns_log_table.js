
exports.up = function(knex, Promise) {
	return knex.schema.table('campaigns_log', function (table) {
		table.integer('state');
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.table('campaigns_log', function (table) {
		table.dropColumn('state');
	});
};
