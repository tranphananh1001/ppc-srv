
(function() {
  'use strict';

  angular.module('frontend.core.auth.login')
    .controller('ForgotController', [
      '$scope', '$window', '$state','SettingsModel','$location','MessageService',
      'AuthService', 'FocusOnService', 'Forgot',
      function controller(
        $scope, $window, $state,SettingsModel,$location,MessageService,
        AuthService, FocusOnService, Forgot
      ) {

        if (AuthService.isAuthenticated()) {
          $state.go('ppc.home');
        }
        var id = $location.search().id;

        if (id) {
          SettingsModel.signup_continue({id: id}).then(function (response) {

            $scope.credentials=response[0];

             AuthService
             .login($scope.credentials)
             .then(
               function successCallback() {
                $state.go('ppc.home');
               },
               function errorCallback() {
                _reset();
               }
             );
          });

        }
        $scope.sendmail = function sendmail(){
          Forgot
           .sendmail("asd")
           .then(
              function successCallback(){
              },
              function errorCallback(){
              }
            );
        };
        function _reset() {
          FocusOnService.focus('username');

          // Initialize credentials
          $scope.credentials = {
            identifier: '',
            password: ''
          };
        }
        _reset();
      }
    ])
  ;
}());
