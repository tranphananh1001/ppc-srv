'use strict';

var _ = require('lodash');

module.exports = _.merge(_.cloneDeep(require('../base/Model')), {

	attributes: {
		user_id: {
			type: 'integer',
			required: true
		},
		category: {
			type: 'text',
			defaultsTo: 'datatable',
			required: true
		},
		type: {
			type: 'text',
			defaultsTo: '',
			required: true
		},
		value: {
			type: 'text',
			defaultsTo: '',
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
	tableName: 'user_setting',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	//Resonsible for actually updating the 'updateDate' property.
	beforeValidate:function(values,next) {
		values.updateDate= new Date();
		next();
	}
});

