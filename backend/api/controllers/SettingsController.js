'use strict';
var util = require('util'),
    exec = require('child_process').spawn,
    child, child1;
var chargebee = require('chargebee');
var https = require('https');
var _ = require('lodash');
var bcrypt = require('bcryptjs');
var moment = require('moment');
var fs = require('fs');
var iconv = require('iconv-lite');
var request1111 = require('request');
var config = require('../../config/local');
var i = 0;
var j = 0;
var results = [];

chargebee.configure(config.chargebee);

function mysqlEscape(stringToEscape) {
    return stringToEscape
        .replace("\\", "\\\\")
        .replace("\'", "\\\'")
        .replace("\"", "\\\"")
        .replace("\n", "\\\n")
        .replace("\r", "\\\r")
        .replace("\x00", "\\\x00")
        .replace("\x1a", "\\\x1a");
}

function import_csv(table, // Имя таблицы для импорта
    afields, // Массив строк - имен полей таблицы
    filename, // Имя CSV файла, откуда берется информация
    // (путь от корня web-сервера)
    delim, // Разделитель полей в CSV файле
    enclosed, // Кавычки для содержимого полей
    escaped, // Ставится перед специальными символами
    lineend, // Чем заканчивается строка в файле CSV
    hasheader,
    setlist,
    user,
    country_id) {
    var fromread = "utf8";
    if (country_id == 'jp') {
        fromread = 'SHIFT_JIS'
    }
    var data = fs.createReadStream(filename);
    data.pipe(iconv.decodeStream(fromread))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream(filename + "encoded"));

    data.on('end', function() {
        var ignore1 = " IGNORE 1 LINES ";
        var q_import =
            "LOAD DATA INFILE '" + filename + "encoded" + "' IGNORE INTO TABLE " + table + "_copy " +
            "CHARACTER SET UTF8 FIELDS TERMINATED BY '" + delim + "' ENCLOSED BY '" + enclosed + "' " +
            "    ESCAPED BY '" + escaped + "' " +
            "LINES TERMINATED BY '" + lineend + "' " + ignore1 +
            "(" + afields.join(',') + ") set " + setlist;

        sails.models.product.query(q_import, function(err, results) {
            if (err) {
              return response.serverError(err);
            }

            // now copy all into new table
            if (table == 'campaignperfomancereport') {
                sails.models.product.query("INSERT IGNORE INTO campaignperfomancereport ( `Campaign Name`, `Ad Group Name`,  `Advertised SKU`,  Keyword ,  `Match Type`," +
                    "`Start Date`,  `End Date`,  Clicks, Impressions, CTR ,  `Total Spend`," +
                    "`Average CPC`,  Currency ," +
                    "`1-day Orders Placed` ,`1-day Ordered Product Sales` ,  `1-day Conversion Rate`,  `1-day Same SKU Units Ordered`,  `1-day Other SKU Units Ordered`," +
                    "`1-day Same SKU Units Ordered Product Sales` ," +
                    "`1-day Other SKU Units Ordered Product Sales`," +
                    "`1-week Orders Placed` ," +
                    "`1-week Ordered Product Sales` ," +
                    "`1-week Conversion Rate` ," +
                    "`1-week Same SKU Units Ordered`," +
                    "`1-week Other SKU Units Ordered` ," +
                    "`1-week Same SKU Units Ordered Product Sales` ," +
                    "`1-week Other SKU Units Ordered Product Sales` ," +
                    "`1-month Orders Placed` ," +
                    "`1-month Ordered Product Sales` ," +
                    " `1-month Conversion Rate` ," +
                    " `1-month Same SKU Units Ordered` ," +
                    " `1-month Other SKU Units Ordered` ," +
                    " `1-month Same SKU Units Ordered Product Sales` ," +
                    " `1-month Other SKU Units Ordered Product Sales` ," +
                    " createdAt," +
                    " updatedAt," +
                    " createdUserId ," +
                    " updatedUserId , user)  SELECT * FROM campaignperfomancereport_copy where user=" + user,
                    function(err, results) {
                        if (err) {
                            return results.serverError(err);
                        }

                        sails.models.product.query("delete from campaignperfomancereport_copy where user=" + user, function(err, results) {
                            if (err) return results.serverError(err);
                            return results;
                        });
                    }
                );
            } else {
                sails.models.product.query("INSERT IGNORE INTO " + table + "(  `Campaign Name`,            `Ad Group Name` ,        `Customer Search Term`," +
                    "                Keyword ,        `Match Type` ,        `First Day of Impression` ,        `Last Day of Impression` , " +
                    "        Impressions ,        Clicks ,        CTR ,        `Total Spend` ," +
                    "        `Average CPC`,        ACoS ,        Currency ,        `Orders placed within 1-week of a click` ," +
                    "        `Product Sales within 1-week of a click` ,        `Conversion Rate within 1-week of a click` ," +
                    "        `Same SKU units Ordered within 1-week of click` ,        `Other SKU units Ordered within 1-week of click` ," +
                    "        `Same SKU units Product Sales within 1-week of click` ,        `Other SKU units Product Sales within 1-week of click` ," +
                    "        user) SELECT  `Campaign Name`,            `Ad Group Name` ,        `Customer Search Term`," +
                    "                Keyword ,        `Match Type` ,        `First Day of Impression` ,        `Last Day of Impression` , " +
                    "        Impressions ,        Clicks ,        CTR ,        `Total Spend` ," +
                    "        `Average CPC`,        ACoS ,        Currency ,        `Orders placed within 1-week of a click` ," +
                    "        `Product Sales within 1-week of a click` ,        `Conversion Rate within 1-week of a click` ," +
                    "        `Same SKU units Ordered within 1-week of click` ,        `Other SKU units Ordered within 1-week of click` ," +
                    "        `Same SKU units Product Sales within 1-week of click` ,        `Other SKU units Product Sales within 1-week of click` ," +
                    "        user FROM " + table + "_copy where user=" + user,
                    function(err, results) {
                        if (err) {
                          return results.serverError(err);
                        }

                        sails.models.product.query("delete from " + table + "_copy where user=" + user, function(err, results) {
                            if (err) return results.serverError(err);
                            return results;
                        });
                    }
                );
            }
        });
    });
}

