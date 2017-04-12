/**
 * Angular module for frontend.examples.about component. Basically this file contains actual angular module initialize
 * and route definitions for this module.
 */
(function() {
  'use strict';

  // Define frontend.public module
  angular.module('frontend.ppc.home', []);

  // Module configuration
  angular.module('frontend.ppc.home')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('ppc.home', {
            url: '/home',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/home/home.html',
                controller: 'HomeController'
              },
              'pageNavigation@': false
            }
          })
        ;
      }
    ])
  ;
}());
