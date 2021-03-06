'use strict';

var _ = require('lodash');

/**
 * Author.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {

  attributes: {

    SellerID: {
      type: 'text',
      defaultsTo: ''
    },
    MWSAuthToken: {
      type: 'text',
      defaultsTo: ''
    }

  }
});

