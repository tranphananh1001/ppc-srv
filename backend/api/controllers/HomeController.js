'use strict';
var _ = require('lodash');

module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {
    gettopKPI: function(request, response) {
        var user = request.param('user');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var searchstring = '';

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var query = 'SELECT ' +
            'tdata.MinDate, tdata.EndDate, (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, tdata.AvCPC, ' +
            '(SUM(tdata.Revenue * tdata.Profit) - SUM(tdata.Cost)) AS Profit, ' +
            'SUM(tdata.Cost) AS Cost, SUM(tdata.Clicks) AS Clicks, ' +
            'SUM(tdata.Orders) AS Orders, ' +
            'SUM(tdata.Revenue) as Revenue, ' +
            'SUM(tdata.Impressions) AS Impressions from (SELECT MIN(c.`Start Date`) AS MinDate, MAX(c.`End Date`) AS EndDate, ' +
            'SUM(c.`1-week Other SKU Units Ordered Product Sales`) AS Revenue, ' +
            'IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)' +
            '/p.average_selling_price) IS NULL, m.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)' +
            '/p.average_selling_price)) AS Profit, sum(c.`Total spend`) AS Cost, sum(c.`Impressions`) AS Impressions, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.`Clicks`) as AvCPC, sum(c.`Clicks`) AS Clicks, sum(c.`1-week Other SKU Units Ordered`) ' +
            'AS Orders ' +
            'FROM productadsreport2 c, listing_reports_data p, mws m ' +
            'WHERE c.user=' + user + ' and m.user=' + user +
            ' and c.`Advertised SKU`= p.sku AND ' +
            '(p.allowed = 1 OR ' +
            '(SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id) = 0) AND ' +
            'p.user = c.user ' + searchstring + ' GROUP BY p.sku) tdata';

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    checkAccountIsSetup: function(request, response) {
        var user = request.param('user');
        var query = 'SELECT COUNT(*) AS totalCount ' +
            'FROM listing_reports_data ' +
            'WHERE (allowed = 1 or ' +
            '(SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id = m.subscription_id and m.user = ' + user + ' AND t.name = s.plan_id) = 0' +
            ') AND user = ' + user;
        sails.models.product.query(query, function (err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    gettopSKU: function(request, response) {
        var user = request.param('user');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
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

        var searchstring = '';

        if (match1 !== 'ANY') {
            match1 = 'c.`Match Type`=\'' + match1 + '\' and ';
        } else {
            match1 = '';
        }

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var query = 'SELECT *, (t.Orders/t.Clicks*100) as conversionRate ' +
            'FROM (SELECT p.id, IF( EXISTS(SELECT * FROM abtests WHERE sku = p.sku AND (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0)  AND DATE(to_date)>=CURDATE()), 1, 0) AS YELLOW, ' +
            'IF( EXISTS(SELECT * FROM abtests WHERE sku = p.sku AND (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0) and clicked=0 AND DATE(to_date)<CURDATE()), 1, 0) AS GREEN,' +
            ' IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)' +
            ' IS NULL, ' +
            'm.average_profit/100, ' +
            '((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)) AS Profit, ' +
            'p.`product-name` as Product, c.`Advertised SKU` AS SKU,  sum(c.`1-week Other SKU Units Ordered Product Sales`) AS  Revenue, sum(c.`Total spend`) AS Cost, ' +
            'sum(c.`Impressions`) AS Impressions, (sum(c.`Clicks`) / sum(c.`Impressions`)) as CTR, sum(c.`Total spend`)/sum(c.`1-week Other SKU Units Ordered Product Sales`)*100 AS ACoS, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.`Clicks`) as AvCPC, ' +
            'sum(c.`Clicks`) AS Clicks, sum(c.`1-week Other SKU Units Ordered`) AS Orders FROM productadsreport2 c, listing_reports_data p, mws m ' +
            'WHERE m.user=' + user + ' and ' + match1 + ' c.user=' + user + ' and c.`Advertised SKU`= p.sku AND ' +
            '(p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t ' +
            'WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0) AND p.user=c.user ' + searchstring +
            ' GROUP BY c.`Advertised SKU`) t where ' +
            't.Revenue*t.Profit-t.Cost>=' + profitfrom +
            ' and t.Revenue*t.Profit-t.Cost<=' + profitto +
            ' and t.Revenue>=' + revenuefrom +
            ' and t.Revenue<=' + revenueto +
            ' and t.Cost>=' + adspendfrom +
            ' and t.Cost<=' + adspendto +
            ' and t.ACoS>=' + acosfrom +
            ' and t.ACoS<=' + acosto +
            ' and t.Impressions>=' + impressionsfrom +
            ' and t.Impressions<=' + impressionsto +
            ' and t.Clicks>=' + clicksfrom +
            ' and t.Clicks<=' + clicksto +
            ' and t.CTR>=' + ctrfrom +
            ' and t.CTR<=' + ctrto +
            ' and t.AvCPC>=' + avecpcfrom +
            ' and t.AvCPC<=' + avecpcto +
            ' and t.Orders>=' + ordersFrom +
            ' and t.Orders<=' + ordersTo +
            ' and (t.Orders/t.Clicks*100)>=' + conversionRateFrom +
            ' and (t.Orders/t.Clicks*100)<=' + conversionRateTo;

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getChart: function getChart(request, response) {
        var user = request.param('user');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var searchstring = '';

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var query = 'SELECT tdata.EndDate, (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, tdata.AvCPC, ' +
            '(SUM(tdata.Revenue*tdata.Profit)-SUM(tdata.Cost)) AS Profit, ' +
            'SUM(tdata.Cost) AS Cost, SUM(tdata.Clicks) AS Clicks, SUM(tdata.Orders) AS Orders, SUM(tdata.Revenue) as Revenue,' +
            ' SUM(tdata.Impressions) AS Impressions ' +
            'FROM ' +
            '(SELECT p.id, p.sku, IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price) IS NULL, ' +
            'm.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)) AS Profit,' +
            ' c.`End Date` AS EndDate, sum(c.`1-week Other SKU Units Ordered Product Sales`) AS  Revenue, sum(c.`Total spend`) AS Cost,' +
            ' sum(c.`Impressions`) AS Impressions, ' +
            'SUM(c.`Clicks`) AS Clicks, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.`Clicks`) as AvCPC, ' +
            'SUM(c.`1-week Other SKU Units Ordered`) AS Orders FROM productadsreport2 c , listing_reports_data p, mws m ' +
            'WHERE c.user=' + user + ' and m.user=' + user + ' and c.`Advertised SKU`= p.sku AND ' +
            '(p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user +
            ' AND t.name=s.plan_id)=0) AND p.user=c.user ' + searchstring +
            ' GROUP BY c.`End Date`, p.sku ORDER BY c.`End Date`) tdata GROUP BY tdata.EndDate';

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    getpiechart: function getpiechart(request, response) {
        var user = request.param('user');
        var id = request.param('id');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
        var searchstring = '';
        var searchstring1 = '';
        var searchstring2 = '';

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' and (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\') ';
            searchstring1 = ' and (s.`purchase-date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\') ';
        }
        if (typeof id !== 'undefined' && id !== null) {
            searchstring2 = ' and p.id = ' + id + ' ';
        }

        var query = 'SELECT (select (sum(p1.revenue*p.profit) - sum(p1.cost)) as Profit ' +
            'FROM (SELECT   ' +
            'c.`Advertised SKU` as sku, sum(c.`1-week Other SKU Units Ordered Product Sales`) AS  Revenue, sum(c.`Total spend`) AS Cost FROM productadsreport2 c WHERE ' +
            'c.user=' + user + searchstring + ' GROUP BY c.`Advertised SKU`) p1 , ' +
            '(SELECT p.id, p.sku, IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price) IS NULL, ' +
            'm.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)) AS ' +
            'Profit FROM listing_reports_data p, mws m  WHERE (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0) AND p.user=' + user + ' AND m.user=' + user + ' GROUP BY p.sku) p where p1.sku = p.sku ' + searchstring2 + ' ) as ' +
            'Profit, (select (sum(p1.revenue)) as Revenue from (SELECT   ' +
            'c.`Advertised SKU` as sku, sum(c.`1-week Other SKU Units Ordered Product Sales`) AS  Revenue, sum(c.`Total spend`) AS Cost FROM productadsreport2 c WHERE ' +
            'c.user=' + user + searchstring + ' GROUP BY c.`Advertised SKU`) p1 , ' +
            '(SELECT p.id, p.sku, IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price) IS NULL, ' +
            'm.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)) AS ' +
            'Profit FROM listing_reports_data p, mws m  WHERE (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user +
            ' AND t.name=s.plan_id)=0) AND p.user=' + user + ' AND m.user=' + user + ' GROUP BY p.sku) p where p1.sku = p.sku ' + searchstring2 + ' ) as ' +
            'Revenue, (select (sum(p1.Cost)) as Cost from (SELECT   c.`Advertised SKU` as sku, sum(c.`Total spend`) AS Cost FROM productadsreport2 c WHERE c.user=' + user + searchstring + ' ' +
            'GROUP BY c.`Advertised SKU`) p1 , (SELECT p.id, p.sku FROM listing_reports_data p, mws m  WHERE (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user +
            ' AND t.name=s.plan_id)=0) AND p.user=' + user + ' AND m.user=' + user + ' GROUP BY p.sku) p where p1.sku = p.sku  ) as Cost, ' +
            '(select  (sum(p2.revenue)) as Revenue1 from (SELECT  s.sku, SUM(s.`item-price`*s.quantity) AS Revenue FROM sales_reports_data s  WHERE  s.user=' + user + ' '
            + searchstring1 +
            ' GROUP BY s.sku) p2, (SELECT p.id, p.sku, IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price) ' +
            'IS NULL,        m.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)) AS Profit ' +
            'FROM listing_reports_data p, mws m  WHERE (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0) AND p.user=' + user + ' AND m.user=' + user + ' GROUP BY p.sku) p where p2.sku = p.sku ' + searchstring2 + ' ) as Revenue1, ' +
            '(select  (sum(p2.revenue * p.profit)) as Profit1 from (SELECT  s.sku, SUM(s.`item-price`*s.quantity) AS Revenue FROM sales_reports_data s  WHERE  s.user=' + user + ' ' + searchstring1 +
            ' GROUP BY s.sku) p2, (SELECT p.id, p.sku, IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price) ' +
            'IS NULL,        m.average_profit/100, ((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price)) AS Profit ' +
            'FROM listing_reports_data p, mws m  WHERE (p.allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0) AND p.user=' + user + ' AND m.user=' + user + ' GROUP BY p.sku) p where p2.sku = p.sku ' + searchstring2 + ' ) as Profit1';

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    },
    gettopCampaigns: function(request, response) {
        var user = request.param('user');
        var startDate = request.param('startDate');
        var endDate = request.param('endDate');
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

        var searchstring = '';

        if (match1 !== 'ANY') {
            match1 = 'c.`Match Type`=\'' + match1 + '\' and ';
        } else {
            match1 = '';
        }

        if (typeof startDate !== 'undefined' && startDate !== null) {
            searchstring = ' AND (c.`End Date` BETWEEN \'' + startDate.replace(/"/, '') + '\' AND \'' + endDate.replace(/"/, '') + '\')';
        }

        var query = 'SELECT * ' +
            'FROM (' +
              'SELECT tdata.Campaign, tdata.CampaignId, tdata.Match1, (SUM(tdata.Clicks) / SUM(tdata.Impressions)) AS CTR, SUM(tdata.Cost) / SUM(tdata.Revenue)*100 AS ACoS, ' +
              'SUM(tdata.AvCPC * tdata.Clicks) / SUM(tdata.Clicks) AS AvCPC, SUM(tdata.Profit) AS Profit, ' +
              'SUM(tdata.Cost) AS Cost, SUM(tdata.Clicks) AS Clicks, (SUM(tdata.Orders) / SUM(tdata.Clicks) * 100) as conversionRate, ' +
              'SUM(tdata.Orders) AS Orders, SUM(tdata.Revenue) as Revenue, ' +
              'SUM(tdata.Impressions) AS Impressions FROM ' +
              '(SELECT IF(((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price) IS NULL, ' +
              'SUM(m.average_profit/100*c.`1-week Other SKU Units Ordered Product Sales`)-sum(c.`Total spend`), ' +
            'SUM((((p.average_selling_price-p.cost_per_unit-p.total_shipping_costs-p.additional_per_unit_costs-p.amazon_FBA_fees)/p.average_selling_price))*c.`1-week Other SKU Units Ordered Product Sales`)-sum(c.`Total spend`)) AS Profit, ' +
            'c.`Campaign Name` AS Campaign, c.`Campaign Id` AS CampaignId,  sum(c.`1-week Other SKU Units Ordered Product Sales`) AS  Revenue, sum(c.`Total spend`) AS Cost, sum(c.`Impressions`) AS Impressions, ' +
            'sum(c.`Clicks`) AS Clicks, SUM(c.`Average CPC` * c.`Clicks`)/SUM(c.`Clicks`) as AvCPC, ' +
            'c.`Match Type` as Match1, sum(c.`1-week Other SKU Units Ordered`) AS Orders ' +
            'FROM productadsreport2 c, listing_reports_data p, mws m ' +
            'WHERE ' + match1 + ' c.user = ' + user + '  and m.user = ' + user + ' AND c.`Advertised SKU` = p.sku AND (p.allowed = 1 or ' +
            '(SELECT t.max_sku FROM mws m, subscriptions s, tariffs t ' +
            'WHERE s.id = m.subscription_id and m.user = ' + user + ' AND t.name = s.plan_id) = 0) AND p.user = c.user  ' + searchstring +
            'GROUP BY c.`Campaign Name`, p.sku ORDER BY Revenue DESC) tdata GROUP BY tdata.Campaign) t WHERE ' +
            't.Profit>=' + profitfrom +
            ' and t.Profit<=' + profitto +
            ' and t.Revenue>=' + revenuefrom +
            ' and t.Revenue<=' + revenueto +
            ' and t.Cost>=' + adspendfrom +
            ' and t.Cost<=' + adspendto +
            ' and t.ACoS>=' + acosfrom +
            ' and t.ACoS<=' + acosto +
            ' and t.Impressions>=' + impressionsfrom +
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

        sails.models.product.query(query, function(err, results) {
            if (err) {
              return response.serverError(err);
            }
            return response.ok(results);
        });
    }
});
