/**
 * Messages component which is divided to following logical components:
 *
 *  Controllers
 *
 * All of these are wrapped to 'frontend.auth.login' angular module.
 */
(function() {
  'use strict';

  // Define frontend.auth.login angular module
  angular.module('frontend.core.auth.login', []);

  // Module configuration
  angular.module('frontend.core.auth.login')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          // Login
          .state('auth.login', {
            url: '/login',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/core/auth/login/login.html',
                controller: 'LoginController'
              }
            }
          })
          .state('auth.forgot', {
            url: '/forgot',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/core/auth/login/forgot.html',
                controller: 'LoginController'
              }
            }
          })
          .state('auth.chgpwd', {
            url: '/chgpwd',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/core/auth/login/chgpwd.html',
                controller: 'LoginController'
              }
            }
          })
          .state('auth.keyword-vs-searchterm', {
            url: '/keyword-vs-searchterm',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/core/auth/login/keyword-vs-searchterm.html',
                controller: 'LoginController'
              }
            }
          })
          .state('auth.signup', {
            url: '/signup',
            data: {
              access: 0
            },
            views: {
              'content@': {
                templateUrl: '/frontend/core/auth/login/signup.html',
                controller: 'LoginController'
              }
            }
          })
        ;
      }
    ])
  ;
}());
