(function () {
  'use strict';

  // Controller to show single product on GUI.
  angular.module('frontend.ppc.profile')
    .controller('ProfileController', ['$rootScope', '$scope', '$state', '$stateParams', '$sce', 'UserService',
      function ($rootScope, $scope, $state, $stateParams, $sce, UserService) {
        $scope.user = UserService.user();

        $scope.trustSrc = function (src) {
          return $sce.trustAsResourceUrl(src);
        };

        $scope.portal = {
          src: 'https://ppcentourage.com:8080/portal.php?chargebee_id=' + $scope.user.chargebee_id,
          title: "Egghead.io AngularJS Binding"
        };

        this.centerId = $stateParams.centerId;
      }]);
}());
