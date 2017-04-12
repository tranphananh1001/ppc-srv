'use strict';

var _ = require('lodash');
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {
    addorreplace : function addorreplace(request, response) {
        var sellerID = request.param('SellerID');
        var MWSAuthToken = request.param('MWSAuthToken');
        var profit = request.param('profit');
        var acos = request.param('acos');
        var user = request.param('user');

        if (typeof MWSAuthToken !== 'undefined' && MWSAuthToken !== null) MWSAuthToken='';
        if (typeof sellerID !== 'undefined' && sellerID !== null) sellerID='';
        if (typeof profit !== 'undefined' && profit !== null) profit='';
        if (typeof acos !== 'undefined' && acos !== null) acos='';

        sails.models.product.query('SELECT * FROM mws where user='+user, function (err, results) {
            if (err) {
                return results.serverError(err);
            }

            if (typeof results[0] !== 'undefined' && results[0] !== null){
                //data present, updating
                var query = 'UPDATE mws SET average_profit='+profit+', average_acos='+acos+', SellerID=\''+sellerID+'\', MWSAuthToken=\''+MWSAuthToken+'\' WHERE id = ' + results[0].id;
                sails.models.product.query(query, function (err, results) {
                    return response.ok(results);
                });
            } else {
                //no data present , creating
                sails.models.product.query('INSERT INTO mws SET user='+user+',average_profit='+profit+', average_acos='+acos+', SellerID=\''+sellerID+'\', MWSAuthToken=\''+MWSAuthToken+'\'', function (err, results) {
                    return response.ok(results);
                });
            }
        });
    },
    upload: function  (request, response) {
        request.file('report').upload(function (err, files) {
            if (err) {
                return response.serverError(err);
            }
            return response.json({
                message: files.length + ' file(s) uploaded successfully!',
                files: files
            });
        });
    }
});
