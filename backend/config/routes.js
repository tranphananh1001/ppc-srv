'use strict';

/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */
module.exports.routes = {
  // See https://github.com/balderdashy/sails/issues/2062
  'OPTIONS /*': function(req, res) {
    res.send(200);
  },

  // Authentication routes
  'GET /keyword-vs-searchterm': 'https://ppcentourage.forumbee.com/t/k966dk/the-difference-between-keywords-and-search-terms',
  'GET /profitmargin': 'https://ppcentourage.forumbee.com/t/q568bf/how-to-determine-your-acos-profit-zone-and-profit-margins',
  'GET /negativekeywords': 'https://ppcentourage.forumbee.com/t/m2688x/negative-keywordshow-to-drastically-reduce-needless-ad-spend',
  '/logout': 'AuthController.logout',
  'POST /login': 'AuthController.callback',
  'POST /forgot': 'ForgotController.sendmail',
  'POST /pchange': 'ForgotController.pchange',
  'POST /echange': 'ForgotController.echange',
  'GET /chgpwd': 'ForgotController.chgpwd',
  'POST /signup': 'SettingsController.signup',
  'POST /login/:action': 'AuthController.callback',
  'POST /auth/local': 'AuthController.callback',
  'POST /auth/local/:action': 'AuthController.callback',
  'post /api/uploads':"SettingsController.upload",
  'post /api/uploads1':"SettingsController.upload1",
  'post /api/upload_keywords': "CampaignController.upload_keywords",
  'post /api/uploadphoto':"ProductController.upload",

  'POST /api/signup-from-partner': 'ApiController.signupFromPartner',
};
