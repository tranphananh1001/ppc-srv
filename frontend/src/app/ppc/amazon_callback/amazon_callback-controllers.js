/**
 * This file contains all necessary Angular controller definitions for 'frontend.ppc.product' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  // Controller to show single product on GUI.
  angular.module('frontend.amazon_callback')

    .controller('Amazon_callbackController', ['$rootScope', '$scope', '$state', '$stateParams', '$location', 'SettingsModel',
      'UserService'
      , function ($rootScope, $scope, $state, $stateParams, $location, SettingsModel,
                  UserService) {

        $scope.user = UserService.user();

        $rootScope.code = $location.search()['code'];

        SettingsModel.saveAmazonCode({
          user: $scope.user.id,
          code: $rootScope.code

        })
          .then(
            function onSuccess(response) {

$rootScope.token_status=response.status;
              $state.go('ppc.settings');

            });
      }])
  ;

}());
