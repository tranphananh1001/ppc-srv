(function () {
  'use strict';

  // Controller to show single product on GUI.
  angular.module('frontend.ppc.pchange')
    .controller('PchangeController', ['$rootScope', '$scope', '$state', '$stateParams',
      'UserService', 'MessageService', 'HomeModel', 'CampaignModel', 'SettingsModel','AuthService',
      'ListConfig', 'SocketHelperService', 'DTOptionsBuilder', '$timeout'
      , function ($rootScope, $scope, $state, $stateParams,
                  UserService, MessageService, HomeModel, CampaignModel, SettingsModel,AuthService,
                  ListConfig, SocketHelperService, DTOptionsBuilder, $timeout) {

        $scope.user = UserService.user();

        if ($rootScope.setUser > 0) {
          $scope.user.id = $rootScope.setUser;
        }

        $scope.save = function save(){
          if($scope.newpwd1 != $scope.newpwd2){
            MessageService.error("Password is not match");
            return;
          }
          if(($scope.newpwd1+'').length<8){
            MessageService.error("Password is too short.");
            return;
          }
          var oldpwd = $scope.oldpwd;
          var newpwd = $scope.newpwd1;
          AuthService
            .pchange(oldpwd, newpwd, $scope.user)
            .then(
              function successCallback(){
              },
              function errorCallback(){
              }
            );
        };

        // Get our center id
        this.centerId = $stateParams.centerId;
      }]);
}());
