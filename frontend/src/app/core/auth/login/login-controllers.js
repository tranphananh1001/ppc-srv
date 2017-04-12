(function() {
  'use strict';

  angular.module('frontend.core.auth.login')
    .controller('LoginController', [ '$scope',  '$rootScope', '$window', '$state',
      'SettingsModel', '$location', 'MessageService', 'AuthService', 'FocusOnService',
      function controller($scope, $rootScope, $window, $state,
        SettingsModel, $location, MessageService, AuthService, FocusOnService
      ) {

        if (AuthService.isAuthenticated()) {
          $state.go('ppc.home');
        }

        var id = $location.search().id;

        $scope.country_code = '';
        $scope.countries = ['us', 'gb', 'de', 'ca', 'fr', 'cn', 'es', 'in', 'it', 'mx'];

        $('#country').countrySelect({
          onlyCountries: $scope.countries,
        });

        if (id) {
          $rootScope.id = id;

          SettingsModel.signup_continue({id: id}).then(function (response) {
            $scope.credentials=response[0];

            fbq('track', 'Subscription', {
              Customer: response[0].chargebee_response.customer.first_name + ' ' + response[0].chargebee_response.customer.last_name,
              Email: response[0].chargebee_response.customer.email,
              Plan: response[0].chargebee_response.subscription.plan_id,
              Trial: response[0].chargebee_response.subscription.status == 'in_trial' ? 'YES' : 'NO',
            });

            AuthService
              .login($scope.credentials)
              .then(function () {
                $rootScope.initLogin();
                $state.go('ppc.settings');
              }, function () {
                _reset();
              });
          });
        }

        $scope.password1 = '';
        $scope.password2 = '';

        if ($location.search().email) {
          $scope.email = $location.url().split('=')[1].split('&')[0];
        }

        $scope.login = function login() {
          AuthService
            .login($scope.credentials)
            .then(function () {
              $rootScope.initLogin();
              $state.go('ppc.home');
            }, function () {
              _reset();
            });
        };

        $scope.forgot = function forgot() {
          $state.go('auth.forgot');
        };

        $scope.sendmail = function sendmail() {
          AuthService.sendmail($scope.email);
        };

        $scope.confirm = function () {
          if ($scope.password1 != $scope.password2) {
            MessageService.error('Password is not match.');
            return;
          }

          if (($scope.password1+'').length < 8) {
            MessageService.error('Password is too short.');
            return;
          }

          var email = $location.url().split('=')[1].split('&')[0];
          var hash = $location.url().split('=')[2];
          AuthService.chgpwd(email, $scope.password2, hash);
        };

        $scope.login_signup = function () {
          if (!String.validateEmailAddress($scope.credentials.email)) {
            MessageService.error('Please enter a valid email address.');
            return;
          }

          $scope.credentials.country_id = angular.element('#country_code').val();

          SettingsModel.signup($scope.credentials)
            .then(function (response) {
              if ($scope.credentials.plan != 'freemium') {
                $window.location.href = response.hosted_page.url;
              } else {
                $scope.credentials = response[0];

                fbq('track', 'Subscription', {
                  Customer: response[0].chargebee_response.customer.first_name + ' ' + response[0].chargebee_response.customer.last_name,
                  Email: response[0].chargebee_response.customer.email,
                  Plan: response[0].chargebee_response.subscription.plan_id,
                  Trial: response[0].chargebee_response.subscription.status == 'in_trial' ? 'YES' : 'NO',
                });

                AuthService
                  .login(response[0])
                  .then(function () {
                    $rootScope.initLogin();
                    $state.go('ppc.settings');
                  }, function () {
                    _reset();
                  });
              }
            });
        };

        $scope.signup = function () {
          $state.go('auth.signup');
        };

        /**
         * Private helper function to reset credentials and set focus to username input.
         *
         * @private
         */
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
    ]);
}());
