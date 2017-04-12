'use strict';

var _ = require('lodash');
var https = require('https');
var chargebee = require('chargebee');
var bcrypt = require('bcryptjs');
var config = require('../../config/local');

var tokenForRapidcrush = 'rapidcrush';
// var planForRapidcrush = config.environment === 'development' ? 'cbdemo_free' : 'freemium';
// var couponForRapidcrush = config.environment === 'development' ? 'cbdemo_oppvip' : 'OPPVIP';
var planForRapidcrush = 'freemium';
var couponForRapidcrush = 'OPPVIP';
var referralForRapidcrush = 'rapidcrush';

var ApiController = {
  signupFromPartner: function (request, response) {
    var result = {
      status: false,
    };

    // Check the Authorization header and token.
    var token = request.headers['authorization'];
    if (typeof token === 'undefined' || token !== 'Bearer ' + tokenForRapidcrush) {
      console.log('Token mismatch.');
      return response.json(401, result);
    }

    // Check if all required params are supplied.
    var requiredParams = ['email', 'password', 'country'];
    var isInvalid = false;
    _.each(requiredParams, function (name) {
      if (typeof request.param(name) === 'undefined') {
        isInvalid = true;
      }
    });

    if (isInvalid) {
      console.log('Required paramaters are missing.');
      result.code = 'MISSING_PARAMS';
      return response.json(400, result);
    }

    var email = request.param('email');
    var password = request.param('password');
    var country = request.param('country');
    var plan = planForRapidcrush;

    var payloadForTracking = {
      token: 'rZdgv4',
      event: 'SignUp',
      customer_properties: {
        '$email': email,
      },
      properties: {
        'Subscription': plan,
      },
      time: Math.round(+new Date() / 1000),
    };

    payloadForTracking = new Buffer(JSON.stringify(payloadForTracking)).toString('base64');

    https.get({
      hostname: 'a.klaviyo.com',
      path: '/api/track?data=' + payloadForTracking,
    }, function (res) {
      var queryForEmailDup = 'SELECT COUNT(*) AS `count` FROM user WHERE email LIKE "' + email + '"';
      sails.models.product.query(queryForEmailDup, function (err, res) {
        if (err) {
          console.log('Failed to retrieve user records from database.');
          return response.json(500, result);
        }

        if (res[0].count > 0) {
          console.log('The email address is already taken: ' + email);
          result.code = 'DUPLICATE_EMAIL';
          return response.json(400, result);
        }

        createAccount();
      });
    });

    function createAccount() {
      chargebee.configure(config.chargebee);

      chargebee.subscription.create({
        plan_id : plan,
        customer: {
          email: email,
        },
        coupon_ids: [couponForRapidcrush],
      }).request(function (err, res) {
        if (err) {
          console.log('Failed to create a chargebee subscription.');
          console.log(err);
          return response.json(500, result);
        }

        var customer = res.customer;
        var subscription = res.subscription;

        var queryForNewUser = 'INSERT INTO user SET chargebee_id = \'' + customer.id + '\', ' +
          'username = \'' + customer.email + '\', email = \'' + customer.email +
          '\', admin = 0, referral = \'' + referralForRapidcrush + '\'';

        sails.models.product.query(queryForNewUser, function (err, res) {
          if (err) {
            console.log('Failed to insert a new user record to database.');
            return response.json(500, result);
          }

          var userId = res.insertId;

          var queryForNewSubscription = 'INSERT INTO subscriptions SET id = \'' + subscription.id +
            '\', customer_id = \'' + customer.id + '\', plan_id = \'' + subscription.plan_id +
            '\', plan_quantity = \'' + subscription.plan_quantity + '\', status = \'' + subscription.status + '\'';

          sails.models.product.query(queryForNewSubscription, function (err, res) {
            if (err) {
              console.log('Failed to insert a new subscription record to database.');
              return response.json(500, result);
            }

            bcrypt.hash(password, 10, function (err, hash) {
              if (err) {
                console.log('Failed to encrypt password.');
                return response.json(500, result);
              }

              var queryForPassport = 'INSERT INTO passport SET protocol = \'local\', password = \'' + hash + '\', user = ' + userId;
              sails.models.product.query(queryForPassport, function (err, res) {
                if (err) {
                  console.log('Failed to insert a new passport record to database.');
                  return response.json(500, result);
                }

                var queryForMws = 'INSERT INTO mws SET subscription_id = \'' + subscription.id + '\', user = ' + userId +
                  ', parent_id = ' + userId + ', country_id = \'' + country + '\'';
                sails.models.product.query(queryForMws, function (err, res) {
                  if (err) {
                    console.log('Failed to insert a new mws record to database.');
                    return response.json(500, result);
                  }

                  result.status = true;
                  response.json(200, result);
                });
              });
            });
          });
        });
      });
    }
  },
};

module.exports = ApiController;
