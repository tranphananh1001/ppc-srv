'use strict';

var _ = require('lodash');

module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {

        itemname: {
            type: 'text',
            defaultsTo: ''
        },
        itemdescription: {
            type: 'text',
            defaultsTo: ''
        },
        listingid: {
            type: 'text',
            defaultsTo: ''
        },
        sellersku: {
            type: 'text',
            defaultsTo: ''
        },
        price: {
            type: 'text',
            defaultsTo: ''
        },
        quantity: {
            type: 'text',
            defaultsTo: ''
        },
        opendate: {
            type: 'text',
            defaultsTo: ''
        },
        imageurl: {
            type: 'text',
            defaultsTo: ''
        },
        itemismarketplace: {
            type: 'text',
            defaultsTo: ''
        },
        productidtype: {
            type: 'text',
            defaultsTo: ''
        },
        zshopshippingfee: {
            type: 'text',
            defaultsTo: ''
        },
        itemnote: {
            type: 'text',
            defaultsTo: ''
        },
        itemcondition: {
            type: 'text',
            defaultsTo: ''
        },
        zshopcategory1: {
            type: 'text',
            defaultsTo: ''
        },
        zshopbrowsepath: {
            type: 'text',
            defaultsTo: ''
        },
        zshopstorefrontfeature: {
            type: 'text',
            defaultsTo: ''
        },
        asin1: {
            type: 'text',
            defaultsTo: ''
        },
        asin2: {
            type: 'text',
            defaultsTo: ''
        },
        asin3: {
            type: 'text',
            defaultsTo: ''
        },
        willshipinternationally: {
            type: 'text',
            defaultsTo: ''
        },
        expeditedshipping: {
            type: 'text',
            defaultsTo: ''
        },
        zshopboldface: {
            type: 'text',
            defaultsTo: ''
        },
        productid: {
            type: 'text',
            defaultsTo: ''
        },
        bidforfeaturedplacement: {
            type: 'text',
            defaultsTo: ''
        },
        adddelete: {
            type: 'text',
            defaultsTo: ''
        },
        pendingquantity: {
            type: 'text',
            defaultsTo: ''
        },
        fulfillmentchannel: {
            type: 'text',
            defaultsTo: ''
        },
        cost_per_unit: {
            type: 'decimal'
        },
        total_shipping_costs: {
            type: 'decimal'
        },
        additional_per_unit_costs: {
            type: 'decimal'
        },
        amazon_FBA_fees: {
            type: 'decimal'
        },
        average_selling_price: {
            type: 'decimal'
        }

    }
});
