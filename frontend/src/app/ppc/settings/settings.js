/**
 * Angular module for frontend.examples.about component. Basically this file contains actual angular module initialize
 * and route definitions for this module.
 */
(function() {
  'use strict';

  // Define frontend.public module
  angular.module('frontend.ppc.settings', []);

  // Module configuration
  angular.module('frontend.ppc.settings')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('ppc.settings', {
            url: '/settings',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/settings/settings.html',
                controller: 'SettingsController'
              },
              'pageNavigation@': false
            }
          });
      }
    ]);
}());
