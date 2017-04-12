'use strict';
var fs = require('fs');
var atob = require('atob');

var iconv = require('iconv-lite');

var _ = require('lodash');

var Async = require('async');

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
    upload_keywords: function(request, response) {
        var uploaded_keywords = [];
        var filterOptions = request.param('to_decode');
        var keywordsList = request.param('to_decode1');

        var campaign = filterOptions.campaign;
        var SKU = filterOptions.SKU;
        var user = filterOptions.user;

        var matched = '';
        if (filterOptions.match1 && filterOptions.match1 !== 'ANY') {
            matched = ' AND c.`Match Type` LIKE \'' + filterOptions.match1 + '\' ';
        }

        if (typeof SKU !== 'string' && !(SKU instanceof String)) {
            SKU = SKU.join("','");
        }

        if (typeof campaign === 'string' || campaign instanceof String) {
            campaign = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign) + '\'';
        } else {
            for (var i = 0; i < campaign.length; i++) {
                campaign[i] = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign[i]) + '\'';
            }
            campaign = '(' + campaign.join(" OR ") + ')';
        }

        var searchstring = '';
        if (filterOptions.startDate) {
            searchstring = ' AND (c.`Last Day of Impression` BETWEEN \'' + filterOptions.startDate.replace(/"/, '') + '\' AND \'' +
                filterOptions.endDate.replace(/"/, '') + '\')';
        }

        if (typeof keywordsList === 'undefined' || keywordsList === null) {
            request.file('0').upload({
                maxBytes: 100 * 1024 * 1024
            }, function(err, files) {
                var fromread = "utf8";
                var filename = files[0].fd;
                var ii = 0;
                var keyword_line = 0;

                function readLines(input, func) {
                    var remaining = '';

                    input.on('data', function(data) {
                        remaining += data;
                        var index = remaining.indexOf('\n');
                        var last = 0;
                        while (index > -1) {
                            var line = remaining.substring(last, index);
                            last = index + 1;
                            func(line);
                            index = remaining.indexOf('\n', last);
                        }

                        remaining = remaining.substring(last);
                    });

                    input.on('end', function() {
                        if (remaining.length > 0) {
                            func(remaining);
                        }

                        var query = 'SELECT * ' +
                            'FROM (SELECT tdata.ACos, tdata.Keyword as Keyword, (tdata.Clicks / tdata.Impressions) AS CTR, tdata.AvCPC, tdata.Profit as Profit, ' +
                            'tdata.Revenue * tdata.Profit-tdata.Cost AS Profit1, tdata.Cost AS Cost, tdata.Clicks AS Clicks,' +
                            ' tdata.Orders AS Orders, tdata.Revenue as Revenue, tdata.Impressions AS Impressions, tdata.Match1 as Match1 from ' +
                            '(SELECT c.`Match Type` as Match1, c.Keyword, sum(c.`1-month Ordered Product Sales`) AS  Revenue, ' +
                            'm.average_profit/100 AS Profit, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) as AvCPC, ' +
                            'sum(c.`Total spend`) AS Cost, SUM(c.`Impressions`) AS Impressions, SUM(c.`Clicks`) AS Clicks,' +
                            ' sum(c.`1-month Orders Placed`) ' +
                            'AS Orders, sum(c.`Total spend`)/sum(c.`1-month Ordered Product Sales`)*100 as ACoS ' +
                            'FROM keywordsreport2 c, mws m ' +
                            'WHERE m.user=' + user + matched + ' and c.user=' + user + ' and ' + campaign +
                            ' ' + searchstring + ' GROUP BY c.Keyword) tdata order by Profit1 DESC) t';

                        sails.models.product.query(query, function(err, results) {
                            if (err) {
                              return response.serverError(err);
                            }
                            var res = results.map(function(e) {
                                return e.Keyword.toLowerCase();
                            });
                            var myArray = uploaded_keywords.filter(function(el) {
                                return res.indexOf(el.Keyword.toLowerCase()) < 0;
                            });
                            return response.ok(myArray);
                        });
                    });
                }

                function func(data) {
                    ii++;
                    var rows = data.toString().split(',');

                    if (ii == 1) {
                        keyword_line = rows.indexOf('Keyword');
                        if (keyword_line < 0) keyword_line = rows.indexOf('phrase');
                    } else {
                        uploaded_keywords.push({
                            Keyword: rows[keyword_line].replace(/["]+/g, '')
                        });
                    }
                }

                readLines(fs.createReadStream(filename), func);
            });
        } else {
            _.forEach(keywordsList, function(value, key) {
                keywordsList[key] = value.toLowerCase();
            });

            var query = 'SELECT DISTINCT Keyword FROM keywordsreport2 c ' +
                'WHERE c.user=' + user + ' and ' + campaign + searchstring;

            sails.models.product.query(query, function (err, results) {
                if (err) {
                  return response.serverError(err);
                }

                var lowerCasedResults = results.map(function (row) {
                    return row.Keyword.toLowerCase();
                });

                var filteredKeywords = keywordsList.filter(function (keyword) {
                    return lowerCasedResults.indexOf(keyword) < 0;
                });

                return response.ok({
                  keywords: filteredKeywords,
                });
            });
        }
    },
    gettopCampaigns: function (request, response) {
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var user = request.param('user');
        var searchstring = '';

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' AND (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\') ';
        }

        var query =
            'SELECT ' +
              'tdata.acos1, tdata.CampaignId, tdata.Campaign, (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, tdata.AvCPC, ' +
              '(SUM(tdata.Revenue * tdata.Profit) - SUM(tdata.Cost)) AS Profit, ' +
              'SUM(tdata.Cost) AS Cost, SUM(tdata.Clicks) AS Clicks, SUM(tdata.Orders) AS Orders, SUM(tdata.Revenue) AS Revenue, ' +
              'SUM(tdata.Impressions) AS Impressions, (tdata.Orders/tdata.Clicks*100) AS conversionRate ' +
            'FROM (' +
              'SELECT ' +
                'p.id, p.sku, ' +
                'IF(((p.average_selling_price - p.cost_per_unit - p.total_shipping_costs - p.additional_per_unit_costs - p.amazon_FBA_fees) / p.average_selling_price) IS NULL, ' +
                  'm.average_profit / 100, ' +
                  '((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)) AS Profit, ' +
                'c.`Campaign Id` AS CampaignId, c.`Campaign Name` AS Campaign, ' +
                'SUM(c.`1-week Other SKU Units Ordered Product Sales`) AS Revenue, ' +
                'SUM(c.`Total spend`) AS Cost, SUM(c.`Impressions`) AS Impressions, ' +
                'SUM(c.`Clicks`) AS Clicks, SUM(c.`Average CPC` * c.`Clicks`) / SUM(c.Clicks) AS AvCPC, ' +
                'IF(EXISTS(SELECT acos FROM campaigns WHERE user=' + user + ' AND name LIKE c.`Campaign Name`), ' +
                  '(SELECT AVG(acos) FROM campaigns WHERE user=' + user + ' AND name LIKE c.`Campaign Name`), NULL) AS acos1, ' +
                  'SUM(c.`1-week Other SKU Units Ordered`) AS Orders ' +
              'FROM productadsreport2 c, listing_reports_data p, mws m ' +
              'WHERE m.user=' + user + ' and c.user=' + user +
                ' AND c.`Advertised SKU`= p.sku AND (p.allowed = 1 or ' +
                '(' +
                  'SELECT t.max_sku ' +
                  'FROM mws m, subscriptions s, tariffs t ' +
                  'WHERE s.id = m.subscription_id and m.user = ' + user + ' AND t.name = s.plan_id' +
                ') = 0) AND p.user = c.user ' + searchstring +
              'GROUP BY c.`Campaign Name`, p.sku ' +
              'ORDER BY Revenue DESC' +
            ') tdata ' +
            'GROUP BY tdata.Campaign';

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getChartbyCampaign: function(request, response) {
        var campaign = mysqlEscape(request.param('campaign'));
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var user = request.param('user');
        var searchstring = '';

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' AND (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var query = 'SELECT tdata.EndDate, (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, tdata.AvCPC, ' +
            '(SUM(tdata.Revenue*tdata.Profit)-SUM(tdata.Cost)) AS Profit, SUM(tdata.Cost) AS Cost, SUM(tdata.Clicks) AS Clicks,' +
            ' SUM(tdata.Orders) AS Orders,        SUM(tdata.Revenue) AS Revenue,            SUM(tdata.Impressions) AS Impressions FROM      ' +
            '  (SELECT p.id, p.sku, IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price) IS NULL,' +
            '        m.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)) AS Profit,' +
            '            c.`End Date` AS EndDate, sum(c.`1-week Other SKU Units Ordered Product Sales`) AS  Revenue, sum(c.`Total spend`) AS Cost,' +
            '            sum(c.`Impressions`) AS Impressions,' +
            '            sum(c.`Clicks`) AS Clicks, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) AS AvCPC, sum(c.`1-week Other SKU Units Ordered`) ' +
            'AS Orders FROM productadsreport2 c , listing_reports_data p, mws m WHERE c.user=' + user + ' AND m.user=' + user +
            '        AND c.`Advertised SKU`= p.sku AND (p.allowed=1 OR (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t ' +
            'WHERE s.id=m.subscription_id AND m.user=' + user + ' AND t.name=s.plan_id)=0) AND p.user=c.user  AND c.`Campaign Name` LIKE \'' + campaign + '\'' +
            '        GROUP BY c.`End Date`, p.sku ORDER BY c.`End Date`) tdata GROUP BY tdata.EndDate';

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    gettopKPI: function (request, response) {
        var campaign = mysqlEscape(request.param('campaign'));
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var user = request.param('user');

        var searchstring = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' AND (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var query =
            'SELECT ' +
              'tdata.id, IF(tdata.acos1 is NULL, 40, tdata.acos1) AS acos1, (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, ' +
              'tdata.AvCPC, tdata.Campaign, tdata.MinDate, tdata.EndDate, ' +
              '(SUM(tdata.Revenue*tdata.Profit) - SUM(tdata.Cost)) AS Profit, ' +
              'SUM(tdata.Cost) AS Cost, SUM(tdata.Clicks) AS Clicks, ' +
              'SUM(tdata.Orders) AS Orders, SUM(tdata.Revenue) AS Revenue, ' +
              'SUM(tdata.Impressions) AS Impressions ' +
            'FROM (' +
              'SELECT ' +
                'c.`Campaign Name` AS Campaign, MIN(c.`Start Date`) AS MinDate, MAX(c.`End Date`) AS EndDate, ' +
                'SUM(c.`1-week Other SKU Units Ordered Product Sales`) AS Revenue, ' +
                'IF(((p.average_selling_price - p.cost_per_unit - p.total_shipping_costs - p.additional_per_unit_costs - p.amazon_FBA_fees) / p.average_selling_price) IS NULL, ' +
                  'm.average_profit / 100, ' +
                  '((p.average_selling_price - p.cost_per_unit - p.total_shipping_costs - p.additional_per_unit_costs - p.amazon_FBA_fees) / p.average_selling_price)) AS Profit, ' +
                '(SELECT id FROM campaigns WHERE user = ' + user + ' AND name LIKE \'' + campaign + '\') AS id, ' +
                'IF(EXISTS(SELECT acos FROM campaigns WHERE user=' + user + ' AND name LIKE \'' + campaign + '\'), ' +
                  '(SELECT acos FROM campaigns WHERE user=' + user + ' AND name LIKE \'' + campaign + '\'), NULL) AS acos1, ' +
                'SUM(c.`Total spend`) AS Cost, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) AS AvCPC, SUM(c.`Impressions`) AS Impressions, ' +
                'SUM(c.`Clicks`) AS Clicks, SUM(c.`1-week Other SKU Units Ordered`) AS Orders ' +
              'FROM productadsreport2 c, listing_reports_data p, mws m ' +
              'WHERE m.user = ' + user + ' AND c.user=' + user + ' AND c.`Campaign Name` LIKE \'' + campaign +
                '\' AND c.`Advertised SKU` = p.sku AND (p.allowed = 1 OR (' +
                  'SELECT t.max_sku ' +
                  'FROM mws m, subscriptions s, tariffs t ' +
                  'WHERE s.id = m.subscription_id AND m.user = ' + user + ' AND t.name = s.plan_id) = 0) AND p.user = c.user  ' + searchstring + ' GROUP BY p.sku ' +
            ') tdata';

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getChartbyKeyword: function(request, response) {
        var campaign = request.param('campaign');
        var keyword = request.param('keyword');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var user = request.param('user');
        var searchstring = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\') ';
        }

        var query = 'SELECT tdata.Campaign, (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, ' +
            'tdata.AvCPC, tdata.EndDate, (SUM(tdata.Revenue*tdata.Profit)-SUM(tdata.Cost)) AS Profit, SUM(tdata.Cost) AS Cost, SUM(tdata.Clicks) AS Clicks, SUM(tdata.Orders) AS Orders, SUM(tdata.Revenue) as Revenue,' +
            ' SUM(tdata.Impressions) AS Impressions from ' +
            '(SELECT c.`Campaign Name` as Campaign, m.average_profit/100 AS Profit,' +
            ' c.`End Date` AS EndDate, sum(c.`1-week Other SKU Units Ordered Product Sales`) AS  Revenue, sum(c.`Total spend`) AS Cost, sum(c.`Impressions`) AS Impressions, ' +
            'sum(c.`Clicks`) AS Clicks, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) as AvCPC, sum(c.`1-week Other SKU Units Ordered`) AS Orders ' +
            'FROM keywordsreport2 c, mws m WHERE m.user=' + user + ' AND' +
            ' c.user=' + user + ' and c.`Campaign Name` LIKE \'' + mysqlEscape(campaign) + '\'  and c.Keyword LIKE \'' + mysqlEscape(keyword) + '\'  ' +
            ' ' + searchstring +
            ' GROUP BY c.`End Date` ORDER BY c.`End Date`) tdata GROUP BY tdata.EndDate';

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getChartbySearch: function(request, response) {
        var campaign = request.param('campaign');
        var keyword = request.param('keyword');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var user = request.param('user');
        var searchstring = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`Last Day of Impression` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\') ';
        }

        var query =
            'SELECT ' +
              'tdata.ACoS as ACoS, (tdata.Clicks / tdata.Impressions) AS CTR, ' +
              'tdata.AvCPC, tdata.Keyword as Keyword, tdata.Search as Search, tdata.Cost AS Cost, tdata.Clicks AS Clicks,' +
              'tdata.Orders AS Orders, tdata.Revenue as Revenue, tdata.Impressions AS Impressions ' +
            'FROM (' +
              'SELECT c.`Customer Search Term` AS Search, c.`Campaign Name` as Campaign, c.Keyword,' +
                'sum(c.`Product Sales within 1-week of a click`) AS  Revenue, sum(c.`Total spend`) AS Cost,  AVG(c.`ACoS`) as ACoS,' +
                'sum(c.`Impressions`) AS Impressions, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) as AvCPC, ' +
                'sum(c.`Clicks`) AS Clicks, sum(c.`Orders placed within 1-week of a click`) AS Orders ' +
              'FROM searchtermreport2 c ' +
              'WHERE c.user=' + user + ' AND c.`Customer Search Term` LIKE \'' + mysqlEscape(keyword) +
              '\' AND c.`Campaign Name` LIKE \'' + mysqlEscape(campaign) + '\' ' + searchstring + ' ' +
              'GROUP BY c.`Last Day of Impression`' +
            ') tdata ' +
            'ORDER BY tdata.Cost DESC';

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    customQuery: function statistics(request, response) {
        var campaign = mysqlEscape(request.param('campaign'));
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var order = request.param('order');
        var user = request.param('user');
        var searchstring = '';

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

        var adgroup = request.param('adgroup');
        var sgr = '';
        if (typeof adgroup !== 'undefined' && adgroup !== null && adgroup !== '1ALL1') {
            sgr = ' and c.`Ad Group Name` LIKE \'' + mysqlEscape(adgroup) + '\' ';
        }

        var matched = '';
        if (typeof match1 !== 'undefined' && match1 !== null && match1 !== 'ANY') {
            matched = ' AND c.`Match Type` LIKE \'' + match1 + '\' ';
        }

        var order1 = '';
        if (order === 'DESC') {
            order1 = ' WHERE tdata.Revenue*tdata.Profit-tdata.Cost>0 ';
        } else {
            order1 = ' WHERE tdata.Revenue*tdata.Profit-tdata.Cost<=0 and tdata.Cost>0 ';
        }

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var newbid = 'IF(tdata.acos1 is NULL, 40, tdata.acos1) as acos1';

        newbid = 'IF( tdata.Clicks<10,"n/a", IF(tdata.AvCPC*(100-tdata.Cost/tdata.Revenue*100+40)/100>0.02,TRUNCATE(tdata.AvCPC*(100-tdata.Cost/tdata.Revenue*100+40)/100,2), 0.02) ) as newbid, ';

        var queryStr = 'SELECT * FROM (SELECT tdata.Keyword as Keyword, (tdata.Clicks / tdata.Impressions) AS CTR, ' +
            'tdata.ACoS, tdata.AvCPC, tdata.Profit as Profit,' + newbid +
            ' tdata.Revenue*tdata.Profit-tdata.Cost AS Profit1, tdata.Cost AS Cost, tdata.Clicks AS Clicks,' +
            ' tdata.Orders AS Orders, tdata.Revenue as Revenue, tdata.Impressions AS Impressions, (tdata.Orders/tdata.Clicks*100) as conversionRate, tdata.Match1 as Match1 from (SELECT c.`Match Type` as Match1, c.Keyword,' +
            ' sum(c.`1-month Ordered Product Sales`) AS  Revenue, m.average_profit/100 AS Profit, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) as AvCPC, ' +
            'sum(c.`Total spend`) AS Cost, sum(c.`Impressions`) AS Impressions, sum(c.`Clicks`) AS Clicks, sum(c.`1-month Orders Placed`) ' +
            'AS Orders, sum(c.`Total spend`)/sum(c.`1-month Ordered Product Sales`)*100 as ACoS FROM keywordsreport2 c, mws m' +
            ' WHERE  m.user=' + user + matched + ' and c.user=' + user + sgr + ' and c.`Campaign Name` LIKE \'' + campaign + '\' ' +
            ' ' + searchstring + ' GROUP BY c.Keyword) tdata ' + order1 + ' order by Profit1 ' + order + ') t where ' +
            't.Profit1>=' + profitfrom +
            ' and t.Profit1<=' + profitto +
            ' and t.Revenue>=' + revenuefrom +
            ' and t.Revenue<=' + revenueto +
            ' and t.Cost>=' + adspendfrom +
            ' and t.Cost<=' + adspendto +
            ' and (t.ACoS>' + acosfrom +
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
            ' and t.conversionRate<=' + conversionRateTo;

        sails.models.product.query(queryStr, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    keywordsForCampaignAcos: function (request, response) {
        var campaign = mysqlEscape(request.param('campaign'));
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var order = request.param('order');
        var user = request.param('user');
        var saveacos = request.param('saveacos');

        var adgroup = request.param('adgroup');
        var sgr = '';
        if (typeof adgroup !== 'undefined' && adgroup !== null && adgroup !== '1ALL1') {
            sgr = ' AND c.`Ad Group Name` LIKE \'' + mysqlEscape(adgroup) + '\' ';
        }

        var matched = '';
        if (typeof request.param('match1') !== 'undefined' &&
            request.param('match1') !== 'ANY') {
            matched = ' AND c.`Match Type` LIKE \'' + request.param('match1') + '\' ';
        }

        if (typeof saveacos == 'undefined' || saveacos == null || saveacos == '') {
          saveacos = 40;
        }

        var order1 = '';
        if (order === 'DESC') {
            order1 = ' WHERE tdata.ACoS > 0 AND tdata.ACoS <' + saveacos;
        } else {
            order1 = ' WHERE (tdata.ACoS < 0 OR tdata.ACoS >' + saveacos + ' OR tdata.ACoS IS NULL)';
        }

        var searchstring = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' AND (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var newbid = 'IF(tdata.Clicks < 10, "n/a", ' +
          'IF((' + saveacos + ' / 100 * tdata.Revenue) / tdata.Clicks > 0.02, ' +
          'TRUNCATE((' + saveacos + ' / 100 * tdata.Revenue) / tdata.Clicks, 2), 0.02)) AS newbid, ';

        var conditions = [];
        if (typeof request.param('profitfrom') !== 'undefined') {
          conditions.push('t.Profit1 >= ' + parseInt(request.param('profitfrom')));
        }
        if (typeof request.param('profitto') !== 'undefined') {
          conditions.push('t.Profit1 <= ' + parseInt(request.param('profitto')));
        }
        if (typeof request.param('revenuefrom') !== 'undefined') {
          conditions.push('t.Revenue >= ' + parseInt(request.param('revenuefrom')));
        }
        if (typeof request.param('revenueto') !== 'undefined') {
          conditions.push('t.Revenue <= ' + parseInt(request.param('revenueto')));
        }
        if (typeof request.param('adspendfrom') !== 'undefined') {
          conditions.push('t.Cost >= ' + parseInt(request.param('adspendfrom')));
        }
        if (typeof request.param('adspendto') !== 'undefined') {
          conditions.push('t.Cost <= ' + parseInt(request.param('adspendto')));
        }
        if (typeof request.param('impressionsfrom') !== 'undefined') {
          conditions.push('t.Impressions >= ' + parseInt(request.param('impressionsfrom')));
        }
        if (typeof request.param('impressionsto') !== 'undefined') {
          conditions.push('t.Impressions <= ' + parseInt(request.param('impressionsto')));
        }
        if (typeof request.param('clicksfrom') !== 'undefined') {
          conditions.push('t.Clicks >= ' + parseInt(request.param('clicksfrom')));
        }
        if (typeof request.param('clicksto') !== 'undefined') {
          conditions.push('t.Clicks <= ' + parseInt(request.param('clicksto')));
        }
        if (typeof request.param('ctrfrom') !== 'undefined') {
          conditions.push('t.CTR >= ' + parseInt(request.param('ctrfrom')));
        }
        if (typeof request.param('ctrto') !== 'undefined') {
          conditions.push('t.CTR <= ' + parseInt(request.param('ctrto')));
        }
        if (typeof request.param('avecpcfrom') !== 'undefined') {
          conditions.push('t.AvCPC >= ' + parseInt(request.param('avecpcfrom')));
        }
        if (typeof request.param('avecpcto') !== 'undefined') {
          conditions.push('t.AvCPC <= ' + parseInt(request.param('avecpcto')));
        }
        if (typeof request.param('ordersFrom') !== 'undefined') {
          conditions.push('t.Orders >= ' + parseInt(request.param('ordersFrom')));
        }
        if (typeof request.param('ordersTo') !== 'undefined') {
          conditions.push('t.Orders <= ' + parseInt(request.param('ordersTo')));
        }
        if (typeof request.param('conversionRateFrom') !== 'undefined') {
          conditions.push('t.conversionRate >= ' + parseInt(request.param('conversionRateFrom')));
        }
        if (typeof request.param('conversionRateTo') !== 'undefined') {
          conditions.push('t.conversionRate <= ' + parseInt(request.param('conversionRateTo')));
        }

        var acosConditions = [];
        if (typeof request.param('acosfrom') !== 'undefined') {
          acosConditions.push('t.ACoS > ' + parseFloat(request.param('acosfrom')));
        }
        if (typeof request.param('acosto') !== 'undefined') {
          acosConditions.push('t.ACoS <= ' + parseFloat(request.param('acosto')));
        }
        if (acosConditions.length) {
          conditions.push('t.ACoS IS NULL OR (' + acosConditions.join(' AND ') + ')');
        }

        if (conditions.length) {
          conditions = 'WHERE ' + conditions.join(' AND ');
        } else {
          conditions = '';
        }

        var queryStr = 'SELECT * ' +
            'FROM (' +
              'SELECT ' +
                'tdata.Keyword AS Keyword, (tdata.Clicks / tdata.Impressions) AS CTR, ' +
                'tdata.ACoS, tdata.AvCPC, tdata.Profit AS Profit,' + newbid +
                ' tdata.Revenue * tdata.Profit - tdata.Cost AS Profit1, ' +
                'tdata.Cost AS Cost, tdata.Clicks AS Clicks, ' +
                'tdata.Orders AS Orders, tdata.Revenue AS Revenue, tdata.Impressions AS Impressions, ' +
                '(tdata.Orders / tdata.Clicks * 100) AS conversionRate, tdata.Match1 AS Match1 ' +
              'FROM (' +
                'SELECT ' +
                  'c.`Match Type` AS Match1, c.Keyword, ' +
                  'SUM(c.`1-month Ordered Product Sales`) AS Revenue, m.average_profit / 100 AS Profit, ' +
                  'SUM(c.`Average CPC` * c.`Clicks`) / SUM(c.Clicks) AS AvCPC, ' +
                  'SUM(c.`Total spend`) AS Cost, SUM(c.`Impressions`) AS Impressions, ' +
                  'SUM(c.`Clicks`) AS Clicks, SUM(c.`1-month Orders Placed`) AS Orders, ' +
                  'SUM(c.`Total spend`) / SUM(c.`1-month Ordered Product Sales`) * 100 AS ACoS ' +
                'FROM keywordsreport2 c, mws m ' +
                'WHERE m.user = ' + user + matched +
                  ' AND c.user=' + user + sgr +
                  ' AND c.`Campaign Name` LIKE \'' + campaign + '\' ' + searchstring +
                ' GROUP BY c.Keyword' +
              ') tdata ' +
              order1 +
            ') t ' + conditions;

        sails.models.product.query(queryStr, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    keywordsForOptimizer: function (request, response) {
        var campaign = mysqlEscape(request.param('campaign'));
        var user = request.param('user');

        var adgroupCondition = '';
        if (typeof request.param('adgroup') !== 'undefined') {
            adgroupCondition = ' AND c.`Ad Group Name` LIKE \'' + mysqlEscape(request.param('adgroup')) + '\' ';
        }

        var dateRangeCondition = ' AND (c.`End Date` BETWEEN \'' + request.param('startDate').replace(/"/, '') +
            '\' AND \'' + request.param('endDate').replace(/"/, '') + '\') ';

        var queryStr = 'SELECT * ' +
            'FROM (' +
              'SELECT ' +
                'tdata.Keyword AS Keyword, (tdata.Clicks / tdata.Impressions) AS CTR, ' +
                'tdata.ACoS, tdata.AvCPC, tdata.Profit AS Profit, ' +
                'tdata.Cost AS Cost, tdata.Clicks AS Clicks, ' +
                'tdata.Orders AS Orders, tdata.Revenue AS Revenue, tdata.Impressions AS Impressions, ' +
                '(tdata.Orders / tdata.Clicks * 100) AS conversionRate, tdata.Match1 AS Match1 ' +
              'FROM (' +
                'SELECT ' +
                  'c.`Match Type` AS Match1, c.Keyword, ' +
                  'SUM(c.`1-month Ordered Product Sales`) AS Revenue, ' +
                  'm.average_profit / 100 AS Profit, ' +
                  'SUM(c.`Average CPC` * c.`Clicks`) / SUM(c.Clicks) AS AvCPC, ' +
                  'SUM(c.`Total spend`) AS Cost, ' +
                  'SUM(c.`Impressions`) AS Impressions, ' +
                  'SUM(c.`Clicks`) AS Clicks, SUM(c.`1-month Orders Placed`) AS Orders, ' +
                  'SUM(c.`Total spend`) / SUM(c.`1-month Ordered Product Sales`) * 100 AS ACoS ' +
                'FROM keywordsreport2 c, mws m ' +
                'WHERE ' +
                  'm.user = ' + user +
                  ' AND c.user=' + user +
                  ' AND c.`Match Type` <> \'exact\'' +
                  ' AND c.`Campaign Name` LIKE \'' + campaign + '\' ' +
                  adgroupCondition + dateRangeCondition +
                'GROUP BY c.Keyword' +
              ') tdata ' +
              'WHERE tdata.Revenue <> 0' +
            ') t';

        sails.models.product.query(queryStr, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    searchbyACoS: function(request, response) {
        var campaign = mysqlEscape(request.param('campaign'));
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var user = parseInt(request.param('user'));
        var adgroup = request.param('adgroup');

        var sgr = '';
        if (typeof adgroup !== 'undefined' && adgroup !== null && adgroup !== '1ALL1') {
            sgr = ' and c.`Ad Group Name` LIKE \'' + mysqlEscape(adgroup) + '\' ';
        }

        var matched = '';
        if (typeof request.param('match1') !== 'undefined' && request.param('match1') !== 'ANY') {
            matched = ' AND c.`Match Type` LIKE \'' + request.param('match1') + '\' ';
        }

        var searchstring = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' AND (c.`Last Day of Impression` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        if (typeof request.param('searchterm_only') !== 'undefined' && request.param('searchterm_only') === 'true') {
            searchstring += ' AND c.`Customer Search Term` NOT IN (SELECT `Keyword` from keywordsreport2 WHERE `Campaign Name` LIKE c.`Campaign Name`)'
        }

        var conditions = [];
        if (typeof request.param('revenuefrom') !== 'undefined') {
          conditions.push('t.Revenue >= ' + parseInt(request.param('revenuefrom')));
        }
        if (typeof request.param('revenueto') !== 'undefined') {
          conditions.push('t.Revenue <= ' + parseInt(request.param('revenueto')));
        }
        if (typeof request.param('adspendfrom') !== 'undefined') {
          conditions.push('t.Cost >= ' + parseInt(request.param('adspendfrom')));
        }
        if (typeof request.param('adspendto') !== 'undefined') {
          conditions.push('t.Cost <= ' + parseInt(request.param('adspendto')));
        }
        if (typeof request.param('impressionsfrom') !== 'undefined') {
          conditions.push('t.Impressions >= ' + parseInt(request.param('impressionsfrom')));
        }
        if (typeof request.param('impressionsto') !== 'undefined') {
          conditions.push('t.Impressions <= ' + parseInt(request.param('impressionsto')));
        }
        if (typeof request.param('clicksfrom') !== 'undefined') {
          conditions.push('t.Clicks >= ' + parseInt(request.param('clicksfrom')));
        }
        if (typeof request.param('clicksto') !== 'undefined') {
          conditions.push('t.Clicks <= ' + parseInt(request.param('clicksto')));
        }
        if (typeof request.param('ctrfrom') !== 'undefined') {
          conditions.push('t.CTR >= ' + parseInt(request.param('ctrfrom')));
        }
        if (typeof request.param('ctrto') !== 'undefined') {
          conditions.push('t.CTR <= ' + parseInt(request.param('ctrto')));
        }
        if (typeof request.param('avecpcfrom') !== 'undefined') {
          conditions.push('t.AvCPC >= ' + parseInt(request.param('avecpcfrom')));
        }
        if (typeof request.param('avecpcto') !== 'undefined') {
          conditions.push('t.AvCPC <= ' + parseInt(request.param('avecpcto')));
        }
        if (typeof request.param('ordersFrom') !== 'undefined') {
          conditions.push('t.Orders >= ' + parseInt(request.param('ordersFrom')));
        }
        if (typeof request.param('ordersTo') !== 'undefined') {
          conditions.push('t.Orders <= ' + parseInt(request.param('ordersTo')));
        }
        if (typeof request.param('conversionRateFrom') !== 'undefined') {
          conditions.push('t.conversionRate >= ' + parseInt(request.param('conversionRateFrom')));
        }
        if (typeof request.param('conversionRateTo') !== 'undefined') {
          conditions.push('t.conversionRate <= ' + parseInt(request.param('conversionRateTo')));
        }

        // FIXME: Here the 'order' means whether to retrieve profitable keywords (order = ASC)
        // or nonprofitable ones (order=DESC).
        if (typeof request.param('order') !== 'undefined' && request.param('order') === 'DESC') {
            var acosfrom = request.param('acosfrom');
            var acosto = request.param('acosto');
            acosfrom = Math.max(acosfrom, 0);
            conditions.push('(t.acos <= ' + acosfrom + ' OR t.acos > ' + acosto + ')');
        } else {
            if (typeof request.param('acosfrom') !== 'undefined') {
                conditions.push('t.acos > ' + parseInt(request.param('acosfrom')));
            }
            if (typeof request.param('acosto') !== 'undefined') {
                conditions.push('t.acos <= ' + parseInt(request.param('acosto')));
            }
        }

        conditions = conditions.join(' AND ');

        var queryStr = 'SELECT * ' +
            'FROM (' +
              'SELECT IF(tdata.Revenue > 0,tdata.Cost / tdata.Revenue*100, 0) AS acos, ' +
                '(tdata.Clicks / tdata.Impressions) AS CTR, ' +
                'tdata.AvCPC, tdata.Keyword as Keyword, tdata.Search as Search, tdata.Cost AS Cost, ' +
                'tdata.Last_Day_Of_Impression, ' +
                'tdata.Clicks AS Clicks, ' +
                'tdata.Orders AS Orders, (tdata.Orders/tdata.Clicks*100) as conversionRate, tdata.Revenue as Revenue, ' +
                'tdata.Impressions AS Impressions, tdata.Match1 as Match1 ' +
              'FROM (' +
                'SELECT ' +
                  'c.`Match Type` as Match1, ' +
                  'c.`Customer Search Term` AS Search, ' +
                  'c.`Campaign Name` AS Campaign, ' +
                  'c.Keyword, ' +
                  'c.`Last Day of Impression` AS Last_Day_Of_Impression, ' +
                  'SUM(c.`Product Sales within 1-week of a click`) AS  Revenue, SUM(c.`Total spend`) AS Cost,  AVG(c.`ACoS`) as ACoS,' +
                  'SUM(c.`Impressions`) AS Impressions, ' +
                  'SUM(c.`Average CPC` * c.`Clicks`) / SUM(c.Clicks) as AvCPC, ' +
                  'SUM(c.`Clicks`) AS Clicks, SUM(c.`Orders placed within 1-week of a click`) AS Orders ' +
                'FROM searchtermreport2 c ' +
                'WHERE c.user=' + user + matched + sgr + ' AND c.`Campaign Name` LIKE \'' + campaign + '\' ' + searchstring + ' ' +
                ' AND c.`Customer Search Term` <> "" ' + // FIXME!
                'GROUP BY CONCAT(LENGTH(`Customer search term`), c.`Customer Search Term`)' +
              ') tdata ' +
              'WHERE tdata.Cost > 0 ' +
            ') t ' +
            'WHERE ' + conditions;

        sails.models.product.query(queryStr, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    searchbyACoSmult: function (request, response) {
        var campaign = request.param('campaign');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var acosfrom1 = request.param('acosfrom1');
        var acostill = request.param('acostill');
        var SKU = request.param('SKU');
        var user = request.param('user');

        var matched = '';
        if (typeof request.param('match1') !== 'undefined' &&
            request.param('match1') !== 'ANY') {
            matched = ' AND c.`Match Type` LIKE \'' + request.param('match1') + '\' ';
        }

        if (typeof campaign === 'string' || campaign instanceof String) {
            campaign = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign) + '\'';
        } else {
            for (var i = 0; i < campaign.length; i++) {
                campaign[i] = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign[i]) + '\'';
            }
            campaign = '(' + campaign.join(" OR ") + ')';
        }

        if (typeof acosfrom1 === 'undefined' || acosfrom1 === null) {
            acosfrom1 = 30;
        }

        if (typeof acostill === 'undefined' || acostill === null) {
            acostill = -99999999;
        }

        var acosto = parseInt(acosfrom1);
        if (typeof request.param('acosto') !== 'undefined') {
          acosto = Math.min(acosto, parseInt(request.param('acosto')));
        }

        var acosfrom = Math.max(acostill, 0);
        if (typeof request.param('acosfrom') !== 'undefined') {
          acosfrom = Math.max(acosfrom, parseInt(request.param('acosfrom')));
        }

        var searchstring = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`Last Day of Impression` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var conditions = [];
        if (typeof request.param('revenuefrom') !== 'undefined') {
          conditions.push('t.Revenue >= ' + parseInt(request.param('revenuefrom')));
        }
        if (typeof request.param('revenueto') !== 'undefined') {
          conditions.push('t.Revenue <= ' + parseInt(request.param('revenueto')));
        }
        if (typeof request.param('adspendfrom') !== 'undefined') {
          conditions.push('t.Cost >= ' + parseInt(request.param('adspendfrom')));
        }
        if (typeof request.param('adspendto') !== 'undefined') {
          conditions.push('t.Cost <= ' + parseInt(request.param('adspendto')));
        }
        if (typeof request.param('impressionsfrom') !== 'undefined') {
          conditions.push('t.Impressions >= ' + parseInt(request.param('impressionsfrom')));
        }
        if (typeof request.param('impressionsto') !== 'undefined') {
          conditions.push('t.Impressions <= ' + parseInt(request.param('impressionsto')));
        }
        if (typeof request.param('clicksfrom') !== 'undefined') {
          conditions.push('t.Clicks >= ' + parseInt(request.param('clicksfrom')));
        }
        if (typeof request.param('clicksto') !== 'undefined') {
          conditions.push('t.Clicks <= ' + parseInt(request.param('clicksto')));
        }
        if (typeof request.param('ctrfrom') !== 'undefined') {
          conditions.push('t.CTR >= ' + parseInt(request.param('ctrfrom')));
        }
        if (typeof request.param('ctrto') !== 'undefined') {
          conditions.push('t.CTR <= ' + parseInt(request.param('ctrto')));
        }
        if (typeof request.param('avecpcfrom') !== 'undefined') {
          conditions.push('t.AvCPC >= ' + parseInt(request.param('avecpcfrom')));
        }
        if (typeof request.param('avecpcto') !== 'undefined') {
          conditions.push('t.AvCPC <= ' + parseInt(request.param('avecpcto')));
        }
        if (typeof request.param('ordersFrom') !== 'undefined') {
          conditions.push('t.Orders >= ' + parseInt(request.param('ordersFrom')));
        }
        if (typeof request.param('ordersTo') !== 'undefined') {
          conditions.push('t.Orders <= ' + parseInt(request.param('ordersTo')));
        }
        if (typeof request.param('conversionRateFrom') !== 'undefined') {
          conditions.push('t.conversionRate >= ' + parseInt(request.param('conversionRateFrom')));
        }
        if (typeof request.param('conversionRateTo') !== 'undefined') {
          conditions.push('t.conversionRate <= ' + parseInt(request.param('conversionRateTo')));
        }
        if (typeof request.param('profitfrom') !== 'undefined') {
          conditions.push('t.Profit1 >= ' + parseInt(request.param('profitfrom')));
        }
        if (typeof request.param('profitto') !== 'undefined') {
          conditions.push('t.Profit1 <= ' + parseInt(request.param('profitto')));
        }

        if (conditions.length) {
          conditions = ' AND ' + conditions.join(' AND ');
        } else {
          conditions = '';
        }

        var queryStr = 'SELECT * ' +
          'FROM (' +
            'SELECT ' +
              'IF(tdata.Revenue > 0, tdata.Cost / tdata.Revenue * 100, 0) AS ACoS, ' +
              '(tdata.Clicks / tdata.Impressions) AS CTR, ' +
              'tdata.AvCPC, ' +
              'tdata.Keyword AS Keyword, tdata.Search AS Search, ' +
              'tdata.Cost AS Cost, tdata.Clicks AS Clicks, ' +
              'tdata.Orders AS Orders, ' +
              '(tdata.Orders / tdata.Clicks * 100) AS conversionRate, ' +
              'tdata.Revenue AS Revenue, ' +
              'tdata.Impressions AS Impressions, ' +
              'tdata.Match1 AS Match1 ' +
            'FROM (' +
              'SELECT ' +
                'c.`Match Type` AS Match1, c.`Customer Search Term` AS Search, ' +
                'c.`Campaign Name` as Campaign, c.Keyword,' +
                'SUM(c.`Product Sales within 1-week of a click`) AS Revenue, SUM(c.`Total spend`) AS Cost, AVG(c.`ACoS`) as ACoS, ' +
                'SUM(c.`Impressions`) AS Impressions, SUM(c.`Average CPC` * c.`Clicks`) / SUM(c.Clicks) as AvCPC, ' +
                'SUM(c.`Clicks`) AS Clicks, SUM(c.`Orders placed within 1-week of a click`) AS Orders ' +
              'FROM searchtermreport2 c  ' +
              'WHERE c.user = ' + user + matched +
                ' AND ' + campaign + searchstring +
              ' GROUP BY CONCAT(LENGTH(`Customer search term`), c.`Customer Search Term`)' +
            ') tdata ' +
            'ORDER BY tdata.Cost DESC' +
          ') t ' +
          'WHERE t.ACoS > ' + acosfrom + ' AND t.ACoS <= ' + acosto + conditions;

        sails.models.product.query(queryStr, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getallgroups: function (request, response) {
        var campaign = request.param('campaign');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var user = request.param('user');

        if (typeof campaign === 'string' || campaign instanceof String) {
            campaign = mysqlEscape(campaign);
        } else if (campaign && campaign.length > 0) {
            for (var i = 0; i < campaign.length; i++) {
                campaign[i] = mysqlEscape(campaign[i]);
            }
            campaign = campaign.join("','");
        } else {
          campaign == '';
        }

        var searchstring = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' AND (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var queryStr = 'SELECT DISTINCT c.`Ad Group Name` AS AdGroup FROM productadsreport2 c ' +
          'WHERE c.user = ' + user + ' AND c.`Campaign Name` LIKE \'' + campaign + '\' ' + searchstring;

        sails.models.product.query(queryStr, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getbelowacos: function (request, response) {
        var campaign = request.param('campaign');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var acosfrom = request.param('acosfrom');
        var acostill = request.param('acostill');
        var adgroup = request.param('adgroup');
        var user = request.param('user');

        if (typeof campaign === 'string' || campaign instanceof String) {
            campaign = mysqlEscape(campaign);
        } else {
            for (var i = 0; i < campaign.length; i++) {
                campaign[i] = mysqlEscape(campaign[i]);
            }
            campaign = campaign.join("','");
        }

        var searchstring = '';
        var sgr = '';

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        if (typeof adgroup !== 'undefined' && adgroup !== null && adgroup !== '1ALL1') {
            sgr = ' and c.`Ad Group Name` LIKE \'' + mysqlEscape(adgroup) + '\' ';
        }

        var where = [];
        if (request.param('revenuefrom')) where.push({
            key: 'tdata.Revenue >=',
            value: request.param('revenuefrom')
        });
        if (request.param('revenueto')) where.push({
            key: 'tdata.Revenue <=',
            value: request.param('revenueto')
        });
        if (request.param('adspendfrom')) where.push({
            key: 'tdata.Cost >=',
            value: request.param('adspendfrom')
        });
        if (request.param('adspendto')) where.push({
            key: 'tdata.Cost <=',
            value: request.param('adspendto')
        });
        if (request.param('acosfrom')) where.push({
            key: 'tdata.ACoS >=',
            value: request.param('acosfrom')
        });
        if (request.param('acosto')) where.push({
            key: 'tdata.ACoS <=',
            value: request.param('acosto')
        });
        if (request.param('impressionsfrom')) where.push({
            key: 'tdata.Impressions >=',
            value: request.param('impressionsfrom')
        });
        if (request.param('impressionsto')) where.push({
            key: 'tdata.Impressions <=',
            value: request.param('impressionsto')
        });
        if (request.param('clicksfrom')) where.push({
            key: 'tdata.Clicks >=',
            value: request.param('clicksfrom')
        });
        if (request.param('clicksto')) where.push({
            key: 'tdata.Clicks <=',
            value: request.param('clicksto')
        });
        if (request.param('ctrfrom')) where.push({
            key: 'tdata.CTR >=',
            value: request.param('ctrfrom')
        });
        if (request.param('ctrto')) where.push({
            key: 'tdata.CTR <=',
            value: request.param('ctrto')
        });
        if (request.param('avecpcfrom')) where.push({
            key: 'tdata.AvCPC >=',
            value: request.param('avecpcfrom')
        });
        if (request.param('avecpcto')) where.push({
            key: 'tdata.AvCPC <=',
            value: request.param('avecpcto')
        });
        if (request.param('ordersFrom')) where.push({
            key: 'tdata.Orders >=',
            value: request.param('ordersFrom')
        });
        if (request.param('ordersTo')) where.push({
            key: 'tdata.Orders <=',
            value: request.param('ordersTo')
        });
        if (request.param('conversionRateFrom')) where.push({
            key: '(tdata.Orders/tdata.Clicks*100) >=',
            value: request.param('conversionRateFrom')
        });
        if (request.param('conversionRateTo')) where.push({
            key: '(tdata.Orders/tdata.Clicks*100) <=',
            value: request.param('conversionRateTo')
        });
        var match = null;
        if (request.param('match1') != 'ANY') {
            match = request.param('match1');
        }

        sails.models.product.query(sails.models.product.escapeQuery('SELECT lrd.`product-name` AS Name, (tdata.Clicks / tdata.Impressions) AS CTR, ' +
            'tdata.AvCPC, tdata.ACoS, tdata.AdGroup, tdata.SKU as SKU, tdata.Cost AS Cost, tdata.Clicks AS Clicks,' +
            'tdata.Orders AS Orders, (tdata.Orders/tdata.Clicks*100) as conversionRate, tdata.Revenue as Revenue, tdata.Impressions AS Impressions, ' +
            'tdata.Match1 as Match1 from (SELECT c.`Match Type` as Match1, c.`Ad Group Name` AS AdGroup, c.`Advertised SKU` AS SKU,' +
            'sum(c.`1-week Other SKU Units Ordered Product Sales`) AS  Revenue, sum(c.`Total spend`) AS Cost, sum(c.`Total spend`)/sum(c.`1-week Other SKU Units Ordered Product Sales`)*100 as ACoS,' +
            'sum(c.`Impressions`) AS Impressions, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) as AvCPC,  sum(c.`Clicks`) AS Clicks, sum(c.`1-week Other SKU Units Ordered`) AS Orders FROM productadsreport2 c' +
            ' WHERE c.user=' + user + sgr + ' and c.`Campaign Name` LIKE \'' + campaign + '\' ' + searchstring + (match ? ' AND `Match Type` LIKE "' + match + '"' : '') + ' GROUP BY c.`Advertised SKU`) tdata, listing_reports_data lrd' +
            ' WHERE tdata.SKU=lrd.sku and lrd.user=' + user + ' AND :WHERE ORDER BY tdata.Cost DESC', where), function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    searchbykeyword: function (request, response) {
        var keyword = request.param('keyword');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var user = request.param('user');
        var match1 = request.param('match1');
        var campaign = request.param('campaign');
        var SKU = request.param('SKU');

        var matched = '';
        if (typeof match1 !== 'undefined' && match1 !== null && match1 !== 'ANY') {
            matched = ' AND c.`Match Type` LIKE \'' + match1 + '\' ';
        }

        if (typeof campaign === 'string' || campaign instanceof String) {
            campaign = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign) + '\'';
        } else {
            for (var i = 0; i < campaign.length; i++) {
                campaign[i] = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign[i]) + '\'';
            }
            campaign = '(' + campaign.join(" OR ") + ')';
        }

        var searchstring = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`Start Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var queryStr = 'SELECT * ' +
            'FROM (' +
              'SELECT ' +
                'tdata.Campaign, tdata.Match1, (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, SUM(tdata.Cost) / SUM(tdata.Revenue)*100 AS ACoS, AVG(tdata.AvCPC) AS AvCPC, ' +
                '(SUM(tdata.Revenue*tdata.Profit) - SUM(tdata.Cost)) AS Profit, SUM(tdata.Cost) AS Cost, SUM(tdata.Clicks) AS Clicks, ' +
                'SUM(tdata.Orders) AS Orders, (SUM(tdata.Orders) / SUM(tdata.Clicks) * 100) as conversionRate, SUM(tdata.Revenue) as Revenue, ' +
                'SUM(tdata.Impressions) AS Impressions, tdata.ADGroup ' +
              'FROM (' +
                'SELECT ' +
                  'm.average_profit / 100 AS Profit,' +
                  'c.`Campaign Name` AS Campaign, SUM(c.`1-month Ordered Product Sales`) AS Revenue, ' +
                  'SUM(c.`Total spend`) AS Cost, SUM(c.`Impressions`) AS Impressions, SUM(c.`Clicks`) AS Clicks, ' +
                  'SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) as AvCPC, c.`Match Type` as Match1, sum(c.`1-month Orders Placed`) AS Orders, ' +
                  'GROUP_CONCAT(DISTINCT CONCAT(c.`Ad Group Name`,\';\',c.`Ad Group Id`) SEPARATOR \', \') AS ADGroup ' +
                'FROM keywordsreport2 c, mws m ' +
                'WHERE  c.user = ' + user + '  AND m.user = ' + user + matched + ' AND c.Keyword LIKE \'' + keyword + '\' AND ' + campaign +
                ' GROUP BY c.`Campaign Name`, c.`Match Type` ' +
                'ORDER BY Revenue DESC' +
              ') tdata ' +
              'GROUP BY tdata.Campaign, tdata.Match1' +
            ') tdata1 ' +
            'ORDER BY Profit DESC';

        sails.models.product.query(queryStr, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    findKeywords: function (request, response) {
        var profitfrom = request.param('profitfrom');
        var profitto = request.param('profitto');
        var campaign = request.param('campaign');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var acosfrom1 = request.param('acosfrom1');
        var acostill = request.param('acostill');
        var SKU = request.param('SKU');
        var user = request.param('user');
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
        var keyword = request.param('keyword');

        var matched = '';
        if (typeof match1 !== 'undefined' && match1 !== null && match1 !== 'ANY') {
            matched = ' AND c.`Match Type` LIKE \'' + match1 + '\' ';
        }

        if (SKU == null || SKU == '' || typeof SKU == 'undefined') {
            //
        } else if (typeof SKU === 'string' || SKU instanceof String) {
            //
        } else {
            SKU = SKU.join("','");
        }

        if (typeof campaign === 'string' || campaign instanceof String) {
            campaign = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign) + '\'';
        } else {
            for (var i = 0; i < campaign.length; i++) {
                campaign[i] = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign[i]) + '\'';
            }
            campaign = '(' + campaign.join(" OR ") + ')';
        }

        var searchstring = '',
            searchstringSearchTerm = '';

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`Start Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
            searchstringSearchTerm = ' and (c.`Last Day of Impression` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var where = [];
        if (request.param('profitfrom')) where.push({
            key: 't.Profit1 >=',
            value: request.param('profitfrom')
        });
        if (request.param('profitto')) where.push({
            key: 't.Profit1 <=',
            value: request.param('profitto')
        });
        if (request.param('revenuefrom')) where.push({
            key: 't.Revenue >=',
            value: request.param('revenuefrom')
        });
        if (request.param('revenueto')) where.push({
            key: 't.Revenue <=',
            value: request.param('revenueto')
        });
        if (request.param('adspendfrom')) where.push({
            key: 't.Cost >=',
            value: request.param('adspendfrom')
        });
        if (request.param('adspendto')) where.push({
            key: 't.Cost <=',
            value: request.param('adspendto')
        });
        if (request.param('acosfrom')) where.push({
            key: 't.ACoS >=',
            value: request.param('acosfrom')
        });
        if (request.param('acosto')) where.push({
            key: 't.ACoS <=',
            value: request.param('acosto')
        });
        if (request.param('impressionsfrom')) where.push({
            key: 't.Impressions >=',
            value: request.param('impressionsfrom')
        });
        if (request.param('impressionsto')) where.push({
            key: 't.Impressions <=',
            value: request.param('impressionsto')
        });
        if (request.param('clicksfrom')) where.push({
            key: 't.Clicks >=',
            value: request.param('clicksfrom')
        });
        if (request.param('clicksto')) where.push({
            key: 't.Clicks <=',
            value: request.param('clicksto')
        });
        if (request.param('ctrfrom')) where.push({
            key: 't.CTR >=',
            value: request.param('ctrfrom')
        });
        if (request.param('ctrto')) where.push({
            key: 't.CTR <=',
            value: request.param('ctrto')
        });
        if (request.param('avecpcfrom')) where.push({
            key: 't.AvCPC >=',
            value: request.param('avecpcfrom')
        });
        if (request.param('avecpcto')) where.push({
            key: 't.AvCPC <=',
            value: request.param('avecpcto')
        });
        if (request.param('ordersFrom')) where.push({
            key: 't.Orders >=',
            value: request.param('ordersFrom')
        });
        if (request.param('ordersTo')) where.push({
            key: 't.Orders <=',
            value: request.param('ordersTo')
        });
        if (request.param('conversionRateFrom')) where.push({
            key: 't.conversionRate >=',
            value: request.param('conversionRateFrom')
        });
        if (request.param('conversionRateTo')) where.push({
            key: 't.conversionRate <=',
            value: request.param('conversionRateTo')
        });

        let strCamp = campaign.replace(/\bc.`\b/gi, 'c2.`');
        var queryStr = sails.models.product.escapeQuery('select *, CASE WHEN (SELECT  COUNT(DISTINCT (c2.`Match Type`)) FROM keywordsreport2 c2, mws m2 WHERE c2.user = ' + user + ' AND m2.user = ' + user + ' AND c2.Keyword LIKE Keyword AND ' + strCamp + ' ' + ') >= 2 THEN  \'multiple\' ELSE Match2 END AS Match1 FROM (select tdata.`Campaign Name`, tdata.`Campaign Id`, tdata.ACos, tdata.Keyword as Keyword, ' +
            '(tdata.Clicks / tdata.Impressions) AS CTR, tdata.AvCPC, tdata.Profit as Profit, ' +
            'tdata.Revenue*tdata.Profit-tdata.Cost AS Profit1, tdata.Cost AS Cost, tdata.Clicks AS Clicks,' +
            ' tdata.Orders AS Orders, (tdata.Orders/tdata.Clicks*100) as conversionRate, tdata.Revenue as Revenue, ' +
            'tdata.Impressions AS Impressions, tdata.Match1 as Match2 from ' +
            '(SELECT c.`Campaign Name`, c.`Campaign Id`, c.`Match Type` as Match1, c.Keyword, sum(c.`1-month Ordered Product Sales`) AS Revenue, ' +
            'm.average_profit/100 AS Profit, AVG(c.CTR) as CTR, ' +
            ' SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) as AvCPC, sum(c.`Total spend`) AS Cost, sum(c.`Impressions`) AS Impressions, sum(c.`Clicks`) AS Clicks, sum(c.`1-month Orders Placed`) ' +
            'AS Orders, sum(c.`Total spend`)/sum(c.`1-month Ordered Product Sales`)*100 as ACoS FROM keywordsreport2 c, ' +
            ' mws m WHERE  m.user=' + user + matched + ' and c.user=' + user + ' and m.user=' + user + '  ' +
            '  AND c.Keyword LIKE "' + keyword + '"' + searchstring + ' AND ' + campaign + ' GROUP BY `Campaign Id`)' +
            ' tdata WHERE true order by Profit1 DESC) t where :WHERE', where);

        var querySearchTermStr = sails.models.product.escapeQuery('select * FROM (select IF(tdata.Revenue>0,tdata.Cost/tdata.Revenue*100,0) as acos, ' +
            '(tdata.Clicks / tdata.Impressions) AS CTR, tdata.AvCPC, tdata.Keyword as Keyword, tdata.Search as Search, tdata.Cost AS Cost, tdata.Clicks AS Clicks,' +
            'tdata.Orders AS Orders, (tdata.Orders/tdata.Clicks*100) as conversionRate, tdata.Revenue as Revenue, tdata.Impressions AS Impressions, tdata.Match1 as Match1 from (SELECT c.`Match Type` as Match1, c.`Customer Search Term` AS Search, c.`Campaign Name` as Campaign, c.Keyword,' +
            'sum(c.`Product Sales within 1-week of a click`) AS Revenue, sum(c.`Total spend`) AS Cost,  AVG(c.`ACoS`) as ACoS,' +
            'sum(c.`Impressions`) AS Impressions, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) as AvCPC, sum(c.`Clicks`) AS Clicks, sum(c.`Orders placed within 1-week of a click`) AS Orders' +
            ' FROM searchtermreport2 c ' +
            'WHERE  c.user=' + user + matched +
            '  AND c.Keyword LIKE "' + keyword + '"' + searchstringSearchTerm + ' AND ' + campaign +
            'GROUP BY CONCAT(LENGTH(`Customer search term`), c.`Customer Search Term`)) tdata where tdata.Cost>0 ORDER BY tdata.Cost DESC) t where :WHERE', where);

        Async.parallel({
            keywords: function(callback) {
              sails.models.product.query(queryStr, function(err, results) {
                  if (err) {
                    callback(err,[])
                  }
                  callback(null, results);
              });
            },
            searchterms: function(callback) {
              sails.models.product.query(querySearchTermStr,function(err, results) {
                  if (err) {
                    callback(err,[])
                  }
                  callback(null, results);
              });
            }
        }, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getRelatedUnprofitableTerms: function (request, response) {
      var user = parseInt(request.param('user'));
      // FIXME: Escape user-input data.
      var campaign = request.param('campaign');
      var keyword = request.param('keyword');
      var acosProfitZone = parseFloat(request.param('acosProfitZone'));

      var dateRangeCondition = ' AND (`Last Day of Impression` BETWEEN \'' + request.param('startDate').replace(/"/, '') +
          '\' AND \'' + request.param('endDate').replace(/"/, '') + '\') ';

      Async.parallel({
        termsWithoutSales: function (callback) {
          var query = 'SELECT ' +
              '`Customer Search Term` AS term, ' +
              'SUM(`Total spend`) AS cost, ' +
              'SUM(`Clicks`) AS clicks ' +
            'FROM searchtermreport2 ' +
            'WHERE user = ' + user +
              ' AND `Customer Search Term` <> ""' +
              ' AND Keyword = \'' + keyword + '\'' +
              ' AND `Campaign Name` = \'' + campaign + '\'' + dateRangeCondition +
            ' GROUP BY `Customer Search Term`' +
            ' HAVING SUM(`Product Sales within 1-week of a click`) = 0' +
              ' AND SUM(Clicks) > 0';

          sails.models.product.query(query, function (err, termsWithoutSales) {
            if (err) {
              return callback(err, []);
            }
            return callback(null, termsWithoutSales);
          });
        },
        unprofitableTerms: function (callback) {
          var query = 'SELECT ' +
              '`Customer Search Term` AS term, ' +
              'SUM(`Product Sales within 1-week of a click`) AS sales, ' +
              'SUM(`Total spend`) AS cost ' +
            'FROM searchtermreport2 ' +
            'WHERE user = ' + user +
              ' AND `Customer Search Term` <> ""' +
              ' AND Keyword = \'' + keyword + '\'' +
              ' AND `Campaign Name` = \'' + campaign + '\'' + dateRangeCondition +
            ' GROUP BY `Customer Search Term`' +
            ' HAVING IF(SUM(`Product Sales within 1-week of a click`) > 0, SUM(`Total spend`) / SUM(`Product Sales within 1-week of a click`) * 100, 0) > ' + acosProfitZone;

          sails.models.product.query(query, function (err, unprofitableTerms) {
            if (err) {
              return callback(err, []);
            }
            return callback(null, unprofitableTerms);
          });
        },
      }, function (err, results) {
        if (err) {
          return response.serverError(err);
        }
        return response.ok(results);
      });
    },
    searchbyduplicates: function (request, response) {
        var profitfrom = request.param('profitfrom');
        var profitto = request.param('profitto');
        var campaign = request.param('campaign');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var acosfrom1 = request.param('acosfrom1');
        var acostill = request.param('acostill');
        var SKU = request.param('SKU');
        var user = request.param('user');
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

        var matched = '';
        if (typeof match1 !== 'undefined' && match1 !== null && match1 !== 'ANY') {
            matched = ' AND c.`Match Type` LIKE \'' + match1 + '\' ';
        }

        if (typeof campaign === 'string' || campaign instanceof String) {
            campaign = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign) + '\'';
        } else {
            for (var i = 0; i < campaign.length; i++) {
                campaign[i] = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign[i]) + '\'';
            }
            campaign = '(' + campaign.join(' OR ') + ')';
        }

        var searchstring = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' AND (c.`Start Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        if (typeof acosto === 'undefined' || acosto === null) {
            acosto = 99999999;
        }

        if (typeof acosfrom1 === 'undefined' || acosfrom1 === null) {
            acosfrom1 = 30;
        }

        if (typeof acosfrom === 'undefined' || acosfrom === null) {
            acosfrom = -99999999;
        }

        if (typeof acostill === 'undefined' || acostill === null) {
            acostill = -99999999;
        }

        acosto = Math.min(acosto, acosfrom1);
        acosfrom = Math.max(acostill, acosfrom,0);

        let strCamp = campaign.replace(/\bc.`\b/gi, 'c2.`');
        var queryStr = 'SELECT *, CASE WHEN (SELECT  COUNT(DISTINCT (c2.`Match Type`)) FROM keywordsreport2 c2, mws m2 WHERE c2.user = ' + user + ' AND m2.user = ' + user + ' AND c2.Keyword LIKE Keyword AND ' + strCamp + ' ' + ') >= 2 THEN  \'multiple\' ELSE Match2 END AS Match1 ' +
            'FROM ' +
              '(' +
                'SELECT ' +
                  'tdata.ACos, tdata.Keyword AS Keyword, ' +
                  '(tdata.Clicks / tdata.Impressions) AS CTR, tdata.AvCPC, tdata.Profit as Profit, ' +
                  'tdata.Revenue * tdata.Profit-tdata.Cost AS Profit1, tdata.Cost AS Cost, tdata.Clicks AS Clicks, ' +
                  'tdata.Orders AS Orders, (tdata.Orders / tdata.Clicks * 100) as conversionRate, ' +
                  'tdata.Revenue as Revenue, tdata.Impressions AS Impressions, tdata.Match1 as Match2 ' +
                'FROM ' +
                  '(' +
                    'SELECT ' +
                      'c.`Match Type` as Match1, c.Keyword, sum(c.`1-month Ordered Product Sales`) AS Revenue, m.average_profit/100 AS Profit, ' +
                      'SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) as AvCPC, sum(c.`Total spend`) AS Cost, ' +
                      'SUM(c.`Impressions`) AS Impressions, sum(c.`Clicks`) AS Clicks, sum(c.`1-month Orders Placed`) AS Orders, ' +
                      'SUM(c.`Total spend`)/sum(c.`1-month Ordered Product Sales`)*100 as ACoS ' +
                    'FROM keywordsreport2 c, mws m ' +
                    'WHERE  m.user = ' + user + matched + ' AND c.user = ' + user + ' AND ' + campaign + ' AND c.Keyword IN ' +
                      '(' +
                        'SELECT DISTINCT Keyword ' +
                        'FROM (' +
                          'SELECT c.Keyword ' +
                          'FROM keywordsreport2 c ' +
                          'WHERE c.user = ' + user +
                            ' AND c.`Campaign Id` <> "115841101782512"' + // FIXME: This campaign is a duplicate for the user #974.
                            ' AND ' + campaign + searchstring +
                          ' GROUP BY c.Keyword ' +
                          'HAVING COUNT(DISTINCT c.`Campaign Id`, c.`Ad Group Id`) > 1' +
                        ') t' +
                      ')' +
                    ' GROUP BY c.Keyword' +
                  ') tdata ' +
                  'WHERE tdata.ACoS > 0 AND tdata.Revenue > 0 ' +
                  'ORDER BY Profit1 DESC' +
                ') t ' +
                'WHERE ' +
                  't.Profit1>=' + profitfrom +
                  ' AND t.Profit1<=' + profitto +
                  ' AND t.Revenue>=' + revenuefrom +
                  ' AND t.Revenue<=' + revenueto +
                  ' AND t.Cost>=' + adspendfrom +
                  ' AND t.Cost<=' + adspendto +
                  ' AND t.ACoS>' + acosfrom +
                  ' AND t.ACoS<=' + acosto +
                  ' AND t.Impressions>=' + impressionsfrom +
                  ' AND t.Impressions<=' + impressionsto +
                  ' AND t.Clicks>=' + clicksfrom +
                  ' AND t.Clicks<=' + clicksto +
                  ' AND t.CTR>=' + ctrfrom +
                  ' AND t.CTR<=' + ctrto +
                  ' AND t.AvCPC>=' + avecpcfrom +
                  ' AND t.AvCPC<=' + avecpcto +
                  ' AND t.Orders>=' + ordersFrom +
                  ' AND t.Orders<=' + ordersTo +
                  ' AND t.conversionRate>=' + conversionRateFrom +
                  ' AND t.conversionRate<=' + conversionRateTo;

        sails.models.product.query(queryStr, function (err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    searchCampaignsByKeyword: function(request, response) {
        var keyword = request.param('keyword');
        var user = request.param('user');
        var skus = request.param('skus');

        var where = [];
        if (keyword) where.push({
            key: 'Keyword LIKE',
            value: '"' + keyword + '"'
        });
        if (user) where.push({
            key: 'user =',
            value: user
        });

        var query = 'SELECT DISTINCT `Campaign Id` as `CampaignId` FROM keywordsreport2 where :WHERE';
        sails.models.product.query(sails.models.product.escapeQuery(query, where), function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    searchbyACoSmult1: function (request, response) {
        var campaign = request.param('campaign');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var acosfrom1 = request.param('acosfrom1');
        var acostill = request.param('acostill');
        var SKU = request.param('SKU');
        var user = request.param('user');

        var matched = '';
        if (typeof request.param('match1') !== 'undefined' &&
            request.param('match1') !== 'ANY') {
            matched = ' AND c.`Match Type` LIKE \'' + request.param('match1') + '\' ';
        }

        if (typeof campaign === 'string' || campaign instanceof String) {
            campaign = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign) + '\'';
        } else {
            for (var i = 0; i < campaign.length; i++) {
                campaign[i] = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign[i]) + '\'';
            }
            campaign = '(' + campaign.join(" OR ") + ')';
        }

        if (typeof acosfrom1 === 'undefined' || acosfrom1 === null) {
            acosfrom1 = 30;
        }

        if (typeof acostill === 'undefined' || acostill === null) {
            acostill = -99999999;
        }

        var acosto = parseInt(acosfrom1);
        if (typeof request.param('acosto') !== 'undefined') {
          acosto = Math.min(acosto, parseInt(request.param('acosto')));
        }

        var acosfrom = Math.max(acostill, 0);
        if (typeof request.param('acosfrom') !== 'undefined') {
          acosfrom = Math.max(acosfrom, parseInt(request.param('acosfrom')));
        }

        var searchstring = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var conditions = [];
        if (typeof request.param('revenuefrom') !== 'undefined') {
          conditions.push('t.Revenue >= ' + parseInt(request.param('revenuefrom')));
        }
        if (typeof request.param('revenueto') !== 'undefined') {
          conditions.push('t.Revenue <= ' + parseInt(request.param('revenueto')));
        }
        if (typeof request.param('adspendfrom') !== 'undefined') {
          conditions.push('t.Cost >= ' + parseInt(request.param('adspendfrom')));
        }
        if (typeof request.param('adspendto') !== 'undefined') {
          conditions.push('t.Cost <= ' + parseInt(request.param('adspendto')));
        }
        if (typeof request.param('impressionsfrom') !== 'undefined') {
          conditions.push('t.Impressions >= ' + parseInt(request.param('impressionsfrom')));
        }
        if (typeof request.param('impressionsto') !== 'undefined') {
          conditions.push('t.Impressions <= ' + parseInt(request.param('impressionsto')));
        }
        if (typeof request.param('clicksfrom') !== 'undefined') {
          conditions.push('t.Clicks >= ' + parseInt(request.param('clicksfrom')));
        }
        if (typeof request.param('clicksto') !== 'undefined') {
          conditions.push('t.Clicks <= ' + parseInt(request.param('clicksto')));
        }
        if (typeof request.param('ctrfrom') !== 'undefined') {
          conditions.push('t.CTR >= ' + parseInt(request.param('ctrfrom')));
        }
        if (typeof request.param('ctrto') !== 'undefined') {
          conditions.push('t.CTR <= ' + parseInt(request.param('ctrto')));
        }
        if (typeof request.param('avecpcfrom') !== 'undefined') {
          conditions.push('t.AvCPC >= ' + parseInt(request.param('avecpcfrom')));
        }
        if (typeof request.param('avecpcto') !== 'undefined') {
          conditions.push('t.AvCPC <= ' + parseInt(request.param('avecpcto')));
        }
        if (typeof request.param('ordersFrom') !== 'undefined') {
          conditions.push('t.Orders >= ' + parseInt(request.param('ordersFrom')));
        }
        if (typeof request.param('ordersTo') !== 'undefined') {
          conditions.push('t.Orders <= ' + parseInt(request.param('ordersTo')));
        }
        if (typeof request.param('conversionRateFrom') !== 'undefined') {
          conditions.push('t.conversionRate >= ' + parseInt(request.param('conversionRateFrom')));
        }
        if (typeof request.param('conversionRateTo') !== 'undefined') {
          conditions.push('t.conversionRate <= ' + parseInt(request.param('conversionRateTo')));
        }
        if (typeof request.param('profitfrom') !== 'undefined') {
          conditions.push('t.Profit1 >= ' + parseInt(request.param('profitfrom')));
        }
        if (typeof request.param('profitto') !== 'undefined') {
          conditions.push('t.Profit1 <= ' + parseInt(request.param('profitto')));
        }

        if (conditions.length) {
          conditions = ' AND ' + conditions.join(' AND ');
        } else {
          conditions = '';
        }

        let strCamp = campaign.replace(/\bc.`\b/gi, 'c2.`');
        var queryStr = 'SELECT *, CASE WHEN (SELECT  COUNT(DISTINCT (c2.`Match Type`)) FROM keywordsreport2 c2, mws m2 WHERE c2.user = ' + user + ' AND m2.user = ' + user + ' AND c2.Keyword LIKE Keyword AND ' + strCamp + ' ' + ') >= 2 THEN  \'multiple\' ELSE Match2 END AS Match1 ' +
          'FROM (' +
            'SELECT ' +
              'tdata.ACos, ' +
              '(tdata.Clicks / tdata.Impressions) AS CTR, ' +
              'tdata.AvCPC, ' +
              'tdata.Keyword as Keyword, tdata.Profit as Profit, ' +
              'tdata.Revenue * tdata.Profit - tdata.Cost AS Profit1, ' +
              'tdata.Cost AS Cost, tdata.Clicks AS Clicks, ' +
              'tdata.Orders AS Orders, ' +
              '(tdata.Orders / tdata.Clicks * 100) AS conversionRate, ' +
              'tdata.Revenue as Revenue, ' +
              'tdata.Impressions AS Impressions, ' +
              'tdata.Match1 as Match2 ' +
            'FROM (' +
              'SELECT ' +
                'c.`Match Type` AS Match1, ' +
                'c.Keyword, SUM(c.`1-month Ordered Product Sales`) AS Revenue, ' +
                'm.average_profit / 100 AS Profit, ' +
                'SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) as AvCPC, sum(c.`Total spend`) AS Cost, sum(c.`Impressions`) AS Impressions, sum(c.`Clicks`) AS Clicks, ' +
                'SUM(c.`1-month Orders Placed`) AS Orders, SUM(c.`Total spend`)/sum(c.`1-month Ordered Product Sales`)*100 as ACoS ' +
              'FROM keywordsreport2 c, mws m ' +
              'WHERE m.user = ' + user + matched +
                ' AND c.user=' + user + ' AND m.user=' + user +
                ' AND ' + campaign + searchstring +
              ' GROUP BY c.Keyword' +
            ') tdata ' +
            'WHERE tdata.Revenue > 0 ' +
            'ORDER BY Profit1 DESC' +
          ') t ' +
          'WHERE t.ACoS > ' + acosfrom + ' AND t.ACoS <= ' + acosto + conditions;

        sails.models.product.query(queryStr, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    update_acos: function (request, response) {
        var acos = request.param('acos');
        var campaign = mysqlEscape(request.param('campaign'));
        var user = request.param('user');

        var queryForCampaign = 'SELECT id FROM campaigns where user = ' + user + ' and name LIKE \'' + campaign + '\'';
        sails.models.product.query(queryForCampaign, function(err, campaignResults) {
            if (err) {
              return response.serverError(err);
            }

            var query = '';
            if (campaignResults.length) {
              query = 'UPDATE campaigns SET name = \'' + campaign + '\', acos = ' + acos + ' WHERE user = ' + user + ' AND id = ' + campaignResults[0]['id'];
            } else {
              query = 'INSERT INTO campaigns SET user = ' + user + ', name = \'' + campaign + '\', acos = ' + acos;
            }

            sails.models.product.query(query, function(err, results) {
                if (err) {
                  return response.serverError(err);
                }
                if (campaignResults.length) {
                  results.insertId = campaignResults[0]['id'];
                }
                return response.ok(results);
            });
        });
    },
    getallskus: function getallskus(request, response) {
        var user = request.param('user');
        sails.models.product.query('SELECT DISTINCT c.`Advertised SKU` AS SKU FROM productadsreport2 WHERE user=' + user, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getSkusForCampaign: function(request, response) {
      var user = request.param('user');
      var campaignId = request.param('campaignId');

      sails.models.product.query('SELECT DISTINCT p.id, p.average_selling_price,' +
          'p.amazon_FBA_fees, p.additional_per_unit_costs, p.total_shipping_costs, p.cost_per_unit, ' +
          'p.sku as SKU, p.asin, p.`product-name`, p.quantity, p.product_description,p.image_sm , p.image_med, p.image_big, p.price, p.url FROM productadsreport2 c, ' +
          'listing_reports_data p WHERE c.user=' + user + ' and c.`Campaign Id` = ' + campaignId +
          ' and c.`Advertised SKU`= p.sku AND (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user +
          ' AND t.name=s.plan_id)=0) AND p.user=c.user',
        function(err, results) {
          if (err) {
            return response.serverError(err);
          }
          // console.log(results);
          return response.ok(results);
      });
    },
    getallcampaigns: function (request, response) {
        var user = request.param('user');
        var SKU = request.param('SKU');

        var whereClause = '';
        var parameters = [];

        if (SKU == null || SKU == '' || typeof SKU == 'undefined') {
            whereClause = 'WHERE c.user = ' + user;
        } else if (typeof SKU === 'string' || SKU instanceof String) {
            if (SKU === 'none') {
              whereClause = 'WHERE c.user = ' + user;
            } else {
              whereClause = 'WHERE c.user = ' + user + ' AND c.`Advertised SKU` IN (?)';
              parameters.push(SKU);
            }
        } else {
            parameters = SKU;

            var placeholders = SKU.map(function () {
                return '?';
            }).join(',');

            whereClause = 'WHERE c.user = ' + user + ' AND c.`Advertised SKU` IN ( ' + placeholders + ' )';
        }

        var queryStr = 'SELECT DISTINCT c.`Campaign Name` AS Campaign, c.`Campaign Id` AS CampaignId FROM productadsreport2 c ' + whereClause +
            ' AND c.`Campaign Id` <> "115841101782512"'; // FIXME: This campaign is duplicate for user #974.
        sails.models.product.query(queryStr, parameters, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    removekeywords: function (request, response) {
        var user = request.param('user');
        var campaign = request.param('campaign');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var acosfrom = request.param('acosfrom');
        var acostill = request.param('acostill');
        var acosto = request.param('acosto');
        var revenuefrom = request.param('revenuefrom');
        var revenueto = request.param('revenueto');
        var adspendfrom = request.param('adspendfrom');
        var adspendto = request.param('adspendto');
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

        if (typeof campaign === 'string' || campaign instanceof String) {
            campaign = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign) + '\'';
        } else {
            for (var i = 0; i < campaign.length; i++) {
                campaign[i] = 'c.`Campaign Name` LIKE \'' + mysqlEscape(campaign[i]) + '\'';
            }
            campaign = '(' + campaign.join(" OR ") + ')';
        }

        var searchstring = '';
        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`Last Day of Impression` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        if (acosto > 0) acostill = acosto;
        if (typeof acostill === 'undefined' || acostill === null) acostill = 40;

        if (typeof revenuefrom !== 'undefined' && revenuefrom !== null) revenuefrom = ' and tdata.Revenue>=' + revenuefrom;
        else revenuefrom = '';
        if (typeof revenueto !== 'undefined' && revenueto !== null) revenueto = ' and tdata.Revenue<=' + revenueto;
        else revenueto = '';
        if (typeof adspendfrom !== 'undefined' && adspendfrom !== null) adspendfrom = ' and tdata.Cost>=' + adspendfrom;
        else adspendfrom = '';
        if (typeof adspendto !== 'undefined' && adspendto !== null) adspendto = ' and tdata.Cost<=' + adspendto;
        else adspendto = '';
        if (typeof impressionsfrom !== 'undefined' && impressionsfrom !== null) impressionsfrom = ' and tdata.Impressions>=' + impressionsfrom;
        else impressionsfrom = '';
        if (typeof impressionsto !== 'undefined' && impressionsto !== null) impressionsto = ' and tdata.Impressions<=' + impressionsto;
        else impressionsto = '';
        if (typeof clicksfrom !== 'undefined' && clicksfrom !== null) clicksfrom = ' and tdata.Clicks>=' + clicksfrom;
        else clicksfrom = '';
        if (typeof clicksto !== 'undefined' && clicksto !== null) clicksto = ' and tdata.Clicks<=' + clicksto;
        else clicksto = '';
        if (typeof avecpcfrom !== 'undefined' && avecpcfrom !== null) avecpcfrom = ' and tdata.AvCPC>=' + avecpcfrom;
        else avecpcfrom = '';
        if (typeof avecpcto !== 'undefined' && avecpcto !== null) avecpcto = ' and tdata.AvCPC<=' + avecpcto;
        else avecpcto = '';
        if (typeof ordersFrom !== 'undefined' && ordersFrom !== null) ordersFrom = ' and tdata.Orders>=' + ordersFrom;
        else impressionsfrom = '';
        if (typeof ordersTo !== 'undefined' && ordersTo !== null) ordersTo = ' and tdata.Orders<=' + ordersTo;
        else ordersTo = '';
        if (typeof conversionRateFrom !== 'undefined' && conversionRateFrom !== null) conversionRateFrom = ' and tdata.conversionRate>=' + conversionRateFrom;
        else conversionRateFrom = '';
        if (typeof conversionRateTo !== 'undefined' && conversionRateTo !== null) conversionRateTo = ' and tdata.conversionRate<=' + conversionRateTo;
        else conversionRateTo = '';

        var query = 'SELECT tdata.ACoS as ACoS, ' +
            '(tdata.Clicks / tdata.Impressions) AS CTR, ' +
            'tdata.AvCPC,  tdata.Keyword as Keyword, tdata.Search as Search, tdata.Cost AS Cost, tdata.Clicks AS Clicks,' +
            'tdata.Orders AS Orders, (tdata.Orders/tdata.Clicks*100) as conversionRate, tdata.Revenue as Revenue, tdata.Impressions AS Impressions, ' +
            ' tdata.Match1 as Match1 FROM (SELECT c.`Match Type` as Match1, c.`Customer Search Term` AS Search, c.`Campaign Name` as Campaign, c.Keyword,' +
            'SUM(c.`Product Sales within 1-week of a click`) AS  Revenue, SUM(c.`Total spend`) AS Cost, ' +
            'IF(SUM(c.`Product Sales within 1-week of a click`)>0,SUM(c.`Total spend`)/SUM(c.`Product Sales within 1-week of a click`)*100,0) as ACoS,' +
            'SUM(c.`Impressions`) AS Impressions, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.Clicks) as AvCPC, SUM(c.`Clicks`) AS Clicks, ' +
            'SUM(c.`Orders placed within 1-week of a click`) AS Orders ' +
            'FROM searchtermreport2 c ' +
            'WHERE c.user = ' + user + ' AND ' + campaign + searchstring + ' AND ' +
            'c.`Customer Search Term` NOT IN (SELECT DISTINCT keyword FROM keywordsreport2 where user=' + user + ' and ' + campaign + ')' +
            '  GROUP BY CONCAT(LENGTH(`Customer search term`), c.`Customer Search Term`)) tdata where true ';
        query += revenuefrom + revenueto + adspendfrom + adspendto + impressionsfrom + impressionsto + clicksfrom + clicksto + avecpcfrom + avecpcto;
        query += ' and (tdata.`ACoS`<=' + acostill + ' AND tdata.`ACoS`>' + acosfrom + ')';
        sails.models.product.query(query, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getallSKUs: function getallSKUs(request, response) {
        var user = request.param('user');
        var query = 'SELECT DISTINCT p.id, p.average_selling_price,' +
            'p.amazon_FBA_fees, p.additional_per_unit_costs, p.total_shipping_costs, p.cost_per_unit, ' +
            'p.sku as SKU, p.asin, p.`product-name`, p.quantity, p.product_description,p.image_sm , p.image_med, p.image_big, p.price, p.url FROM productadsreport2 c, ' +
            'listing_reports_data p WHERE c.user=' + user + ' and c.`Advertised SKU`= p.sku AND (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0) AND p.user=c.user ';
        sails.models.product.query(query, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    loadmodel: function loadmodel(request, response) {
        var user = request.param('user');
        var id = request.param('id');
        sails.models.product.query('SELECT * from models where id=' + id + ' and user=' + user, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    loadmodels: function loadmodels(request, response) {
        var user = request.param('user');
        var modelno = request.param('modelno');
        sails.models.product.query('SELECT * from models where user=' + user, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    savemodel: function savemodel(request, response) {
        var user = request.param('user');
        var name = request.param('name');
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
        var modelno = request.param('modelno');

        if (typeof profitfrom === 'undefined' || profitfrom === null) profitfrom = 'NULL';
        if (typeof profitto === 'undefined' || profitto === null) profitto = 'NULL';
        if (typeof revenuefrom === 'undefined' || revenuefrom === null) revenuefrom = 'NULL';
        if (typeof revenueto === 'undefined' || revenueto === null) revenueto = 'NULL';
        if (typeof adspendfrom === 'undefined' || adspendfrom === null) adspendfrom = 'NULL';
        if (typeof adspendto === 'undefined' || adspendto === null) adspendto = 'NULL';
        if (typeof acosfrom === 'undefined' || acosfrom === null) acosfrom = 'NULL';
        if (typeof acosto === 'undefined' || acosto === null) acosto = 'NULL';
        if (typeof impressionsfrom === 'undefined' || impressionsfrom === null) impressionsfrom = 'NULL';
        if (typeof impressionsto === 'undefined' || impressionsto === null) impressionsto = 'NULL';
        if (typeof clicksfrom === 'undefined' || clicksfrom === null) clicksfrom = 'NULL';
        if (typeof clicksto === 'undefined' || clicksto === null) clicksto = 'NULL';
        if (typeof ctrfrom === 'undefined' || ctrfrom === null) ctrfrom = 'NULL';
        if (typeof ctrto === 'undefined' || ctrto === null) ctrto = 'NULL';
        if (typeof avecpcfrom === 'undefined' || avecpcfrom === null) avecpcfrom = 'NULL';
        if (typeof avecpcto === 'undefined' || avecpcto === null) avecpcto = 'NULL';
        if (typeof ordersFrom === 'undefined' || ordersFrom === null) ordersFrom = 'NULL';
        if (typeof ordersTo === 'undefined' || ordersTo === null) ordersTo = 'NULL';
        if (typeof conversionRateFrom === 'undefined' || conversionRateFrom === null) conversionRateFrom = 'NULL';
        if (typeof conversionRateTo === 'undefined' || conversionRateTo === null) conversionRateTo = 'NULL';
        if (typeof match1 === 'undefined' || match1 === null) match1 = 'ANY';

        sails.models.product.query('select * from models where name=\'' + name + '\' and modelno=' + modelno + ' and user=' + user, function(err, results) {
            if (err) {
                return response.serverError(err);
            }

            var query = '';
            if (results.length > 0) {
                query = 'UPDATE models SET name=\'' + name + '\', profitfrom=' + profitfrom + ', profitto=' + profitto +
                    ', revenuefrom=' + revenuefrom + ', revenueto=' + revenueto + ',' +
                    'adspendfrom=' + adspendfrom + ',adspendto=' + adspendto + ',acosfrom=' + acosfrom + ',acosto=' + acosto +
                    ',impressionsfrom=' + impressionsfrom + ',impressionsto=' + impressionsto + ',clicksfrom=' + clicksfrom + ',' +
                    'clicksto=' + clicksto + ',ctrfrom=' + ctrfrom + ',ctrto=' + ctrto + ',avecpcfrom=' + avecpcfrom + ',avecpcto=' + avecpcto +
                    ',ordersFrom=' + ordersFrom + ',ordersTo=' + ordersTo + ',conversionRateFrom=' + conversionRateFrom +
                    ', conversionRateTo=' + conversionRateTo + ',match1=\'' + match1 + '\', modelno=' + modelno + ',user=' + user +
                    ' WHERE name=\'' + name + '\' and modelno=' + modelno + ' and user=' + user;
            } else {
                query = 'INSERT INTO models SET name=\'' + name + '\', profitfrom=' + profitfrom + ', profitto=' + profitto +
                    ', revenuefrom=' + revenuefrom + ', revenueto=' + revenueto + ',' +
                    'adspendfrom=' + adspendfrom + ',adspendto=' + adspendto + ',acosfrom=' + acosfrom + ',acosto=' + acosto +
                    ',impressionsfrom=' + impressionsfrom + ',impressionsto=' + impressionsto + ',clicksfrom=' + clicksfrom + ',' +
                    'clicksto=' + clicksto + ',ctrfrom=' + ctrfrom + ',ctrto=' + ctrto + ',avecpcfrom=' + avecpcfrom + ',avecpcto=' + avecpcto +
                    ',ordersFrom=' + ordersFrom + ',ordersTo=' + ordersTo + ',conversionRateFrom=' + conversionRateFrom +
                    ', conversionRateTo=' + conversionRateTo + ',match1=\'' + match1 + '\', modelno=' + modelno + ' , user=' + user;
            }

            sails.models.product.query(query, function(err, results) {
                if (err) {
                    return response.serverError(err);
                }
                return response.ok(results);
            });
        });
    },
    savenewtest: function savenewtest(request, response) {
        var user = request.param('user');
        var test_name = request.param('test_name');
        var added_keywords = request.param('added_keywords');
        var negative_exact = request.param('negative_exact');
        var negative_phrase = request.param('negative_phrase');
        var paused_keywords = request.param('paused_keywords');
        var adjusted_keyword_bid = request.param('adjusted_keyword_bid');
        var adjusted_daily_budget = request.param('adjusted_daily_budget');
        var adjusted_campaign_budget = request.param('adjusted_campaign_budget');
        var before_timeframe = request.param('before_timeframe');
        var campaign = request.param('campaign');
        var from_date = (new Date()).toISOString().substring(0, 19).replace('T', ' ');
        var some_Date = new Date();
        some_Date.setTime(some_Date.getTime() + before_timeframe * 86400000);
        var to_date = some_Date.toISOString().substring(0, 19).replace('T', ' ');
        var before_timeframe = request.param('adjusted_campaign_budget');

        var query = 'Insert into abtest_campaign set user=' + user +
            ',test_name=\'' + mysqlEscape(test_name) +
            '\',added_keywords=\'' + mysqlEscape(added_keywords) +
            '\',negative_exact=\'' + mysqlEscape(negative_exact) +
            '\',negative_phrase=\'' + mysqlEscape(negative_phrase) +
            '\',paused_keywords=\'' + mysqlEscape(paused_keywords) +
            '\',adjusted_keyword_bid=\'' + mysqlEscape(adjusted_keyword_bid) +
            '\',adjusted_daily_budget=\'' + mysqlEscape(adjusted_daily_budget) +
            '\',adjusted_campaign_budget=\'' + mysqlEscape(adjusted_campaign_budget) +
            '\',from_date=' + from_date +
            '\',to_date=' + to_date +
            '\',campaign=' + mysqlEscape(campaign) +
            '\'';

        sails.models.campaign.query(query, function(err, result) {
            if (err) {
                return response.serverError(err);
            }
            return response.result();
        });
    },

    getAllCampaignsAndBySku: function getAllCampaignsAndBySku(request, response) {
        var user = request.param('user');
        var SKU = request.param('sku');

        var sstring = '';
        var dynamicValues = [];
        if (SKU) {
            if (typeof SKU === 'string' || SKU instanceof String) {
                sstring = 'where tdata.sku IN (?)';
                dynamicValues.push(SKU);
                console.log(dynamicValues);
            } else {
                dynamicValues = SKU.map(function (item) {
                    return '?';
                });
                var dynamicValueStr = dynamicValues.join(",");

                dynamicValues = SKU; //reassign to pass to query string
                sstring = 'where tdata.sku IN ( ' + dynamicValueStr + ' )';
            }
        }

        var queryStr = `
                        SELECT
                            tdata.acos1,
                            tdata.CampaignId,
                            tdata.Campaign,
                            tdata.StartDate,
                            tdata.EndDate,
                            tdata.sku,
                            (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR,
                            tdata.AvCPC,
                            (SUM(tdata.Revenue * tdata.Profit) - SUM(tdata.Cost)) AS Profit,
                            SUM(tdata.Cost) AS Cost,
                            SUM(tdata.Clicks) AS Clicks,
                            SUM(tdata.Orders) AS Orders,
                            SUM(tdata.Revenue) AS Revenue,
                            SUM(tdata.Impressions) AS Impressions,
                            (tdata.Orders / tdata.Clicks * 100) AS conversionRate
                        FROM
                            (SELECT
                                    p.id,
                                    p.sku,
                                    IF(((p.average_selling_price - p.cost_per_unit - p.total_shipping_costs - p.additional_per_unit_costs - p.amazon_FBA_fees) / p.average_selling_price) IS NULL, m.average_profit / 100, ((p.average_selling_price - p.cost_per_unit - p.total_shipping_costs - p.additional_per_unit_costs - p.amazon_FBA_fees) / p.average_selling_price)) AS Profit,
                                    c.\`Campaign Id\` AS CampaignId,
                                    c.\`Campaign Name\` AS Campaign,
                                    c.\`Start Date\` AS StartDate,
                                    c.\`End Date\` AS EndDate,
                                    SUM(c.\`1-week Other SKU Units Ordered Product Sales\`) AS Revenue,
                                    SUM(c.\`Total spend\`) AS Cost,
                                    SUM(c.\`Impressions\`) AS Impressions,
                                    SUM(c.\`Clicks\`) AS Clicks,
                                    SUM(c.\`Average CPC\` * c.\`Clicks\`) / SUM(c.Clicks) AS AvCPC,
                                    IF(EXISTS( SELECT
                                            acos
                                        FROM
                                            campaigns
                                        WHERE
                                            user = ${user}
                                                AND name LIKE c.\`Campaign Name\`), (SELECT
                                            AVG(acos)
                                        FROM
                                            campaigns
                                        WHERE
                                            user = ${user}
                                                AND name LIKE c.\`Campaign Name\`), NULL) AS acos1,
                                    SUM(c.\`1-week Other SKU Units Ordered\`) AS Orders
                            FROM
                                productadsreport2 c, listing_reports_data p, mws m
                            WHERE
                                m.user = ${user} AND c.user = ${user}
                                    AND c.\`Advertised SKU\` = p.sku
                                    AND (p.allowed = 1
                                    OR (SELECT
                                        t.max_sku
                                    FROM
                                        mws m, subscriptions s, tariffs t
                                    WHERE
                                        s.id = m.subscription_id
                                            AND m.user = ${user}
                                            AND t.name = s.plan_id) = 0)
                                    AND p.user = c.user
                            GROUP BY c.\`Campaign Name\` , p.sku
                            ORDER BY Revenue DESC) tdata
                        ${sstring}
                        GROUP BY tdata.Campaign;
        `;

        sails.models.product.query(queryStr, dynamicValues, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        });
    },

    getAllAdGroupByCampaignName: function getAllAdGroupByCampaignName(request, response) {
        var user = request.param('user');
        var campaignName = request.param('campaignname'); //we don't should use campaignId since campaign name column indexed.

        var queryStr = `
            SELECT  \`Campaign Name\`, \`Campaign Id\`, \`Ad Group Id\`, \`Ad Group Name\`,
                    COUNT(Keyword)  AS Keywords,
                    SUM(Clicks) AS Clicks,
                    SUM(Impressions) AS Impr,
                    (SUM(Clicks) / SUM(Impressions)) AS CTR,
                    SUM(\`Total Spend\`) AS Spend,
                    SUM(\`Average CPC\`) AS CPC
            FROM keywordsreport2
            WHERE user=${user} AND \`Campaign Name\` = '${campaignName}'
            GROUP BY \`Campaign Id\`, \`Ad Group Name\`;
        `

        sails.models.product.query(queryStr, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        })
    },

    getAllAdByAdGroup: function getAllAdByAdGroup(request, response) {
        var user = request.param('user');
        var campaignName = request.param('campaignname');
        var adGroupId = request.param('adgroupid');

        var queryStr = `
            SELECT
                \`Campaign Name\`,
                \`Campaign Id\`,
                \`Ad Group Id\`,
                \`Ad Group Name\`,
                Keyword,
                \`Match Type\`,
                SUM(\`Total Spend\`) AS Spend
            FROM
                keywordsreport2
            WHERE
                user = ${user}
                AND \`Campaign Name\` = '${campaignName}'
                AND \`Ad Group Id\` = '${adGroupId}'
            GROUP BY Keyword;
        `

        sails.models.product.query(queryStr, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            return response.ok(results);
        })
    }
});
