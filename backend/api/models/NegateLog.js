'use strict';

var _ = require('lodash');

module.exports = _.merge(_.cloneDeep(require('../base/Model')), {

	attributes: {
		sku: {
			type: 'string',
			required: true
		},
		keywords: {
			type: 'text',
			required: true,
			defaultsTo: ''
		},
		keywordType: {
			type: 'integer',
			defaultsTo: '0', //0 - exact, 1 - phrase
			required: true
		},
		createdAt: {
			columnName: 'created_at',
			type: 'datetime',
			defaultsTo: function() {return new Date();}
		},
		updatedAt: {
			columnName: 'updated_at',
			type: 'datetime',
			defaultsTo: function() {return new Date();}
		},
		createdUserId: {
			type: 'integer',
			defaultsTo: null
		},
		updatedUserId: {
			type: 'integer',
			defaultsTo: null
		}
	},
	tableName: 'negate_log',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	//Resonsible for actually updating the 'updateDate' property.
	beforeValidate:function(values,next) {
		values.updateDate= new Date();
		next();
	}
});
