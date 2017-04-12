/**
 * Angular module for frontend.examples.about component. Basically this file contains actual angular module initialize
 * and route definitions for this module.
 */
(function() {
  'use strict';

  // Define frontend.public module
  angular.module('frontend.ppc.pchange', []);

  // Module configuration
  angular.module('frontend.ppc.pchange')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('ppc.pchange', {
            url: '/pchange',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/pchange/pchange.html',
                controller: 'PchangeController'
              },
              'pageNavigation@': false
            }
          });
      }
    ]);
}());
