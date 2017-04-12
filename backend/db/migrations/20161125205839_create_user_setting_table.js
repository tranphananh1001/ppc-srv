
exports.up = function(knex, Promise) {
	return knex.schema.createTableIfNotExists('user_setting', function(table) {
		table.increments();
		table.bigInteger('user_id');
		table.text('category');
		table.text('type');
		table.text('value');
		table.timestamps();
		table.bigInteger('createdUserId');
		table.bigInteger('updatedUserId');
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTableIfExists('user_setting');
};
