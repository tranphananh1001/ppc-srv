/**
 * Angular module for frontend.examples.about component. Basically this file contains actual angular module initialize
 * and route definitions for this module.
 */
(function () {
  'use strict';

  // Define frontend.public module
  angular.module('frontend.amazon_callback', []);

  // Module configuration
  angular.module('frontend.amazon_callback')
    .config([
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('amazon_callback', {
            url: '/amazon_callback',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/amazon_callback/amazon_callback.html',
                controller: 'Amazon_callbackController'
              },
              'pageNavigation@': false
            }
          })
        ;
      }
    ])
  ;
}());
