/**
 * This file contains all necessary Angular controller definitions for 'frontend.ppc.product' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  // Controller to show single product on GUI.
  angular.module('frontend.ppc.echange')

  .controller('EchangeController', ['$rootScope', '$scope', '$state', '$stateParams',
    'UserService', 'MessageService', 'HomeModel', 'CampaignModel', 'SettingsModel', 'AuthService',
    'ListConfig', 'SocketHelperService', '$timeout',
    function($rootScope, $scope, $state, $stateParams,
      UserService, MessageService, HomeModel, CampaignModel, SettingsModel, AuthService,
      ListConfig, SocketHelperService, $timeout) {

      $scope.user = UserService.user();


      if ($rootScope.setUser > 0) {

        $scope.user.id = $rootScope.setUser;
      }

      $scope.save = function save() {
        if (($scope.email + '').length < 5) {
          MessageService.error("Please enter the vaild email.");
          return;
        }
        var curpwd = $scope.curpwd;
        var email = $scope.email;
        AuthService
          .echange(email, curpwd, $scope.user)
          .then(

            function successCallback() {},
            function errorCallback() {}
          );
      };
      var self = this;

      // Get our center id
      self.centerId = $stateParams.centerId;

    }
  ]);

}());
