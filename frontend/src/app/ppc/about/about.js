/**
 * Angular module for frontend.examples.about component. Basically this file contains actual angular module initialize
 * and route definitions for this module.
 */
(function() {
  'use strict';

  // Define frontend.public module
  angular.module('frontend.ppc.about', []);

  // Module configuration
  angular.module('frontend.ppc.about')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('ppc.about', {
            url: '/about',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/about/about.html'
              },
              'pageNavigation@': false
            }
          })
        ;
      }
    ])
  ;
}());
