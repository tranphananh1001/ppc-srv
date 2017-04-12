/**
 * Angular module for frontend.examples.about component. Basically this file contains actual angular module initialize
 * and route definitions for this module.
 */
(function() {
  'use strict';

  // Define frontend.public module
  angular.module('frontend.ppc.campaign', []);

  // Module configuration
  angular.module('frontend.ppc.campaign')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('ppc.campaign', {
            url: '/campaign',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/campaign/campaign.html',
                controller: 'CampaignController'
              },
              'pageNavigation@': false
            }
          })
          // Single campaign
          .state('ppc.campaigns', {
            url: '/ppc/campaigns/:id/:campaign',
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/campaign/singlecampaign.html',
                controller: 'SingleCampaignController'
              },
              'pageNavigation@': false
            }
          });
      }
    ])
    .directive('staticInclude', function($http, $templateCache, $compile) {
      return function(scope, element, attrs) {
        var templatePath = attrs.staticInclude;
        $http.get(templatePath, {
          cache: $templateCache
        }).success(function(response) {
          var contents = element.html(response).contents();
          $compile(contents)(scope);
        });
      };
    })
    .directive('cpStatus', function($http, $templateCache, $compile) {
      return {
        restrict : "A",
        scope: {
          status : '='
        },
        link: function(scope, elem, attr) {
          var dropdown = elem.find('.dropdown');
          elem.bind('click','.dropdown', function() {
            dropdown.toggleClass('dropdown-active');
            dropdown.addClass('active-recent');
          });
        },
        templateUrl: '/frontend/ppc/campaign/directives/partials/campaign-status.html',
        controller: function($scope){
          $scope.cpHandler = function (newStatus) {
            $scope.status = newStatus;
          }
        }
      };
    });
}());
