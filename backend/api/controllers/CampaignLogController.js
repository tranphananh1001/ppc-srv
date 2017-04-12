'use strict';
var fs = require('fs');
var atob = require('atob');
var moment = require('moment');
var iconv = require('iconv-lite');

var _ = require('lodash');
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {
    find: function(request, response) {
        var campaignId = request.param('campaign_id');
        var userId = request.param('user');

        sails.models['campaignlog'].find({
            where: {
                campaign_id: campaignId,
                createdUserId: userId
            },
            sort: 'created_at DESC'
        }).exec(function(err, result) {
            if (err) return response.serverError(err);
            response.send(result);
        });
    },
    findOne: function(request, response) {
        var id = request.param('id');

        sails.models['campaignlog'].findOne(id)
            .exec(function(err, result) {
                if (err) return response.serverError(err);
                response.send(result);
            });
    },
    loadon: function(request, response) {
        var user = request.param('user');
        sails.models['campaignlog'].find({
            where: {
                createdUserId: user,
                state: 1
            },
            sort: 'created_at DESC'
        }).exec(function(err, result) {
            if (err) {
              return response.serverError(err);
            }
            response.send(result);
        });
    },
    track: function(request, response) {
        var tracks = request.param('tracks');
        var ids = [];
        var states = [];

        for (var i in tracks) {
            var tmp = JSON.parse(tracks[i]);
            ids.push(tmp.id);
            states.push(tmp.state ? 1 : 0);
            sails.models['campaignlog'].update({
                    id: tmp.id
                }, {
                    state: tmp.state ? 1 : 0
                })
                .exec(function() {
                  //
                });
        }
        response.send('ok');
    },
    result: function(request, response) {
        var type = request.param('type');
        var log_id = request.param('log_id');
        var user_id = request.param('user_id');
        var campaign_name = request.param('campaign_name');

        sails.models['campaignlog'].findOne(log_id)
            .exec(function(err, result) {
                if (err) return response.serverError(err);
                var now = moment(result.createdAt);

                var before30 = now.subtract(30, "days").format('YYYY-MM-DD 00:00:00');
                now.add(30, "days").format('YYYY-MM-DD 23:59:59');
                var now1 = now.format('YYYY-MM-DD 23:59:59');
                var now2 = now.format('YYYY-MM-DD 00:00:00');
                var after30 = now.add(35, "days").format('YYYY-MM-DD 23:59:59');

                if (type == 'A')
                    var searchstring = ' and (c.`End Date` BETWEEN \'' + before30 + '\' AND \'' + now1 + '\')';
                if (type == 'B')
                    var searchstring = ' and (c.`End Date` BETWEEN \'' + now2 + '\' AND \'' + after30 + '\')';

                var query = 'SELECT tdata.id, IF(tdata.acos1 is NULL, 40, tdata.acos1) as acos1, ' +
                    '(SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, tdata.AvCPC, tdata.Campaign, tdata.MinDate, tdata.EndDate, ' +
                    '(SUM(tdata.Revenue*tdata.Profit)-SUM(tdata.Cost)) AS Profit, ' + 
                    'SUM(tdata.Cost) AS Cost, SUM(tdata.Clicks) AS Clicks,' +
                    ' SUM(tdata.Orders) AS Orders, SUM(tdata.Revenue) as Revenue, SUM(tdata.Impressions) AS Impressions from (SELECT c.`Campaign Name` as Campaign, MIN(c.`Start Date`) AS MinDate, MAX(c.`End Date`) ' +
                    'AS EndDate, sum(c.`1-week Other SKU Units Ordered Product Sales`) AS  Revenue, IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)' +
                    '/p.average_selling_price) IS NULL, m.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)' +
                    '/p.average_selling_price)) AS Profit, (select id from campaigns where user=' + user_id + ' and name LIKE \'' + campaign_name + '\') as id, IF( EXISTS(select acos from campaigns where user=' + user_id + ' AND name LIKE \'' + campaign_name + '\'), (select acos from campaigns where user=' + user_id + ' AND name LIKE \'' + campaign_name + '\'), NULL) as acos1, ' +
                    'sum(c.`Total spend`) AS Cost, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) as AvCPC, sum(c.`Impressions`) AS Impressions, sum(c.`Clicks`) AS Clicks, sum(c.`1-week Other SKU Units Ordered`) ' +
                    'AS Orders FROM productadsreport2 c, listing_reports_data p, mws m WHERE m.user=' + user_id + ' and c.user=' + user_id + ' and c.`Campaign Name` LIKE \'' + campaign_name + '\' and c.`Advertised SKU`= p.sku AND p.allowed=1 AND p.user=c.user  ' + searchstring + ' GROUP BY p.sku) tdata';

                sails.models.product.query(query, function(err, results) {
                    if (err) {
                        return response.serverError(err);
                    }
                    return response.send(results);
                });
            });
    },
    delete: function(request, response) {
        var logs = request.param('logs');

        sails.models['campaignlog'].destroy({
                id: logs
            })
            .exec(function(err, result) {
                if (err) return response.send(err);
                else response.send('ok');
            });
    },
    create: function(request, response) {
        var createdUserId = parseInt(request.param('user'));

        sails.models['user']
          .findOne(createdUserId)
          .exec(function (err, user) {
              if (err) {
                  return response.serverError(err);
              }

              var item = {
                  campaign_id: request.param('campaign_id'),
                  state: request.param('state'),
                  type: request.param('type'),
                  contents: request.param('contents'),
                  created_at: request.param('createdAt'),
                  createdUser: user,
              };

              sails.models['campaignlog']
                  .create(item)
                  .exec(function(err, result) {
                      if (err) {
                        return response.serverError(err);
                      }
                      response.send(result);
                  });
          });
    },
    update: function(request, response) {
        var id = request.param('id');
        var item = {
            campaign_id: request.param('campaign_id'),
            state: request.param('state'),
            type: request.param('type'),
            contents: request.param('contents')
        };
        sails.models['campaignlog'].update({
                id: id
            }, item)
            .exec(function(err, result) {
                if (err) return response.serverError(err);
                response.send(result);
            });
    },
    destroy: function(request, response) {
        var id = request.param('id');
        sails.models['campaignlog'].destroy({
                id: id
            })
            .exec(function(err, result) {
                if (err) return response.serverError(err);
                response.send(result);
            });
    }
});
