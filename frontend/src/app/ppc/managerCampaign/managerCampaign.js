/**
 * Angular module for frontend.examples.managerCampaign component. Basically this file contains actual angular module initialize
 * and route definitions for this module.
 */
(function() {
  'use strict';

  // Define frontend.public module
  angular.module('frontend.ppc.managerCampaign', []);

  // Module configuration
  angular.module('frontend.ppc.managerCampaign')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('ppc.managerCampaign', {
            url: '/managerCampaign',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/managerCampaign/managerCampaign.html',
                controller: 'ManagerCampaign'
              },
              'pageNavigation@': false
            }
          })
          // AD group list of Single campaign
          .state('ppc.managerCampaignSKU', {
            url: '/managerCampaignSKU/:id/:campaignname',
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/managerCampaign/managerCampaignSKU.html',
                controller: 'ManagerCampaignSKUController'
              },
              'pageNavigation@': false
            }
          })
          // New keywords list of Single AD group
          .state('ppc.managerCampaignSKUKeyword', {
            url: '/managerCampaignSKUKeyword/:user/:campaignname/:adgroupid',
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/managerCampaign/managerCampaignSKUKeyword.html',
                controller: 'ManagerCampaignSKUKeywordController'
              },
              'pageNavigation@': false
            },
            params: {
              'user': 'some default', 
              'campaignname': 'some default', 
              'adgroupid': 'some default'
            }
          });
      }
    ]);
}());
