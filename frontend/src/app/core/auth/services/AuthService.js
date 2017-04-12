/**
 * AuthService service which is used to authenticate users with backend server and provide simple
 * methods to check if user is authenticated or not.
 *
 * Within successfully login process service will store user data and JWT token to ngStorage where
 * those are accessible in the application.
 *
 * This service provides following methods:
 *
 *  AuthService.authorize(access)
 *  AuthService.isAuthenticated()
 *  AuthService.login(credentials)
 *  AuthService.logout()
 *
 * You can use this service fairly easy on your controllers and views if you like to. It's
 * recommend that you use this service with 'UserService' service in your controllers and
 * views.
 *
 * Usage example in controller:
 *
 *  angular
 *    .module('app')
 *    .controller('SomeController', [
 *      '$scope', 'AuthService', 'UserService',
 *      function ($scope, AuthService, UserService) {
 *        $scope.auth = AuthService;
 *        $scope.user = UserService.user;
 *      }
 *    ])
 *  ;
 *
 * Usage example in view:
 *
 *  <div data-ng-show="auth.isAuthenticated()">
 *      Hello, <strong>{{user().email}}</strong>
 *  </div>
 *
 * Happy coding!
 *
 * @todo  Revoke method?
 * @todo  Text localizations?
 */
(function() {
  'use strict';

  angular.module('frontend.core.auth.services')
    .factory('AuthService', [
      '$http', '$state', '$localStorage','$location',
      'AccessLevels', 'BackendConfig', 'MessageService',
      function factory(
        $http, $state, $localStorage,$location,
        AccessLevels, BackendConfig, MessageService
      ) {
        return {
          /**
           * Method to authorize current user with given access level in application.
           *
           * @param   {Number}    accessLevel Access level to check
           *
           * @returns {Boolean}
           */
          authorize: function authorize(accessLevel) {
            if (accessLevel === AccessLevels.user) {
              return this.isAuthenticated();
            } else if (accessLevel === AccessLevels.admin) {
              return this.isAuthenticated() && Boolean($localStorage.credentials.user.admin);
            } else {
              return accessLevel === AccessLevels.anon;
            }
          },

          /**
           * Method to check if current user is authenticated or not. This will just
           * simply call 'Storage' service 'get' method and returns it results.
           *
           * @returns {Boolean}
           */
          isAuthenticated: function isAuthenticated() {
            return Boolean($localStorage.credentials);
          },

          /**
           * Method make login request to backend server. Successfully response from
           * server contains user data and JWT token as in JSON object. After successful
           * authentication method will store user data and JWT token to local storage
           * where those can be used.
           *
           * @param   {*} credentials
           *
           * @returns {*|Promise}
           */
          login: function login(credentials) {
            return $http
              .post(BackendConfig.url + '/login', credentials, {withCredentials: true})
              .then(
                function(response) {
                  MessageService.success('You have been logged in.');

                  $localStorage.credentials = response.data;
                }
              )
            ;
          },
          signup: function signup(credentials) {
            return $http
              .post(BackendConfig.url + '/signup', credentials, {withCredentials: true})
              .then(
                function(response) {
                  MessageService.success('You have been signed up.');

                }
              )
              ;
          },

          /**
           * The backend doesn't care about actual user logout, just delete the token
           * and you're good to go.
           *
           * Question still: Should we make logout process to backend side?
           */
          logout: function logout() {
            $localStorage.$reset();

            MessageService.success('You have been logged out.');

            $state.go('auth.login');
          },

          sendmail: function sendmail(email){
            var data = {email: email, url:$location.home};

            return $http
              .post(BackendConfig.url+'/forgot',data,{withCredentials: true})
              .then(
                function(response){
                  if(response.data=='ok')
                    MessageService.success('Mail has been sent.');
                  else
                    MessageService.error("Mail Send Failed");
                }
              );
          },

          chgpwd: function (email, pwd, hash) {
            return $http
              .get(BackendConfig.url+'/chgpwd?email='+email+'&pwd='+pwd+'&hash='+hash, {withCredentials: true})
              .then(
                function(response){
                  if(response.data=='ok'){
                    MessageService.success('Password has been changed');
                    $state.go('auth.login');
                  }
                  if(response.data=='no email')
                    MessageService.error('User invalid');
                  if(response.data=='user ex')
                    MessageService.error('Timed out');
                }
              );
          },

          pchange: function pchange(oldpwd, newpwd, user){
            var data = {oldpwd: oldpwd,newpwd: newpwd, user: user};
            return $http
              .post(BackendConfig.url+'/pchange',data,{withCredentials: true})
              .then(
                function(response){
                  if(response.data=='ok')
                    MessageService.success('Password has been successfully changed.');
                  else if(response.data=='notp')
                    MessageService.error('Old password is not match.');
                  else if(response.data=='token')
                    MessageService.error('Server passport error.');
                  else
                    MessageService.error("Failed");
                }
              );
          },

          echange: function echange(email, curpwd, user){
            var data = {email: email, curpwd: curpwd, user: user};
            return $http
              .post(BackendConfig.url+'/echange',data,{withCredentials: true})
              .then(
                function(response){
                  if(response.data=='ok')
                    MessageService.success('Your email has been successfully changed.');
                  else if(response.data=='notp')
                    MessageService.error('Password is not match.');
                  else if(response.data=='token')
                    MessageService.error('Server passport error.');
                  else
                    MessageService.error("Failed");
                }
              );
          }

        };
      }
    ])
  ;
}());
