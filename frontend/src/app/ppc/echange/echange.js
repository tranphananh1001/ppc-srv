/**
 * Angular module for frontend.examples.about component. Basically this file contains actual angular module initialize
 * and route definitions for this module.
 */
(function() {
  'use strict';

  // Define frontend.public module
  angular.module('frontend.ppc.echange', []);

  // Module configuration
  angular.module('frontend.ppc.echange')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('ppc.echange', {
            url: '/echange',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/echange/echange.html',
                controller: 'EchangeController'
              },
              'pageNavigation@': false
            }
          })
        ;
      }
    ])
  ;
}());
