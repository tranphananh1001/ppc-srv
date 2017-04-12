'use strict';

var _ = require('lodash');

module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
  attributes: {
    campaign_id: {
      type: 'integer',
      required: true
    },
    state: {
      type: 'integer',
      required: true
    },
    type: {
      type: 'text',
      defaultsTo: 'USER',
      required: true
    },
    contents: {
      type: 'text',
      required: true,
      defaultsTo: ''
    },
    createdAt: {
      columnName: 'created_at',
      type: 'datetime',
      defaultsTo: function() {
        return new Date();
      }
    },
    updatedAt: {
      columnName: 'updated_at',
      type: 'datetime',
      defaultsTo: function () {
        return new Date();
      }
    },
  },
  tableName: 'campaigns_log',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  //Resonsible for actually updating the 'updateDate' property.
  beforeValidate:function (values, next) {
    values.updateDate = new Date();
    next();
  }
});
