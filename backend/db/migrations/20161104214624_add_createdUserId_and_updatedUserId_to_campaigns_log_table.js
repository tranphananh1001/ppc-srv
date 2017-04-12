
exports.up = function(knex, Promise) {
	return knex.schema.table('campaigns_log', function (table) {
		table.bigInteger('createdUserId');
		table.bigInteger('updatedUserId');
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.table('campaigns_log', function (table) {
		table.dropColumn('createdUserId');
		table.dropColumn('updatedUserId');
	});
};
