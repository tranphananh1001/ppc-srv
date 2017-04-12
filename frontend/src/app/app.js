/**
 * Frontend application definition.
 *
 * This is the main file for the 'Frontend' application.
 */
(function() {
  'use strict';

  // Create frontend module and specify dependencies for that
  angular.module('frontend', [
    'frontend-templates',
    'frontend.core',
    'frontend.ppc',
    'frontend.admin'
  ]);

  /**
   * Configuration for frontend application, this contains following main sections:
   *
   *  1) Configure $httpProvider and $sailsSocketProvider
   *  2) Set necessary HTTP and Socket interceptor(s)
   *  3) Turn on HTML5 mode on application routes
   *  4) Set up application routes
   */
  angular.module('frontend')
    .config([
      '$stateProvider', '$locationProvider', '$urlRouterProvider', '$httpProvider', '$sailsSocketProvider',
 //     '$tooltipProvider',
      'cfpLoadingBarProvider',
      'toastrConfig',
      'AccessLevels',
      function config(
        $stateProvider, $locationProvider, $urlRouterProvider, $httpProvider, $sailsSocketProvider,
  //      $tooltipProvider,
        cfpLoadingBarProvider,
        toastrConfig,
        AccessLevels
      ) {
        $httpProvider.defaults.useXDomain = true;

        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // Add interceptors for $httpProvider and $sailsSocketProvider
        $httpProvider.interceptors.push('AuthInterceptor');
        $httpProvider.interceptors.push('ErrorInterceptor');

        // Iterate $httpProvider interceptors and add those to $sailsSocketProvider
        angular.forEach($httpProvider.interceptors, function iterator(interceptor) {
          $sailsSocketProvider.interceptors.push(interceptor);
        });

        // Set tooltip options
 //       $tooltipProvider.options({
 //         appendToBody: true
 //       });

        // Disable spinner from cfpLoadingBar
        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.latencyThreshold = 200;

        // Extend default toastr configuration with application specified configuration
        angular.extend(
          toastrConfig,
          {
            allowHtml: true,
            closeButton: true,
            extendedTimeOut: 3000
          }
        );

        // Yeah we wanna to use HTML5 urls!
        $locationProvider
          .html5Mode({
            enabled: true,
            requireBase: false
          })
          .hashPrefix('!')
        ;

        //    $urlRouterProvider.when('keyword-vs-searchterm', 'https://ppcentourage.forumbee.com/t/k966dk/the-difference-between-keywords-and-search-terms');
        $stateProvider
          .state('keyword-vs-searchterm', {
            url: '/keyword-vs-searchterm',
            template: '<iframe src="https://ppcentourage.forumbee.com/t/k966dk/the-difference-between-keywords-and-search-terms"></iframe>'
          })
        ;
        // Routes that needs authenticated user
        /*
        $stateProvider
          .state('profile', {
            abstract: true,
            template: '<ui-view/>',
            data: {
              access: AccessLevels.user
            }
          })
          .state('profile.edit', {
            url: '/profile',
            templateUrl: '/frontend/ppc/profile/profile.html',
            controller: 'ProfileController'
          })
        ;
         */
        // Main state provider for frontend application
        $stateProvider
          .state('frontend', {
            abstract: true,
            views: {
              header: {
                templateUrl: '/frontend/core/layout/partials/header.html',
                controller: 'HeaderController'
              },
              footer: {
                templateUrl: '/frontend/core/layout/partials/footer.html',
                controller: 'FooterController'
              }
            }
          })
        ;

        // For any unmatched url, redirect to /about
        $urlRouterProvider.otherwise('/login');
      }
    ])
  ;

  /**
   * Frontend application run hook configuration. This will attach auth status
   * check whenever application changes URL states.
   */
  angular.module('frontend')
    .run([
      '$rootScope', '$state', '$injector',
      'editableOptions',
      'AuthService',
      function run(
        $rootScope, $state, $injector,
        editableOptions,
        AuthService
      ) {
        // Set usage of Bootstrap 3 CSS with angular-xeditable
        editableOptions.theme = 'bs3';

        /**
         * Route state change start event, this is needed for following:
         *  1) Check if user is authenticated to access page, and if not redirect user back to login page
         */
        $rootScope.$on('$stateChangeStart', function stateChangeStart(event, toState) {
          if (!AuthService.authorize(toState.data.access)) {
            event.preventDefault();

            $state.go('auth.login');
          }
        });

        // Check for state change errors.
        $rootScope.$on('$stateChangeError', function stateChangeError(event, toState, toParams, fromState, fromParams, error) {
          event.preventDefault();

          $injector.get('MessageService')
            .error('Error loading the page');

          $state.get('error').error = {
            event: event,
            toState: toState,
            toParams: toParams,
            fromState: fromState,
            fromParams: fromParams,
            error: error
          };

          return $state.go('error');
        });

        $rootScope.encodeURL = function(name) {
          return name.replace(/\./g, '%2E');
        };
        $rootScope.decodeURL = function(name) {
          name = name.replace(/%2E/g, '.');
          return name;
        };
      }
    ])
  ;
}());

$(function() {
  $.extend($.fn.dataTable.defaults, {
    destroy: true,
  });

  $('.chosefile input').change(function(event) {
    /* Act on the event */
    var nameFile = $(this).val();
    $(this).parent().find('.filename').text(nameFile);
    return false;
  });

  // if ($('body').width() < 1400) {
  //   setTimeout(function(){
  //     $("table").wrap("<div class='table-responsive'></div>");
  //   },1500);
  // }
});
$(document).on('click', '.js-close-filter', function(event) {
  event.preventDefault();
  /* Act on the event */
  $(this).parents('.collapse').removeClass('in');
});



$(document).on('click.modal', 'a[rel="modal:close"]', function(event) {
  event.preventDefault();
  var modalBlock = $(this).parents('.modall');
  $('.modalbgblock').remove();
  modalBlock.find('.close-modal').remove();
  modalBlock.hide();
});

$(document).on('click.modal', '.modalbgblock', function(event) {
  event.preventDefault();
  var idHref = $(this).data('modalblock'),
      modalBlock = $('#modall');
  $('.modalbgblock').remove();
  modalBlock.find('.close-modal').remove();
  modalBlock.hide();
});

$(document).on('click.modal', 'a[rel="modal:open"]', function(event) {
  event.preventDefault();
  var bgModal = $('<span class="modalbgblock"></span>'),
      modalClose = $('<a href="#close-modal" rel="modal:close" class="close-modal"></a>'),
      modalBlock = $('<div id="modall" class="popover modall"><h3 class="popover-title">'+$(this).attr('title')+'</h3><div class="popover-content">'+$(this).data('content')+'</div></div>');
  $('body').append(bgModal);
  modalBlock.append(modalClose);
  $('body').append(modalBlock);
  modalBlock.show();
});
