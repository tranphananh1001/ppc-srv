'use strict';

var _ = require('lodash');

/**
 * Book.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
        attributes: {

            "Campaign Name": {
                type: 'string',
                required: true
            },
            "Ad Group Name": {
                type: 'string',
                required: true
            },
            "Advertised SKU": {
                type: 'string',
                required: true
            },
            "Keyword": {
                type: 'string',
                required: true
            },
            "Match Type": {
                type: 'string',
                required: true
            },
            "Start Date": {
                type: 'date',
                required: true
            },
            "End Date": {
                type: 'date',
                required: true
            },
            "Clicks": {
                type: 'integer',
                required: true
            },
            "Impressions": {
                type: 'integer',
                required: true
            },
            "CTR": {
                type: 'decimal',
                required: true
            },
            "Total Spend": {
                type: 'decimal',
                required: true
            },
            "Average CPC": {
                type: 'decimal',
                required: true
            },
            "Currency": {
                type: 'string',
                required: true
            },
            "1-day Orders Placed": {
                type: 'integer',
                required: true
            },
            "1-day Ordered Product Sales": {
                type: 'decimal',
                required: true
            },
            "1-day Conversion Rate": {
                type: 'decimal',
                required: true
            },
            "1-day Same SKU Units Ordered": {
                type: 'integer',
                required: true
            },
            "1-day Other SKU Units Ordered": {
                type: 'integer',
                required: true
            },
            "1-day Same SKU Units Ordered Product Sales": {
                type: 'decimal',
                required: true
            },
            "1-day Other SKU Units Ordered Product Sales": {
                type: 'decimal',
                required: true
            },
            "1-week Orders Placed": {
                type: 'integer',
                required: true
            },
            "1-week Ordered Product Sales": {
                type: 'decimal',
                required: true
            },
            "1-week Conversion Rate": {
                type: 'decimal',
                required: true
            },
            "1-week Same SKU Units Ordered": {
                type: 'integer',
                required: true
            },
            "1-week Other SKU Units Ordered": {
                type: 'integer',
                required: true
            },
            "1-week Same SKU Units Ordered Product Sales": {
                type: 'decimal',
                required: true
            },
            "1-week Other SKU Units Ordered Product Sales": {
                type: 'decimal',
                required: true
            },
            "1-month Orders Placed": {
                type: 'integer',
                required: true
            },
            "1-month Ordered Product Sales": {
                type: 'decimal',
                required: true
            },
            "1-month Conversion Rate": {
                type: 'decimal',
                required: true
            },
            "1-month Same SKU Units Ordered": {
                type: 'integer',
                required: true
            },
            "1-month Other SKU Units Ordered": {
                type: 'integer',
                required: true
            },
            "1-month Same SKU Units Ordered Product Sales": {
                type: 'decimal',
                required: true
            },
            "1-month Other SKU Units Ordered Product Sales": {
                type: 'decimal',
                required: true
            }
        }
    }
);