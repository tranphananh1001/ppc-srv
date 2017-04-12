'use strict';

var _ = require('lodash');

module.exports = _.merge(_.cloneDeep(require('../base/Model')),{
	schema: true,

	attribute: {
		email: {
			type: 'string',
			unique: true
		},
		hashkey: {
			type: 'string',
			unique: true
		},
		dtime:{
			type: 'datetime',
			required: true
		}
	}
});