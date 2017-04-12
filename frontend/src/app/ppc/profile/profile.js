(function() {
  'use strict';

  // Define frontend.public module
  angular.module('frontend.ppc.profile', []);

  // Module configuration
  angular.module('frontend.ppc.profile')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('ppc.profile', {
            url: '/profile',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/profile/profile.html',
                controller: 'ProfileController'
              },
              'pageNavigation@': false
            }
          });
      }
    ]);
}());