module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {
    reselect: function reselect(request, response) {
        var user = request.param('user');
        var query = 'SELECT DISTINCT p.id, ' +
            'p.average_selling_price,' +
            'p.amazon_FBA_fees, p.additional_per_unit_costs, p.total_shipping_costs, p.cost_per_unit, ' +
            'p.sku, p.asin, p.`product-name`, p.quantity, p.product_description,p.image_sm , p.image_med, p.image_big, p.allowed, p.price, p.url FROM  ' +
            'listing_reports_data p WHERE p.user=' + user + ' AND (sku IS NOT NULL AND sku <> \'\')';
        sails.models.product.query(query, function(err, results) {
            if (err) return response.serverError(err);
            return response.ok(results);
        });
    },
    check_cancelled: function check_cancelled(request, response) {
        var user = request.param('user');
        var query = 'SELECT s.id FROM subscriptions s, user u, mws m WHERE u.id=' + user + ' and m.user=u.id and m.subscription_id=s.id';
        sails.models.product.query(query, function(err, results) {
            if (err) {
                return response.ok({
                    status: 'cancelled'
                });
            } else {
                if (results.length < 1) {
                    return response.ok({
                        status: 'cancelled'
                    });
                } else {
                    chargebee.subscription.retrieve(results[0].id).request(function(error, result) {
                        if (error) {
                            return;
                        }
                        return response.ok({
                            status: result.subscription.status
                        });
                    });
                }
            }
        });
    },
    saveAmazonCode: function (request, response) {
        var user = request.param('user');
        var code = request.param('code');

        request1111.post({
            url: 'https://api.amazon.com/auth/o2/token',
            form: {
                grant_type: 'authorization_code',
                code: code,
                client_id: 'amzn1.application-oa2-client.f250e3787a2b4105bd5881a6d0f0e3a9',
                client_secret: '64a28c5a54bfed8a11832d73357452fbfe8b474bbf6f028ca4050263e0373ba2',
                redirect_uri: 'https://ppcentourage.com/amazon_callback'
            }
        }, function(err, httpResponse, body) {
            var obj = JSON.parse(body);
            if (obj.hasOwnProperty("refresh_token")) {
                sails.models.product.query('SELECT u.email FROM mws m, user u WHERE m.code = \'' + obj.refresh_token +
                    '\' AND m.country_id = (SELECT m.country_id from mws m WHERE m.user = ' + user + ') AND u.id = m.user', function(err, results5) {
                    if (err) {
                        sails.models.product.query('update mws set code=\'' + obj.refresh_token + '\' WHERE user=' + user, function(err, results) {
                            var child24 = exec('/usr/bin/php', ['/var/www/html/check_token.php', user]);

                            child24.stdout.on('data', function(data) {
                                var checkd = JSON.parse(data);
                                if (checkd['users'][user]) {
                                    // checking for duplicate token
                                    var query = 'SELECT u.email FROM mws m, user u WHERE m.profileId=(select profileId from mws where user=' + user + ') and m.profileId!=2314603341970157 AND m.user!=' + user + ' AND u.id=m.user';
                                    sails.models.product.query(query, function(err, results6) {
                                        if (err) {
                                            return response.ok({
                                                status: ''
                                            });
                                        } else {
                                            sails.models.product.query('update mws set code=NULL, profileId=NULL WHERE user=' + user, function(err, results7) {
                                                return response.ok({
                                                    status: "This token is already used with account " + results6[0].email
                                                });
                                            });
                                        }
                                    });
                                } else {
                                    console.log('Invalid token #1');
                                    console.log('User ID: ' + user);
                                    console.log('Refresh Token: ' + obj.refresh_token);
                                    sails.models.product.query('update mws set code = NULL WHERE user = ' + user, function () {
                                        return response.ok({
                                            status: "Token is invalid. Please Follow these steps  1) Click GET TOKEN  2) You will be redirected to Amazon. Log out of the current account by clicking (NOT your first name) located in the upper righthand side of the Amazon screen. 3) Now log into the correct account.  For example: If adding a UK account, use your Amazon UK credentials ( username/password) to log into Amazon to retrieve the correct token."
                                        });
                                    });
                                }
                            });
                        });
                    } else if (results5.length > 0) {
                        return response.ok({
                            status: "This token is already used with account " + results5[0].email
                        });
                    }

                    sails.models.product.query('update mws set code=\'' + obj.refresh_token + '\' WHERE user=' + user, function(err, results) {
                        var child24 = exec('/usr/bin/php', ['/var/www/html/check_token.php', user]);

                        child24.stdout.on('data', function(data) {
                            var checkd = JSON.parse(data);
                            if (checkd['users'][user]) {
                                // checking for duplicate token
                                sails.models.product.query('SELECT u.email FROM mws m, user u WHERE m.profileId=(select profileId from mws where user=' + user + ') AND m.user!=' + user + ' and m.profileId!=2314603341970157 AND u.id=m.user', function(err, results6) {
                                    if (err) {
                                        return response.ok({
                                            status: ''
                                        });
                                    } else {
                                        if (results6.length > 0) {
                                            sails.models.product.query('update mws set code=NULL, profileId=NULL WHERE user=' + user, function(err, results7) {
                                                return response.ok({
                                                    status: "This token is already used with account " + results6[0].email
                                                });
                                            });
                                        } else {
                                            return response.ok({
                                                status: ''
                                            });
                                        }
                                    }
                                });
                            } else {
                                console.log('Invalid token #2');
                                console.log('User ID: ' + user);
                                console.log('Refresh Token: ' + obj.refresh_token);
                                sails.models.product.query('update mws set code=NULL WHERE user=' + user, function(err, results) {
                                    return response.ok({
                                        status: "Token is invalid. Please Follow these steps  1) Click GET TOKEN  2) You will be redirected to Amazon. Log out of the current account by clicking (NOT your first name) located in the upper righthand side of the Amazon screen. 3) Now log into the correct account.  For example: If adding a UK account, use your Amazon UK credentials ( username/password) to log into Amazon to retrieve the correct token."
                                    });
                                });
                            }
                        });
                    });
                    // check if we have already this token
                });
            } else {
                console.log('Invalid token #3');
                console.log('User: ' + user);
                console.log(obj);
                response.ok({
                    status: "Token is invalid. Please Follow these steps  1) Click GET TOKEN  2) You will be redirected to Amazon. Log out of the current account by clicking (NOT your first name) located in the upper righthand side of the Amazon screen. 3) Now log into the correct account.  For example: If adding a UK account, use your Amazon UK credentials ( username/password) to log into Amazon to retrieve the correct token."
                });
            }
        });
    },

    update_subscription: function update_subscription(request, response) {
        var subscription_id = request.param('subscription_id');
        var new_plan = request.param('new_plan');

        // freemium upgrade
        // check for card_details
        chargebee.subscription.retrieve(subscription_id).request(
            function(error,result){
                if (error) {
                    return;
                }

                var subscription = result.subscription;
                var customer = result.customer;
                if (customer.card_status == 'no_card') {
                    // return - you need to update card
                    return response.serverError('No valid credit card present! Please update payment details in Profile/Billing menu');
                }

                chargebee.subscription.update(subscription_id, {
                    plan_id: new_plan
                }).request(function(error, result) {
                    if (error) {
                        return;
                    }

                    sails.models.product.query('update subscriptions set plan_id=\'' + new_plan + '\' where id=\'' + subscription_id + '\'', function(err, results1) {
                        sails.models.product.query('SELECT t.max_sku FROM subscriptions s, tariffs t WHERE s.id=\'' + subscription_id + '\' AND t.name=s.plan_id', function(err, results) {
                            if (err) {
                                return response.ok({
                                    max_sku: 0
                                });
                            }

                            if (results.length < 1) {
                                return response.ok({
                                    max_sku: 0
                                });
                            }
                            return response.ok({
                                max_sku: results[0].max_sku
                            });
                        });
                    });
                });
            });
    },
    load_tariffs_old: function load_tariffs(request, response) {
        var plan_id = request.param('plan_id');

        sails.models.product.query('SELECT * FROM tariffs t WHERE t.addon=2 and t.name=\'' + plan_id + '\'', function(err, results2) {
            if (plan_id === 'intlevel6') {
                return response.serverError('You cant upgrade/downgrade this tariff');
            }
            sails.models.product.query('SELECT * FROM tariffs t WHERE t.addon=2 order by t.id asc', function(err, results1) {
                var send_ok = [];
                for (var i = 0; i < 5; i++) {
                    if (results2[0].id < 16)
                        send_ok.push({
                            name: results1[i].name,
                            desc: results1[i].description + ' - $' + results1[i].price
                        });
                    else send_ok.push({
                        name: results1[i + 6].name,
                        desc: results1[i + 6].description + ' - $' + results1[i + 6].price
                    })
                }
                return response.ok(send_ok);
            });
        });
    },
    load_tariffs: function load_tariffs(request, response) {
        var parent_id = request.param('parent_id');
        var country_code = request.param('country_code');
        var query = 'SELECT t.max_sku FROM subscriptions s, user u, tariffs t WHERE u.id=' + parent_id + ' and s.customer_id=u.chargebee_id AND t.name=s.plan_id';

        sails.models.product.query(query, function(err, results) {
            if (err) {
                return response.ok({
                    max_sku: 0
                });
            }
            if (results.length < 1) {
                return response.ok({
                    max_sku: 0
                });
            }
            sails.models.product.query('SELECT * FROM tariffs t WHERE t.addon=2 order by t.id asc', function(err, results1) {
                var send_ok = [];

                for (var i = 0; i < 5; i++) {
                    if ((results1[i].max_sku <= results[0].max_sku && results1[i].max_sku != 0) || results[0].max_sku == 0) send_ok.push({
                        name: results1[i + 5].name,
                        desc: results1[i + 5].description + ' - $' + results1[i + 5].price
                    });
                    else send_ok.push({
                        name: results1[i].name,
                        desc: results1[i].description + ' - $' + results1[i].price
                    })
                }
                return response.ok(send_ok);
            });
        });
    },
    maxallowedSKUs: function maxallowedSKUs(request, response) {
        var user = request.param('user');
        var query = 'SELECT t.max_sku FROM subscriptions s, user u, tariffs t ' +
            'WHERE u.id = ' + user + ' and s.id = u.chargebee_id AND t.name = s.plan_id';
        sails.models.product.query(query, function(err, results) {
            var maxSku = 0;
            if (!err && results.length) {
                maxSku = results[0].max_sku;
            }
            return response.ok({
                max_sku: maxSku
            });
        });
    },
    check_token: function check_token(request, response) {
        var user = request.param('user');
        spawn('/usr/bin/php', ['/var/www/html/check_token.php ' + user], {
            stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        }).on('message', function(data) {
            return response.ok(data);
        });
    },
    delete_account: function delete_account(request, response) {
        var user = request.param('user');
        var subscription_id = request.param('subscription_id');

        //cancel subscription
        chargebee.subscription.delete(subscription_id).request(
            function(error, result) {
                {
                    // deleting from tables user, mws, subscriptions, listing, campaigns, searchterms, sales.
                    sails.models.product.query('DELETE FROM user WHERE user.id = ' + user, function(err, results) {
                        sails.models.product.query('DELETE FROM mws WHERE user = ' + user, function(err, results) {
                            sails.models.product.query('DELETE FROM subscriptions WHERE subscriptions.id = \'' + subscription_id + '\'', function(err, results) {
                                sails.models.product.query('DELETE FROM searchtermreport WHERE user =' + user, function(err, results) {
                                    sails.models.product.query('DELETE FROM campaignperfomancereport WHERE user =  ' + user, function(err, results) {
                                        sails.models.product.query('DELETE FROM listing_reports_data WHERE user = ' + user, function(err, results) {
                                            sails.models.product.query('DELETE FROM sales_reports_data WHERE user = ' + user, function(err, results) {
                                                return response.ok('ok');
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                }
            });
    },

    get_initial_skus: function get_initial_skus(request, response) {
        var user = request.param('user');
        //first round
        function function1() {
            child = exec('/usr/bin/php', ['/var/www/html/genReports1.php', '-60 days', user], {
                stdio: 'ignore', // piping all stdio to /dev/null
                detached: true
            }).unref();
            child1 = exec('/usr/bin/php', ['/home/ec2-user/webapp/ppc/robots/syncdata.php', user], {
                stdio: 'ignore', // piping all stdio to /dev/null
                detached: true
            }).unref();
            sails.models.product.query('UPDATE mws SET firsttime = 1 WHERE user = ' + user, function (err, results) {
                console.log('First round. User is ' + user);
                return response.ok({
                    user: user
                });
            });
        }

        function function2() {
            var child4 = exec('bash -c "exec nohup setsid /usr/bin/php /var/www/html/getReports1.php \"-60 days\" ' + user + ' > /dev/null 2>&1 &"', // command line argument directly in string
                function(error, stdout, stderr) { // one easy function to capture data/errors
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });
            var child2 = exec('bash -c "exec nohup setsid /usr/bin/php /home/ec2-user/webapp/ppc/robots/syncdata.php ' + user + ' > /dev/null 2>&1 &"', // command line argument directly in string
                function(error, stdout, stderr) { // one easy function to capture data/errors
                    var child3 = exec('bash -c "exec nohup setsid /usr/bin/php /home/ec2-user/webapp/ppc/robots/lookup.php ' + user + ' > /dev/null 2>&1 &"', // command line argument directly in string
                        function(error, stdout, stderr) { // one easy function to capture data/errors
                            return response.ok({
                                user: user
                            });
                        });
                });
        }
        function1();
    },
    addorreplace: function addorreplace(request, response) {
        var sellerID = request.param('SellerID');
        var MWSAuthToken = request.param('MWSAuthToken');
        var profit = request.param('profit');
        var acos = request.param('acos');
        var user = request.param('user');
        var country_code = request.param('country_id');
        var id = request.param('id');
        var parent_id = request.param('parent_id');
        var products = request.param('products');
        var subscription_id = request.param('subscription');

        // check for duplicates

        var isProductUpdated = false;

        if (typeof products === 'string' || products instanceof String) {
            isProductUpdated = true;
            var entr = JSON.parse(products);
            if (entr.winner) {
                // rewrite
                sails.models.product.query('update listing_reports_data set allowed=0 WHERE user=' + user, function(err, results) {
                    if (err) return response.serverError(err);
                    sails.models.product.query('update listing_reports_data SET allowed=1 where id=' + entr.id, function(err, results) {
                        return response.ok({
                            user: user
                        });
                    });
                });
            }
        } else if (typeof products != 'undefined') {
            sails.models.product.query('update mws SET firsttime=0 where user=' + user, function(err, results) {

                var winnerProducts = products.map(function(entry) {
                    return JSON.parse(entry);
                }).filter(function(entry) {
                    return entry.winner == true;
                });

                if (winnerProducts && winnerProducts.length > 0) {
                    var winnerProductIds = winnerProducts.map(function(entry) {
                        return entry.id;
                    }).join();

                    sails.models.product.query('update listing_reports_data set allowed= CASE WHEN id in (' + winnerProductIds + ') THEN 1 ELSE 0 END WHERE user=' + user, function (err, results) {
                        if (err) {
                            return response.serverError(err);
                        }
                        return response.ok({
                            user: user
                        });
                    });
                } else {
                  return response.ok({
                      user: user
                  });
                }
            });
        }

        if (typeof MWSAuthToken === 'undefined' || MWSAuthToken === null) MWSAuthToken = '';
        if (typeof sellerID === 'undefined' || sellerID === null) sellerID = '';
        if (typeof profit === 'undefined' || profit === null) profit = '';
        if (typeof acos === 'undefined' || acos === null) acos = '';

        sails.models.product.query('select * from mws where parent_id=' + parent_id, function(err, results3) {
            if (!results3 && user == 0) {
                user = parent_id;
                //no data present , creating
                sails.models.product.query('INSERT INTO mws SET parent_id=' + parent_id + ', subscription_id=\'' + subscription_id + '\',  country_id=\'' + country_code + '\', user=' + user + ',average_profit=' + profit + ', average_acos=' + acos + ', SellerID=\'' + sellerID + '\', MWSAuthToken=\'' + MWSAuthToken + '\'', function(err, results) {
                    var child241 = exec('/usr/bin/php', ['/home/ec2-user/webapp/ppc/robots/check_MWS.php', user]);
                    child241.on('exit', function () {
                        return response.ok({
                            user: user
                        });
                    });

                });
            } else {
                if (user == 0) {
                    sails.models.product.query('INSERT INTO user set username=\'tech\', chargebee_id=\'' + subscription_id + '\'', function(err, results) {
                        if (err) return response.serverError(err);
                        user = results.insertId;
                        if (parent_id == 0) parent_id = user;

                        //no data present , creating
                        sails.models.product.query('INSERT INTO mws SET parent_id=' + parent_id + ', subscription_id=\'' + subscription_id + '\',  country_id=\'' + country_code + '\', user=' + user + ',average_profit=' + profit + ', average_acos=' + acos + ', SellerID=\'' + sellerID + '\', MWSAuthToken=\'' + MWSAuthToken + '\'', function(err, results) {
                            var child241 = exec('/usr/bin/php', ['/home/ec2-user/webapp/ppc/robots/check_MWS.php', user]);
                            child241.on('exit', function () {
                                return response.ok({
                                    user: user
                                });
                            });
                        });
                    });
                } else {
                    sails.models.product.query('SELECT * FROM mws where user=' + user, function(err, results) {
                        if (err) return response.serverError(err);
                        if (typeof results[0] !== 'undefined' && results[0] !== null) {
                            var id1 = results[0].id;
                            //data present, updating
                            sails.models.product.query('UPDATE mws SET country_id=\'' + country_code + '\', subscription_id=\'' + subscription_id + '\',  average_profit=' + profit + ', average_acos=' + acos + ', SellerID=\'' + sellerID + '\', MWSAuthToken=\'' + MWSAuthToken + '\' WHERE id=' + id1, function(err, results) {
                                var child241 = exec('/usr/bin/php', ['/home/ec2-user/webapp/ppc/robots/check_MWS.php', user]);
                                child241.on('exit', function () {
                                    return response.ok({
                                        user: user
                                    });
                                });
                            });
                        } else {
                            //no data present , creating
                            sails.models.product.query('INSERT INTO mws SET country_id=\'' + country_code + '\', subscription_id=\'' + subscription_id + '\', user=' + user + ',average_profit=' + profit + ', average_acos=' + acos + ', SellerID=\'' + sellerID + '\', MWSAuthToken=\'' + MWSAuthToken + '\'', function(err, results) {
                                var child241 = exec('/usr/bin/php', ['/home/ec2-user/webapp/ppc/robots/check_MWS.php', user]);
                                child241.on('exit', function () {
                                    return response.ok({
                                        user: user
                                    });
                                });
                            });
                        }
                    });
                }
            }
        });
    },
    signup_continue: function (request, response) {
        var id = request.param('id');
        chargebee.hosted_page.retrieve(id).request(
            function(error, result) {
                if (error) {
                    return response.serverError(error);
                } else {
                    var hosted_page = result.hosted_page;

                    sails.models.product.query('select * from user_tmp where temp_id=\'' + id + '\'', function(err, results) {
                        results[0].identifier = results[0].username;
                        if (err) return response.serverError(err);

                        if (hosted_page.hasOwnProperty("content")) {
                            if (hosted_page.content.hasOwnProperty("customer")) {
                                sails.models.product.query('insert into user set chargebee_id=\'' + hosted_page.content.customer.id + '\',' +
                                    ' username=\'' + hosted_page.content.customer.email + '\', email=\'' + hosted_page.content.customer.email + '\', firstName=\'' +
                                    hosted_page.content.customer.first_name + '\', lastName=\'' + hosted_page.content.customer.last_name + '\', admin=0',
                                    function(err, results1) {
                                        if (err) {
                                            return response.serverError(err);
                                        }

                                        sails.models.product.query('insert into subscriptions set id=\'' + hosted_page.content.subscription.id + '\', customer_id=\'' +
                                            hosted_page.content.customer.id + '\', plan_id=\'' + hosted_page.content.subscription.plan_id + '\', plan_quantity=\'' +
                                            hosted_page.content.subscription.plan_quantity + '\', status=\'' + hosted_page.content.subscription.status + '\'',
                                            function(err, results3) {
                                                if (err) {
                                                    return response.serverError(err);
                                                }

                                                bcrypt.hash(results[0].password, 10, function callback(error, hash) {
                                                    var password = hash;

                                                    sails.models.product.query('insert into passport set protocol=\'local\', password=\'' + password + '\', user=' + results1.insertId, function(err, results2) {
                                                        if (err) return response.serverError(err);

                                                        sails.models.product.query('insert into mws set subscription_id = \'' + hosted_page.content.subscription.id + '\', user =' + results1.insertId +
                                                            ', parent_id=' + results1.insertId + ', country_id = \'' + results[0].country_id + '\'',
                                                            function(err, results5) {
                                                                if (err) {
                                                                    return response.serverError(err);
                                                                }

                                                                results[0].email = hosted_page.content.customer.email;
                                                                results[0].username = hosted_page.content.customer.email;
                                                                results[0].firstName = hosted_page.content.customer.first_name;
                                                                results[0].id = results1.insertId;
                                                                results[0].identifier = hosted_page.content.customer.email;
                                                                results[0].lastName = hosted_page.content.customer.last_name;
                                                                results[0].parent_user = results1.insertId;
                                                                results[0].chargebee_id = hosted_page.content.subscription.id;
                                                                results[0].chargebee_response = hosted_page.content;

                                                                return response.ok(results);
                                                            });
                                                    });
                                                });
                                            });
                                    });
                            }
                        }
                    });
                }
            });
    },

    user_status: function user_status(request, response) {
        var content = request.param('content');
        return response.ok('Ok');
    },

    add_new_plan: function add_new_plan(request, response) {
        var id = request.param('parent_id');
        var plan = request.param('plan');
        var country_code = request.param('country_code');

        sails.models.product.query('select chargebee_id from user where id=' + id, function(err, results) {
            if (err) return response.serverError(err);
            chargebee.subscription.create_for_customer(results[0].chargebee_id, {
                plan_id: plan
            }).request(function(error, result4) {
                if (error) {
                    return;
                }
                var subscription = result4.subscription.id;
                var customer = result4.customer.id;
                var plan_id = result4.subscription.plan_id;
                var status = result4.subscription.status;
                var trial_end = result4.subscription.trial_end;
                var plan_quantity = result4.subscription.plan_quantity;

                sails.models.product.query('insert into subscriptions set id=\'' + subscription + '\', customer_id=\'' + customer + '\', plan_id=\'' + plan_id + '\', plan_quantity=' + plan_quantity + ', status=\'' + status + '\'', function(err, results5) {
                    if (err) {
                        return response.serverError(err);
                    }

                    sails.models.product.query('INSERT INTO user set chargebee_id=\'' + subscription + '\', username=\'tech\', parent_user=' + id, function(err, results6) {
                        if (err) {
                            return response.serverError(err);
                        }

                        var user = results6.insertId;
                        var parent_id = id;

                        //no data present , creating
                        sails.models.product.query('INSERT INTO mws SET parent_id=' + parent_id + ', subscription_id=\'' + subscription + '\',  country_id=\'' + country_code + '\', user=' + user, function(err, results) {
                            // CHECK IF PARENT_ID BELONGS TO A LARGER ONE
                            sails.models.product.query('SELECT m.user, u.chargebee_id FROM mws m, subscriptions s, tariffs t, user u WHERE u.id=' + parent_id + ' and m.subscription_id=s.id AND s.plan_id=t.name AND m.parent_id=(SELECT parent_id FROM mws WHERE user=' + user + ') ORDER BY t.price DESC', function(err, results2) {
                                var first_item = results2[0].user;
                                var chargebee_id1 = results2[0].chargebee_id;
                                var full_list = results2.map(function(elem) {
                                    return elem.user;
                                }).join(",");

                                sails.models.product.query('update mws set parent_id=' + first_item + ' where user in (' + full_list + ')', function(err, results3) {
                                    sails.models.product.query('update user set chargebee_id=\'' + chargebee_id1 + '\' where user =' + first_item, function(err, results4) {
                                        return response.ok({
                                            subscription: subscription,
                                            user: user
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    },
    signup: function (request, response) {
        var firstname = request.param('firstname');
        var lastname = request.param('lastname');
        var identifier = request.param('identifier');
        var email = request.param('email');
        var password = request.param('password');
        var plan = request.param('plan');
        var country_id = request.param('country_id');

        var request_op = {
            token: "rZdgv4",
            event: "SignUp",
            customer_properties: {
                "$email": email
            },
            properties: {
                "Subscription": plan
            },
            time: Math.round(+new Date() / 1000)
        };

        var rata65_new = new Buffer(JSON.stringify(request_op)).toString('base64');

        https.get({
            hostname: 'a.klaviyo.com',
            path: '/api/track?data=' + rata65_new
        }, function(res) {
            // Do stuff with response
            sails.models.product.query('select count(*) as `count` from user where email LIKE "' + email + '"', function(err, results) {
                if (err) {
                    return response.serverError(err);
                }

                if (results[0].count > 0) {
                    return response.serverError({
                        message: 'The email address is already taken.'
                    });
                }

                if (plan == 'freemium') {
                    // freemium update
                    chargebee.subscription.create({
                        plan_id : plan,
                        customer: {
                            email: email
                        }
                    }).request(function(error,result){
                        if (error) {
                            return;
                        }

                        var subscription = result.subscription;
                        var customer = result.customer;
                        var card = result.card;
                        var invoice = result.invoice;

                        var query = 'INSERT INTO user set chargebee_id=\'' + result.customer.id + '\',' +
                            ' username=\'' + result.customer.email + '\', email=\'' + result.customer.email + '\', admin=0';

                        sails.models.product.query(query, function(err, results1) {
                            if (err) {
                                return response.serverError(err);
                            }

                            var query = 'INSERT INTO subscriptions set id=\'' + result.subscription.id + '\', customer_id=\'' +
                                result.customer.id + '\', plan_id=\'' + result.subscription.plan_id + '\', plan_quantity=\'' +
                                result.subscription.plan_quantity + '\', status=\'' + result.subscription.status + '\'';

                            sails.models.product.query(query, function(err, results3) {
                                if (err) {
                                    return response.serverError(err);
                                }

                                bcrypt.hash(password, 10, function callback(error, hash) {
                                    var password1 = hash;

                                    sails.models.product.query('INSERT INTO passport SET protocol=\'local\', password=\'' + password1 + '\', user=' + results1.insertId, function(err, results2) {
                                        if (err) return response.serverError(err);

                                        sails.models.product.query('INSERT INTO mws SET subscription_id = \'' + result.subscription.id + '\', user =' + results1.insertId +
                                            ', parent_id=' + results1.insertId + ', country_id = \'' + country_id + '\'',
                                            function(err, results5) {
                                                if (err) return response.serverError(err);

                                                results[0].email = result.customer.email;
                                                results[0].username = result.customer.email;
                                                results[0].firstName = '';
                                                results[0].id = results1.insertId;
                                                results[0].identifier = result.customer.email;
                                                results[0].lastName = '';
                                                results[0].parent_user = results1.insertId;
                                                results[0].chargebee_id = result.subscription.id;
                                                results[0].password = password;
                                                results[0].chargebee_response = result;

                                                return response.ok(results);
                                            });
                                    });
                                });
                            });
                        });
                    });
                } else {
                    chargebee.hosted_page.checkout_new({
                        subscription: {
                            plan_id: plan
                        },
                        customer: {
                            email: email,
                            first_name: firstname,
                            last_name: lastname
                        },
                        embed: false

                    }).request(function (error, result) {
                        if (error) {
                            return;
                        }

                        sails.models.product.query('insert into user_tmp set password=\'' + password + '\', temp_id=\'' + result.hosted_page.id + '\', username=\'' + identifier + '\', email=\'' + email + '\', firstName=\'' + firstname + '\', lastName=\'' + lastname + '\', admin=0, plan=\'' + plan + '\', country_id=\'' + country_id + '\'', function (err, results) {
                            if (err) return response.serverError(err);
                            return response.ok(result);
                        });
                    });
                }
            });
        });
    },
    getallowedskus: function getallowedskus(request, response) {
        var user = request.param('user');
        sails.models.product.query('select * from listing_reports_data where user=' + user + ' AND (sku IS NOT NULL AND sku <> \'\') and (allowed=1 or (SELECT t.max_sku FROM mws m, subscriptions s, tariffs t WHERE s.id=m.subscription_id and m.user=' + user + ' AND t.name=s.plan_id)=0)', function(err, results) {
            if (err) return response.serverError(err);
            return response.ok(results);
        });
    },
    getvalues: function (request, response) {
        var user = request.param('user');
        var query = 'SELECT * FROM mws m, subscriptions s, tariffs t ' +
            'WHERE m.subscription_id = s.id AND s.plan_id = t.name AND ' +
            'm.parent_id = (SELECT parent_id FROM mws WHERE user = ' + user + ')';
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
            sails.models.product.query('select * from mws where user=' + user, function(err, results) {
                if (results[0] == null) return response.send(400, {
                    result: false,
                    error: 'MWS data is not set. Please save MWS data before uploading'
                });
                if (err) return response.serverError(err);

                //if there was an error
                //stop here and tell the frontend
                if (err) return response.send(400, {
                    result: false,
                    error: err
                });

                //if the file didn't upload for some reason
                //stop here and tell the frontend
                if (!files) return response.send(400, {
                    result: false,
                    error: 'Unable to upload file'
                });

                var hasheader = true;
                var afields = ['`Campaign Name`',
                    '`Ad Group Name`',
                    '`Advertised SKU`',
                    'Keyword',
                    '`Match Type`',
                    '@`Start Date`',
                    '@`End Date`',
                    'Clicks',
                    'Impressions',
                    '@CTR',
                    '`Total Spend`',
                    '@`Average CPC`',
                    'Currency',
                    '`1-day Orders Placed`',
                    '`1-day Ordered Product Sales`',
                    '@`1-day Conversion Rate`',
                    '`1-day Same SKU Units Ordered`',
                    '`1-day Other SKU Units Ordered`',
                    '`1-day Same SKU Units Ordered Product Sales`',
                    '`1-day Other SKU Units Ordered Product Sales`',
                    '`1-week Orders Placed`',
                    '`1-week Ordered Product Sales`',
                    '@`1-week Conversion Rate`',
                    '`1-week Same SKU Units Ordered`',
                    '`1-week Other SKU Units Ordered`',
                    '`1-week Same SKU Units Ordered Product Sales`',
                    '`1-week Other SKU Units Ordered Product Sales`',
                    '`1-month Orders Placed`',
                    '`1-month Ordered Product Sales`',
                    '@`1-month Conversion Rate`',
                    '`1-month Same SKU Units Ordered`',
                    '`1-month Other SKU Units Ordered`',
                    '`1-month Same SKU Units Ordered Product Sales`',
                    '`1-month Other SKU Units Ordered Product Sales`'
                ];

                switch (results[0].country_id) {
                    case 'us':
                        var stdate = "'%m/%d/%Y %k:%i'";
                        break;
                    case 'jp':
                        var stdate = "'%Y/%m/%d %k:%i'";
                        break;
                    default:
                        var stdate = "'%d/%m/%Y %k:%i'";
                        break;
                }

                var setlist = "user=" + user + ", `Start Date` = str_to_date(@`Start Date`, " + stdate + "), `End Date` = str_to_date(@`End Date`, " + stdate + "), " +
                    "`Average CPC` = replace(@`Average CPC`, 'N/A', ''), CTR = replace(@CTR, '%', ''), " +
                    "`1-day Conversion Rate`= replace(@`1-day Conversion Rate`, '%', ''), `1-week Conversion Rate` = replace(@`1-week Conversion Rate`, '%', '')," +
                    "`1-month Conversion Rate` = replace(@`1-month Conversion Rate`, '%', '')";

                var filename = files[0].fd;
                var table = 'campaignperfomancereport';
                var delim = '\\t', // Разделитель полей в CSV файле
                    enclosed = '', // Кавычки для содержимого полей
                    escaped = '\\\\', // Ставится перед специальными символами
                    lineend = '\\r\\n';

                var imp = import_csv(
                    table, // Имя таблицы для импорта
                    afields, // Массив строк - имен полей таблицы
                    filename, // Имя CSV файла, откуда берется информация
                    // (путь от корня web-сервера)
                    delim, // Разделитель полей в CSV файле
                    enclosed, // Кавычки для содержимого полей
                    escaped, // Ставится перед специальными символами
                    lineend, // Чем заканчивается строка в файле CSV
                    hasheader,
                    setlist,
                    user,
                    results[0].country_id);

                response.send({
                    result: true,
                    files: files
                });
            });
        });
    },
    upload1: function(request, response) {
            var user = request.param('user');
            request.file('0').upload({
                maxBytes: 100 * 1024 * 1024
            }, function(err, files) {
                sails.models.product.query('select * from mws where user=' + user, function(err, results) {
                    if (results[0] == null) return response.send(400, {
                        result: false,
                        error: 'MWS data is not set. Please save MWS data before uploading'
                    });
                    //if there was an error
                    //stop here and tell the frontend
                    if (err) return response.send(400, {
                        result: false,
                        error: err
                    });

                    //if the file didn't upload for some reason
                    //stop here and tell the frontend
                    if (!files) return response.send(400, {
                        result: false,
                        error: 'Unable to upload file'
                    });

                    //Converter Class
                    //         var csv = require("fast-csv");
                    var fs = require("fs");

                    var hasheader = true;
                    var afields = ['`Campaign Name`',
                        '`Ad Group Name`',
                        '`Customer Search Term`',
                        'Keyword',
                        '`Match Type`',
                        '@`First Day of Impression`',
                        '@`Last Day of Impression`',
                        'Impressions',
                        'Clicks',
                        '@CTR',
                        '`Total Spend`',
                        '@`Average CPC`',
                        'ACoS',
                        'Currency',
                        '`Orders placed within 1-week of a click`',
                        '`Product Sales within 1-week of a click`',
                        '@`Conversion Rate within 1-week of a click`',
                        '`Same SKU units Ordered within 1-week of click`',
                        '`Other SKU units Ordered within 1-week of click`',
                        '`Same SKU units Product Sales within 1-week of click`',
                        '`Other SKU units Product Sales within 1-week of click`'
                    ];

                    switch (results[0].country_id) {
                        case 'us':
                            var stdate = "'%m/%d/%Y %k:%i'";
                            break;
                        case 'jp':
                            var stdate = "'%Y/%m/%d %k:%i'";
                            break;
                        default:
                            var stdate = "'%d/%m/%Y %k:%i'";
                            break;
                    }

                    var setlist = "user=" + user + ", `First Day of Impression` = str_to_date(@`First Day of Impression`, " + stdate + "), `Last Day of Impression` = str_to_date(@`Last Day of Impression`, " + stdate + "), " +
                        "`Average CPC` = replace(@`Average CPC`, 'N/A', ''), CTR = replace(@CTR, '%', ''), " +
                        "`Conversion Rate within 1-week of a click`= replace(@`Conversion Rate within 1-week of a click`, '%', '')";

                    var filename = files[0].fd;
                    var table = 'searchtermreport';
                    var delim = '\\t', // Разделитель полей в CSV файле
                        enclosed = '', // Кавычки для содержимого полей
                        escaped = '\\\\', // Ставится перед специальными символами
                        lineend = '\\r\\n';

                    var imp = import_csv(
                        table, // Имя таблицы для импорта
                        afields, // Массив строк - имен полей таблицы
                        filename, // Имя CSV файла, откуда берется информация
                        // (путь от корня web-сервера)
                        delim, // Разделитель полей в CSV файле
                        enclosed, // Кавычки для содержимого полей
                        escaped, // Ставится перед специальными символами
                        lineend, // Чем заканчивается строка в файле CSV
                        hasheader,
                        setlist,
                        user);

                    response.send({
                        result: true,
                        files: files
                    });
                });
            });
        }
});
