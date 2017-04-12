
exports.up = function(knex, Promise) {
	return knex.schema.table('models', function (table) {
		table.decimal('ordersFrom');
		table.decimal('ordersTo');
		table.decimal('conversionRateFrom');
		table.decimal('conversionRateTo');
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.table('models', function (table) {
		table.dropColumn('ordersFrom');
		table.dropColumn('ordersTo');
		table.dropColumn('conversionRateFrom');
		table.dropColumn('conversionRateTo');
	});
};
