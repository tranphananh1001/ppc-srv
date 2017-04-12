'use strict';

var _ = require('lodash');

var fs = require('fs');

function mysqlEscape(str) {
    if (typeof str === 'undefined' || !str) {
        return '';
    }
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function(char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\" + char; // prepends a backslash to backslash, percent,
                // and double/single quotes
        }
    });
}

module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {
    gettopKPI: function(request, response) {
        var ID = request.param('id');
        var user = request.param('user');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');

        var searchstring = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var query = 'SELECT tdata.MinDate, (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, ' +
                'tdata.AvCPC, tdata.EndDate,(SUM(tdata.Revenue*tdata.Profit)-SUM(tdata.Cost)) AS Profit, SUM(tdata.Cost) AS Cost, ' +
                'SUM(tdata.Clicks) AS Clicks,' +
                ' SUM(tdata.Orders) AS Orders, SUM(tdata.Revenue) as Revenue, SUM(tdata.Impressions) AS Impressions from (SELECT MIN(c.`Start Date`) AS MinDate, MAX(c.`End Date`) ' +
                'AS EndDate, sum(c.`1-week Other SKU Units Ordered Product Sales`) AS  Revenue, IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)' +
                '/p.average_selling_price) IS NULL, m.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)' +
                '/p.average_selling_price)) AS Profit, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.`Clicks`) as AvCPC, sum(c.`Total spend`) AS Cost, sum(c.`Impressions`) AS Impressions, sum(c.`Clicks`) AS Clicks, sum(c.`1-week Other SKU Units Ordered`) ' +
                'AS Orders FROM productadsreport2 c, listing_reports_data p, mws m WHERE c.user=' + user + ' and m.user=' + user + ' and p.id=' + ID + ' and c.`Advertised SKU`= p.sku AND' +
                ' (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0) AND p.user=c.user  ' + searchstring + ' GROUP BY p.sku) tdata';

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    checkProductIsSetup: function(request, response) {
        var user = request.param('user');
        var product = request.param('product');
        var query = 'SELECT COUNT(*) as totalCount ' +
            'FROM listing_reports_data p, mws m ' +
            'WHERE p.user=' + user + ' and m.user=' + user + ' and p.id=' + product + ' AND ' +
            '(p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0)';

        sails.models.product.query(query, function (err, results1) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results1);
        });
    },
    searchSKUsByKeyword: function(request, response) {
        var keyword = request.param('keyword');
        var user = request.param('user');

        var where = [];
        if (keyword) where.push({
            key: 'Keyword LIKE',
            value: '"' + keyword + '"'
        });
        if (user) where.push({
            key: 'user =',
            value: user
        });

        var query = 'SELECT DISTINCT `Advertised SKU` as SKU FROM productadsreport2 WHERE user=' + user +
            ' AND `Campaign ID` IN (select DISTINCT `Campaign Id` AS `CampaignId` FROM keywordsreport2 where :WHERE)';
        sails.models.product.query(sails.models.product.escapeQuery(query, where), function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    customQuery: function (request, response) {
        var ID = request.param('id');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var order = request.param('order');
        var searchstring = '';
        var user = request.param('user');
        var profitfrom = request.param('profitfrom');
        var profitto = request.param('profitto');
        var revenuefrom = request.param('revenuefrom');
        var revenueto = request.param('revenueto');
        var adspendfrom = request.param('adspendfrom');
        var adspendto = request.param('adspendto');
        var acosfrom = request.param('acosfrom');
        var acosto = request.param('acosto');
        var impressionsfrom = request.param('impressionsfrom');
        var impressionsto = request.param('impressionsto');
        var clicksfrom = request.param('clicksfrom');
        var clicksto = request.param('clicksto');
        var ctrfrom = request.param('ctrfrom');
        var ctrto = request.param('ctrto');
        var avecpcfrom = request.param('avecpcfrom');
        var avecpcto = request.param('avecpcto');
        var ordersFrom = request.param('ordersFrom');
        var ordersTo = request.param('ordersTo');
        var conversionRateFrom = request.param('conversionRateFrom');
        var conversionRateTo = request.param('conversionRateTo');
        var match1 = request.param('match1');

        if (order === 'DESC') {
            var order1 = ' WHERE tdata.Cost>0 and tdata.Revenue*tdata.Profit-tdata.Cost>0 ';
        } else {
            var order1 = ' WHERE tdata.Cost>0 and tdata.Revenue*tdata.Profit-tdata.Cost<=0 ';
        }

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var queryStr =  'SELECT * ' +
            'FROM (' +
              'SELECT ' +
                'tdata.Keyword as Keyword, (tdata.Clicks / tdata.Impressions) AS CTR, tdata.ACoS, tdata.AvCPC, tdata.Profit as Profit, ' +
                'tdata.Revenue*tdata.Profit-tdata.Cost AS Profit1, tdata.Cost AS Cost, tdata.Clicks AS Clicks, ' +
                'tdata.Orders AS Orders, (tdata.Orders/tdata.Clicks*100) as conversionRate, tdata.Revenue as Revenue, ' +
                'tdata.Impressions AS Impressions, tdata.Match1 as Match1 ' +
              'FROM (' +
                'SELECT ' +
                  'c.`Match Type` as Match1, c.Keyword, sum(c.`1-week Ordered Product Sales`) AS Revenue, ' +
                  'IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price) IS NULL, ' +
                  'm.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)) AS Profit,' +
                  'SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.`Clicks`) as AvCPC, sum(c.`Total spend`) AS Cost, sum(c.`Impressions`) AS Impressions, ' +
                  'SUM(c.`Clicks`) AS Clicks, sum(c.`1-week Orders Placed`) AS Orders, ' +
                  'SUM(c.`Total spend`)/sum(c.`1-week Ordered Product Sales`) * 100 as ACoS ' +
                'FROM keywordsreport2 c, mws m, listing_reports_data p ' +
                'WHERE ' +
                  'c.Keyword IN (' +
                    'SELECT DISTINCT c.Keyword ' +
                    'FROM keywordsreport2 c, productadsreport2 p, listing_reports_data p1 ' +
                    'WHERE p.`Ad Group Id`=c.`Ad Group Id` AND c.`Start Date` = p.`Start Date` ' +
                      'AND c.`End Date`=p.`End Date` ' + searchstring + ' AND c.user=' + user + ' and ' +
                      ' p1.id=' + ID + ' and p.`Advertised SKU`= p1.sku ' +
                      'AND (p1.allowed=1 or (' +
                        'SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id' +
                      ') = 0)' +
                  ') ' +
                  'AND p.id = ' + ID + ' ' +
                  'AND c.user=' + user + ' AND m.user=' + user + searchstring + ' ' +
                'GROUP BY c.Keyword' +
              ') tdata ' + order1 +
              'ORDER BY Profit1 ' + order +
            ') t ' +
            'WHERE ' +
              't.Profit1>=' + profitfrom +
              ' and t.Profit1<=' + profitto +
              ' and t.Revenue>=' + revenuefrom +
              ' and t.Revenue<=' + revenueto +
              ' and t.Cost>=' + adspendfrom +
              ' and t.Cost<=' + adspendto +
              ' and (t.ACoS>=' + acosfrom +
              ' and t.ACoS<=' + acosto +
              ' OR t.ACoS IS NULL) and t.Impressions>=' + impressionsfrom +
              ' and t.Impressions<=' + impressionsto +
              ' and t.Clicks>=' + clicksfrom +
              ' and t.Clicks<=' + clicksto +
              ' and t.CTR>=' + ctrfrom +
              ' and t.CTR<=' + ctrto +
              ' and t.AvCPC>=' + avecpcfrom +
              ' and t.AvCPC<=' + avecpcto +
              ' and t.Orders>=' + ordersFrom +
              ' and t.Orders<=' + ordersTo +
              ' and t.conversionRate>=' + conversionRateFrom +
              ' and t.conversionRate<=' + conversionRateTo +
              (match1 == null || match1 == '' || match1 == 'ANY' ? '' : ' and t.`Match1` LIKE "' + match1 + '"');

        sails.models.product.query(queryStr, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getZeroImpressionKeywords: function (request, response) {
        var ID = request.param('id');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var user = request.param('user');
        var match1 = request.param('match1');

        var dateCondition = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            dateCondition = ' AND (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var matchCondition = '';
        if (match1 !== null && match1 !== '' && match1 !== 'ANY') {
            matchCondition = ' AND c.`Match Type` LIKE "' + match1 + '"';
        }

        var skuInfo;

        sails.models.product.query('SELECT * FROM listing_reports_data WHERE id = ' + ID, function (err, skus) {
          if (err) {
            return response.serverError(err);
          }

          skuInfo = skus[0];
          if (parseInt(skuInfo['allowed']) === 1) {
            getKeywords();
          } else {
            var queryForMaxSKU =
              'SELECT t.max_sku ' +
              'FROM mws m, subscriptions s, tariffs t ' +
              'WHERE s.id = m.subscription_id AND m.user = ' + user + ' AND t.name = s.plan_id';

            sails.models.product.query(queryForMaxSKU, function (err, maxSku) {
              if (err) {
                return response.serverError(err);
              }

              if (parseInt(maxSku[0].max_sku) === 0) {
                getKeywords();
              } else {
                return response.ok([]);
              }
            });
          }
        });

        function getKeywords() {
          var query =
              'SELECT c.Keyword, c.`Match Type` AS Match1, c.`Campaign Name` ' +
              'FROM keywordsreport2 c, productadsreport2 p ' +
              'WHERE ' +
                'p.user = ' + user +
                ' AND p.`Advertised SKU` = \'' + skuInfo['sku'] + '\'' +
                ' AND p.`Ad Group Id` = c.`Ad Group Id` ' +
                ' AND c.user = ' + user + dateCondition + matchCondition + 
              ' GROUP BY c.Keyword' +
              ' HAVING SUM(c.`Impressions`) = 0';

          sails.models.product.query(query, function (err, results) {
              if (err) {
                return response.serverError(err);
              }
              return response.ok(results);
          });
        }
    },
    getallSKUs: function getallSKUs(request, response) {
        var user = request.param('user');
        var allowed = request.param('allowed');
        console.log("---------------------------")
        console.log(user);
        console.log(allowed);
        if (typeof allowed === 'undefined' || allowed === null) {
            allowed = 1;
        }
        var query = 'SELECT ' +
            'DISTINCT p.id, ' +
            'IF( EXISTS(SELECT * FROM abtests WHERE sku = p.sku AND p.allowed=' + allowed + '  AND DATE(to_date)>=CURDATE()), 1, 0) AS YELLOW, ' +
            'IF( EXISTS(SELECT * FROM abtests WHERE sku = p.sku AND p.allowed=' + allowed + '  AND DATE(to_date)<CURDATE()), 1, 0) AS GREEN, ' +
            'p.average_selling_price, ' +
            'p.amazon_FBA_fees, ' +
            'p.additional_per_unit_costs, ' +
            'p.total_shipping_costs, ' +
            'p.cost_per_unit, ' +
            'p.sku, p.asin, p.`product-name`, p.quantity, p.product_description,p.image_sm , p.image_med, p.image_big, p.price, p.url ' +
            'FROM listing_reports_data p ' +
            'WHERE p.allowed=' + allowed + ' and p.user=' + user;

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getalltests: function getalltests(request, response) {
        var ID = request.param('id');
        var user = request.param('user');
        var query = 'SELECT a.id, a.name,a.from_date, a.to_date, a.clicked,' +
            'IF( DATE(to_date)>=CURDATE(), 1, 0) AS YELLOW, IF( DATE(to_date)<CURDATE() AND clicked=0, 1, 0) AS GREEN ' +
            'FROM abtests a, listing_reports_data p ' +
            'WHERE a.user=' + user + ' and a.sku = p.sku AND (p.allowed=1 or ' +
            '(SELECT t.max_sku FROM mws m, subscriptions s, tariffs t ' +
            'WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0)  and p.id=' + ID;

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    gettestbyID: function gettestbyID(request, response) {
        var ID = request.param('id');
        var user = request.param('user');
        sails.models.product.query('update abtests set clicked=1 WHERE user=' + user + ' AND DATE(to_date)<CURDATE() and id=' + ID, function(err1, results1) {
            sails.models.product.query('SELECT * from abtests WHERE user=' + user + ' and id=' + ID, function(err, results) {
                if (err) {
                  return response.serverError(err);
                }
                return response.ok(results);
            });
        });
    },
    savenewtest: function savenewtest(request, response) {
        var user = request.param('user');
        var before_backend1 = request.param('before_backend1');
        var before_backend2 = request.param('before_backend2');
        var before_backend3 = request.param('before_backend3');
        var before_backend4 = request.param('before_backend4');
        var before_backend5 = request.param('before_backend5');
        var before_bullet1 = request.param('before_bullet1');
        var before_bullet2 = request.param('before_bullet2');
        var before_bullet3 = request.param('before_bullet3');
        var before_bullet4 = request.param('before_bullet4');
        var before_bullet5 = request.param('before_bullet5');
        var before_coupon = request.param('before_coupon');
        var before_discount = request.param('before_discount');
        if (typeof before_discount === 'undefined' || before_discount == '') before_discount = 0;
        var before_photo1 = request.param('before_photo1');
        var before_photo2 = request.param('before_photo2');
        var before_photo3 = request.param('before_photo3');
        var before_photo4 = request.param('before_photo4');
        var before_photo5 = request.param('before_photo5');
        var before_photo6 = request.param('before_photo6');
        var before_photo7 = request.param('before_photo7');
        var before_photo8 = request.param('before_photo8');
        var before_photo9 = request.param('before_photo9');
        var before_price = request.param('before_price');
        if (typeof before_price === 'undefined' || before_price == '') before_price = 0;
        var before_summary = request.param('before_summary');
        var after_backend1 = request.param('after_backend1');
        var after_backend2 = request.param('after_backend2');
        var after_backend3 = request.param('after_backend3');
        var after_backend4 = request.param('after_backend4');
        var after_backend5 = request.param('after_backend5');
        var after_bullet1 = request.param('after_bullet1');
        var after_bullet2 = request.param('after_bullet2');
        var after_bullet3 = request.param('after_bullet3');
        var after_bullet4 = request.param('after_bullet4');
        var after_bullet5 = request.param('after_bullet5');
        var after_coupon = request.param('after_coupon');
        var after_discount = request.param('after_discount');
        if (typeof after_discount === 'undefined' || after_discount == '') after_discount = 0;
        var after_photo1 = request.param('after_photo1');
        var after_photo2 = request.param('after_photo2');
        var after_photo3 = request.param('after_photo3');
        var after_photo4 = request.param('after_photo4');
        var after_photo5 = request.param('after_photo5');
        var after_photo6 = request.param('after_photo6');
        var after_photo7 = request.param('after_photo7');
        var after_photo8 = request.param('after_photo8');
        var after_photo9 = request.param('after_photo9');
        var after_price = request.param('after_price');
        if (typeof after_price === 'undefined' || after_price == '') after_price = 0;
        var after_summary = request.param('after_summary');
        var after_title = request.param('after_title');
        var before_title = request.param('before_title');
        var before_timeframe = request.param('before_timeframe');
        var name = request.param('name');
        var sku = request.param('sku');
        var from_date = (new Date()).toISOString().substring(0, 19).replace('T', ' ');
        var someDate = new Date();
        someDate.setTime(someDate.getTime() + before_timeframe * 86400000);
        var to_date = someDate.toISOString().substring(0, 19).replace('T', ' ');

        var query = 'Insert into abtests set user=' + user + ', before_backend1=\'' + mysqlEscape(before_backend1) +
            '\', before_backend2=\'' + mysqlEscape(before_backend2) + '\',' +
            'before_backend3=\'' + mysqlEscape(before_backend3) + '\',before_backend4=\'' + mysqlEscape(before_backend4) + '\',' +
            'before_backend5=\'' + mysqlEscape(before_backend5) + '\',before_bullet1=\'' + mysqlEscape(before_bullet1) + '\',' +
            'before_bullet2=\'' + mysqlEscape(before_bullet2) + '\',before_bullet3=\'' + mysqlEscape(before_bullet3) + '\',' +
            'before_bullet4=\'' + mysqlEscape(before_bullet4) + '\',before_bullet5=\'' + mysqlEscape(before_bullet5) + '\',' +
            'before_coupon=\'' + mysqlEscape(before_coupon) + '\',before_discount=' + before_discount + ',' +
            'before_photo1=\'' + mysqlEscape(before_photo1) + '\',before_photo2=\'' + mysqlEscape(before_photo2) + '\',' +
            'before_photo3=\'' + mysqlEscape(before_photo3) + '\',before_photo4=\'' + mysqlEscape(before_photo4) + '\',' +
            'before_photo5=\'' + mysqlEscape(before_photo5) + '\',before_photo6=\'' + mysqlEscape(before_photo6) + '\',' +
            'before_photo7=\'' + mysqlEscape(before_photo7) + '\',before_photo8=\'' + mysqlEscape(before_photo8) + '\',' +
            'before_photo9=\'' + mysqlEscape(before_photo9) + '\',before_price=' + before_price + ',' +
            'before_summary=\'' + mysqlEscape(before_summary) + '\',' +
            'after_backend1=\'' + mysqlEscape(after_backend1) + '\', after_backend2=\'' + mysqlEscape(after_backend2) + '\',' +
            'after_backend3=\'' + mysqlEscape(after_backend3) + '\',after_backend4=\'' + mysqlEscape(after_backend4) + '\',' +
            'after_backend5=\'' + mysqlEscape(after_backend5) + '\',after_bullet1=\'' + mysqlEscape(after_bullet1) + '\',' +
            'after_bullet2=\'' + mysqlEscape(after_bullet2) + '\',after_bullet3=\'' + mysqlEscape(after_bullet3) + '\',' +
            'after_bullet4=\'' + mysqlEscape(after_bullet4) + '\',after_bullet5=\'' + mysqlEscape(after_bullet5) + '\',' +
            'after_coupon=\'' + mysqlEscape(after_coupon) + '\',after_discount=' + after_discount + ',' +
            'after_photo1=\'' + mysqlEscape(after_photo1) + '\',after_photo2=\'' + mysqlEscape(after_photo2) + '\',' +
            'after_photo3=\'' + mysqlEscape(after_photo3) + '\',after_photo4=\'' + mysqlEscape(after_photo4) + '\',' +
            'after_photo5=\'' + mysqlEscape(after_photo5) + '\',after_photo6=\'' + mysqlEscape(after_photo6) + '\',' +
            'after_photo7=\'' + mysqlEscape(after_photo7) + '\',after_photo8=\'' + mysqlEscape(after_photo8) + '\',' +
            'after_photo9=\'' + mysqlEscape(after_photo9) + '\',after_price=' + after_price + ',' +
            'after_summary=\'' + mysqlEscape(after_summary) + '\',to_date=\'' + to_date + '\',' +
            ' before_title=\'' + mysqlEscape(before_title) + '\', after_title=\'' + mysqlEscape(after_title) + '\', from_date=\'' + from_date + '\',' +
            ' name=\'' + mysqlEscape(name) + '\', sku=\'' + mysqlEscape(sku) + '\'';

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getbyID: function (request, response) {
        var ID = request.param('id');
        sails.models.product.query('SELECT * FROM listing_reports_data p WHERE p.id=' + ID, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getChart: function getChart(request, response) {
        var ID = request.param('id');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var searchstring = '';
        var user = request.param('user');

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var query = 'SELECT (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, tdata.AvCPC, tdata.EndDate, (SUM(tdata.Revenue*tdata.Profit)-SUM(tdata.Cost)) AS Profit, SUM(tdata.Cost) AS Cost, ' +
            'SUM(tdata.Clicks) AS Clicks, SUM(tdata.Orders) AS Orders, SUM(tdata.Revenue) as Revenue,' +
            ' SUM(tdata.Impressions) AS Impressions from ' +
            '(SELECT p.id, p.sku, IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price) IS NULL, ' +
            'm.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)) AS Profit,' +
            ' c.`End Date` AS EndDate, sum(c.`1-week Other SKU Units Ordered Product Sales`) AS  Revenue, sum(c.`Total spend`) AS Cost, sum(c.`Impressions`) AS Impressions, ' +
            'sum(c.`Clicks`) AS Clicks, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.`Clicks`) as AvCPC, ' +
            'SUM(c.`1-week Other SKU Units Ordered`) AS Orders FROM productadsreport2 c , listing_reports_data p, mws m ' +
            'WHERE c.user=' + user + ' and m.user=' + user + ' and p.id=' + ID + ' and c.`Advertised SKU`= p.sku AND (p.allowed=1 or ' +
            '(SELECT t.max_sku FROM mws m, subscriptions s, tariffs t ' +
            'WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0) AND p.user=c.user ' + searchstring +
            ' GROUP BY c.`End Date`, p.sku ORDER BY c.`End Date`) tdata GROUP BY tdata.EndDate';

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getChartbyKeyword: function getChart(request, response) {
        var ID = request.param('id');
        var keyword = request.param('keyword');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var searchstring = '';
        var user = request.param('user');

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\') ';
        }

        var query = 'SELECT (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, tdata.AvCPC, tdata.EndDate, ' +
            '(SUM(tdata.Revenue*tdata.Profit) - SUM(tdata.Cost)) AS Profit, ' +
            'SUM(tdata.Cost) AS Cost,  SUM(tdata.Clicks) AS Clicks,  SUM(tdata.Orders) AS Orders,  SUM(tdata.Revenue) as Revenue, SUM(tdata.Impressions) AS Impressions ' +
            'FROM (SELECT IF(Profit is NULL, (SELECT m.average_profit/100 FROM mws m WHERE m.user=' + user + '), Profit) AS Profit, ' +
            'EndDate, Revenue, Cost, Impressions, Clicks, AvCPC, Orders ' +
            'FROM ( SELECT  (SELECT ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price) ' +
            'FROM listing_reports_data p  WHERE p.id = ' + ID + ' and (p.allowed=1 or ' +
            '(SELECT t.max_sku FROM mws m, subscriptions s, tariffs t ' +
            'WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0)) as Profit,  ' +
            'c.`End Date` AS EndDate,  sum(c.`1-month Ordered Product Sales`) AS  Revenue,  sum(c.`Total spend`) AS Cost, ' +
            'SUM(c.`Impressions`) AS Impressions, sum(c.`Clicks`) AS Clicks, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.`Clicks`) as AvCPC, ' +
            'SUM(c.`1-month Orders Placed`) AS Orders  FROM   keywordsreport2 c  ' +
            'WHERE c.user=' + user + ' and c.Keyword LIKE \'' + mysqlEscape(keyword) + '\' ' + searchstring +
            ' GROUP BY c.`End Date` ORDER BY c.`End Date` ) tdata1 ) tdata  GROUP BY tdata.EndDate';

        sails.models.product.query(query, function (err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    searchbyACoSmult: function searchbyACoSmult(request, response) {
        var ID = request.param('id');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var user = request.param('user');
        var searchstring = '';

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var query = 'SELECT tdata.acos1, (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, tdata.AvCPC, tdata.Campaign, (SUM(tdata.Revenue*tdata.Profit)-SUM(tdata.Cost)) AS Profit, ' +
            'SUM(tdata.Cost) AS Cost, SUM(tdata.Clicks) AS Clicks, SUM(tdata.Orders) AS Orders, SUM(tdata.Revenue) as Revenue,' +
            ' SUM(tdata.Impressions) AS Impressions from ' +
            '(SELECT p.id, p.sku, IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)' +
            ' IS NULL, ' +
            'm.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)) AS Profit, ' +
            'c.`Campaign Name` AS Campaign, sum(c.`1-month Ordered Product Sales`) AS  Revenue, sum(c.`Total spend`) AS Cost, sum(c.`Impressions`) AS Impressions, ' +
            'sum(c.`Clicks`) AS Clicks, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.`Clicks`) as AvCPC, ' +
            'IF( EXISTS(select acos from campaigns where user=' + user + ' AND name = c.`Campaign Name`), (select acos from campaigns where user=' + user +
            ' AND name = c.`Campaign Name`), NULL) as acos1, ' +
            'sum(c.`1-month Orders Placed`) AS Orders FROM productadsreport2 c, listing_reports_data p, mws m WHERE m.user=' + user + ' and p.id=' + ID + ' and c.user=' + user +
            ' and c.`Advertised SKU`= p.sku AND (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user +
            ' AND t.name=s.plan_id)=0) AND p.user=c.user  ' + searchstring +
            'GROUP BY c.`Campaign Name`, p.sku ORDER BY Revenue DESC) tdata where tdata.Cost>0 GROUP BY tdata.Campaign';

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    update_margins: function(request, response) {
        var ID = request.param('id');
        var cost_per_unit = request.param('cost_per_unit');
        var total_shipping_costs = request.param('total_shipping_costs');
        var additional_per_unit_costs = request.param('additional_per_unit_costs');
        var amazon_FBA_fees = request.param('amazon_FBA_fees');
        var average_selling_price = request.param('average_selling_price');
        var user = request.param('user'); // FIXME: We don't use this, and instead ID is used.

        var query = 'UPDATE listing_reports_data SET cost_per_unit=' + cost_per_unit + ', total_shipping_costs=' + total_shipping_costs + ', ' +
            'additional_per_unit_costs=' + additional_per_unit_costs + ', amazon_FBA_fees=' + amazon_FBA_fees + ', ' +
            'average_selling_price=' + average_selling_price + ' WHERE id = ' + ID;

        sails.models.product.query(query, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getbackend: function getbackend(request, response) {
        var ID = request.param('id');
        var a = [];
        var user = request.param('user');

        var query = 'SELECT DISTINCT c.`Campaign Name` as camp FROM productadsreport2 c, listing_reports_data p WHERE ' +
            ' p.id=' + ID + ' and c.`Advertised SKU`= p.sku AND (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t ' +
            'WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0) AND p.user=c.user';

        sails.models.product.query(query, function(err, results1) {
            if (err) {
                return response.serverError(err);
            }
            var nstr = "'" + results1.map(function(e) {
                return mysqlEscape(e.camp);
            }).join("','") + "'";

            var query = 'SELECT tdata.`ACoS` as acos, (tdata.Clicks / tdata.Impressions) AS CTR, tdata.AvCPC,  tdata.Keyword as Keyword, tdata.Search as Search, tdata.Cost AS Cost, tdata.Clicks AS Clicks,' +
                ' tdata.Orders AS Orders, tdata.Revenue as Revenue, tdata.Impressions AS Impressions, tdata.Match1 as Match1 from (SELECT c.`Match Type` as Match1, c.`Customer Search Term` AS Search, c.`Campaign Name` as Campaign, c.Keyword, ' +
                'sum(c.`Product Sales within 1-week of a click`) AS  Revenue, sum(c.`Total spend`) AS Cost, c.`ACoS`, ' +
                'sum(c.`Impressions`) AS Impressions, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.`Clicks`) as AvCPC,  sum(c.`Clicks`) AS Clicks, ' +
                'sum(c.`Orders placed within 1-week of a click`) AS Orders ' +
                'FROM searchtermreport2 c ' +
                'WHERE c.`ACoS`>0 AND c.`ACoS`<30 and c.`Campaign Name` IN (' + nstr + ') GROUP BY c.`Customer Search Term`) tdata ORDER BY tdata.Revenue DESC';

            sails.models.product.query(query, function(err, results) {
                if (err) {
                  return response.serverError(err);
                }

                a = results;

                sails.models.product.query('SELECT * FROM listing_reports_data p WHERE p.user=' + user + ' and p.id=' + ID, function(err, results) {
                    if (err) {
                      return response.serverError(err);
                    }
                    var b1 = [];
                    var b2 = [];
                    var b3 = [];
                    var b4 = [];
                    var b5 = [];
                    var b6 = [];

                    var ab = results;

                    if (typeof ab[0].backend_keywords1 !== 'undefined' && ab[0].backend_keywords1) {
                        b1 = ab[0].backend_keywords1.split(' ');
                    }
                    if (typeof ab[0].backend_keywords2 !== 'undefined' && ab[0].backend_keywords2) {
                        b2 = ab[0].backend_keywords2.split(' ');
                    }
                    if (typeof ab[0].backend_keywords3 !== 'undefined' && ab[0].backend_keywords3) {
                        b3 = ab[0].backend_keywords3.split(' ');
                    }
                    if (typeof ab[0].backend_keywords4 !== 'undefined' && ab[0].backend_keywords4) {
                        b4 = ab[0].backend_keywords4.split(' ');
                    }
                    if (typeof ab[0].backend_keywords5 !== 'undefined' && ab[0].backend_keywords5) {
                        b5 = ab[0].backend_keywords5.split(' ');
                    }
                    if (typeof ab[0]['product-name'] !== 'undefined' && ab[0]['product-name']) {
                        b6 = ab[0]['product-name'].split(' ');
                    }

                    var aba = b1.concat(b2, b3, b4, b5, b6);

                    var seen = {};
                    for (var i = 0; i < a.length; i++) {
                        count(a[i].Search.split(' '), seen);
                    }

                    function count(words, accumulator) {
                        for (var i = 0; i < words.length; ++i) {
                            if (!accumulator.hasOwnProperty(words[i])) {
                                accumulator[words[i]] = 1;
                            } else {
                                ++accumulator[words[i]];
                            }
                        }
                    }

                    var sortable = [];
                    for (var vehicle in seen) {
                        if (aba.indexOf(vehicle) < 0)
                            sortable.push([vehicle, seen[vehicle]]);
                    }
                    sortable.sort(function(a, b) {
                        return a[1] - b[1];
                    }).reverse();

                    return response.ok(sortable);
                });

            });
        });
    },
    update_backend: function update_backend(request, response) {
        var user = request.param('user');
        var ID = request.param('id');
        var backend1 = mysqlEscape(request.param('backend1'));
        var backend2 = mysqlEscape(request.param('backend2'));
        var backend3 = mysqlEscape(request.param('backend3'));
        var backend4 = mysqlEscape(request.param('backend4'));
        var backend5 = mysqlEscape(request.param('backend5'));

        var query = 'update listing_reports_data set backend_keywords1=\'' + backend1 + '\', ' +
            ' backend_keywords2=\'' + backend2 + '\',' +
            ' backend_keywords3=\'' + backend3 + '\',' +
            ' backend_keywords4=\'' + backend4 + '\',' +
            ' backend_keywords5=\'' + backend5 + '\' WHERE user=' + user + ' and id=' + ID;

        sails.models.product.query(query, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    upload: function(request, response) {
        var user = request.param('user');
        request.file('0').upload({
            maxBytes: 100 * 1024 * 1024
        }, function(err, files) {
            if (err) return response.send(400, {
                result: false,
                error: err
            });
            if (!files) return response.send(400, {
                result: false,
                error: 'Unable to upload file'
            });
            fs.renameSync(files[0].fd, files[0].fd.replace('backend/.tmp/uploads', 'frontend/src/app/assets/pictures'));
            files[0].fd = files[0].fd.replace(/.*?tmp\/uploads\//, '');
            response.send({
                result: true,
                files: files
            });
        });
    },
    getabtestsstats: function(request, response) {
        var user = request.param('user');
        var ID = request.param('id');

        var startDate = request.param('startDate');
        var endDate = request.param('endDate');

        var searchstring = ' AND (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';

        var query = 'select tdata.MinDate, (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, tdata.AvCPC, tdata.EndDate, ' +
            '(SUM(tdata.Revenue*tdata.Profit)-SUM(tdata.Cost)) AS Profit, ' +
            'AVG(tdata.Conversion) as Conversion, SUM(tdata.Cost) AS Cost, SUM(tdata.Clicks) AS Clicks,' +
            ' SUM(tdata.Orders) AS Orders, SUM(tdata.Revenue) as Revenue, SUM(tdata.Impressions) AS Impressions ' +
            'FROM (SELECT MIN(c.`Start Date`) AS MinDate, MAX(c.`End Date`) ' +
            'AS EndDate, sum(c.`1-week Other SKU Units Ordered Product Sales`) AS  Revenue, IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)' +
            '/p.average_selling_price) IS NULL, m.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)' +
            '/p.average_selling_price)) AS Profit, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.`Clicks`) as AvCPC, sum(c.`Total spend`) AS Cost, sum(c.`Impressions`) AS Impressions, AVG(c.`1-week Conversion Rate`) as Conversion, sum(c.`Clicks`) AS Clicks, sum(c.`1-week Other SKU Units Ordered`) ' +
            'AS Orders FROM productadsreport2 c, listing_reports_data p, mws m WHERE c.user=' + user + ' and m.user=' + user + ' and p.id=' + ID +
            ' and c.`Advertised SKU`= p.sku AND (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0) AND p.user=c.user  ' + searchstring + ' GROUP BY p.sku) tdata';

        sails.models.product.query(query, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        });
    }
});
