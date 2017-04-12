/**
 * Angular module for frontend.examples.about component. Basically this file contains actual angular module initialize
 * and route definitions for this module.
 */
(function() {
  'use strict';

  // Define frontend.public module
  angular.module('frontend.ppc.power', []);

  // Module configuration
  angular.module('frontend.ppc.power')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('ppc.power', {
            url: '/power',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/power/power.html',
                controller: 'PowerController'
              },
              'pageNavigation@': false
            }
          })
          // Single campaign
          .state('ppc.powers', {
            url: '/ppc/powers',
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/power/powers.html',
                controller: 'SinglePowerController'
              },
              'pageNavigation@': false
            }
          });
      }
    ])
  .filter('adgrouping', function () {
    return function(input, op1, op2) {
      var adGroups = input.split(',');
      adGroups = adGroups.map(function (item) {
        var options = item.split(';');
        return options[0].trim();
      });
      adGroups = adGroups.filter(function (item, pos) {
        return adGroups.indexOf(item) == pos;
      });
      return adGroups.join(',');
    }
  })
  ;
}());
